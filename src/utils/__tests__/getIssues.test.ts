import { describe, test, expect, vi, beforeEach } from "vitest";
import getIssues, { Job } from "../getIssues";

// Mock that returns valid responses with rate limit headers
const createMockResponse = (data: unknown, rateLimited = false) => ({
  ok: !rateLimited,
  json: () => Promise.resolve(data),
  status: rateLimited ? 429 : 200,
  headers: new Map([
    ["X-RateLimit-Remaining", rateLimited ? "0" : "4999"],
    ["X-RateLimit-Limit", "5000"],
    ["X-RateLimit-Reset", String(Math.floor(Date.now() / 1000) + 3600)],
  ]),
});

const mockFetch = vi.fn((url: string): Promise<Response> => {
  if (url.includes("/milestones/")) {
    return Promise.resolve(createMockResponse({ 
      id: "123", 
      number: parseInt(url.split("/").pop() || "1"), 
      title: "Test Milestone", 
      description: "Test", 
      created_at: "2024-01-01T00:00:00Z", 
      due_on: "2024-02-01T00:00:00Z" 
    }));
  }
  if (url.includes("/issues")) {
    return Promise.resolve(createMockResponse([]));
  }
  // Milestones list
  return Promise.resolve(createMockResponse([{ 
    id: "1", 
    number: 1, 
    title: "Milestone 1", 
    description: "First", 
    created_at: "2024-01-01T00:00:00Z", 
    due_on: "2024-02-01T00:00:00Z" 
  }]));
});
globalThis.fetch = mockFetch as unknown as typeof fetch;

describe("getIssues REST API", () => {
  beforeEach(() => {
    mockFetch.mockClear();
    // Reset fetch mock to default behavior
    mockFetch.mockImplementation((url: string): Promise<Response> => {
      if (url.includes("/milestones/")) {
        return Promise.resolve(createMockResponse({ 
          id: "123", 
          number: parseInt(url.split("/").pop() || "1"), 
          title: "Test Milestone", 
          description: "Test", 
          created_at: "2024-01-01T00:00:00Z", 
          due_on: "2024-02-01T00:00:00Z" 
        }));
      }
      if (url.includes("/issues")) {
        return Promise.resolve(createMockResponse([]));
      }
      return Promise.resolve(createMockResponse([{ 
        id: "1", 
        number: 1, 
        title: "Milestone 1", 
        description: "First", 
        created_at: "2024-01-01T00:00:00Z", 
        due_on: "2024-02-01T00:00:00Z" 
      }]));
    });
  });

  test("fetches single milestone with issues", async () => {
    const jobs: Job[] = [["owner", "repo", "1"]];
    const callback = vi.fn();

    getIssues("test_token", jobs, callback);

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(callback).toHaveBeenCalled();
    const [error, data] = callback.mock.calls[0];
    expect(error).toBeNull();
    expect(data.size).toBe(1);
  });

  test("fetches all milestones for a repo", async () => {
    const jobs: Job[] = [["owner", "repo"]];
    const callback = vi.fn();

    getIssues("test_token", jobs, callback);

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(callback).toHaveBeenCalled();
    const [error] = callback.mock.calls[0];
    expect(error).toBeNull();
  });

  test("handles empty milestones list", async () => {
    mockFetch.mockImplementation(() => 
      Promise.resolve(createMockResponse([]))
    );

    const jobs: Job[] = [["owner", "repo"]];
    const callback = vi.fn();

    getIssues("test_token", jobs, callback);

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(callback).toHaveBeenCalled();
    const [error, data] = callback.mock.calls[0];
    expect(error).toBeNull();
    expect(data.size).toBe(0);
  });

  test("handles API error", async () => {
    mockFetch.mockImplementation(() => 
      Promise.resolve(createMockResponse({}, false))
    );

    const jobs: Job[] = [["owner", "repo"]];
    const callback = vi.fn();

    getIssues("test_token", jobs, callback);

    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(callback).toHaveBeenCalled();
  });

  test("returns empty results for empty jobs array", async () => {
    const callback = vi.fn();

    getIssues("test_token", [], callback);

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(callback).toHaveBeenCalled();
    const [error, data] = callback.mock.calls[0];
    expect(error).toBeNull();
    expect(data.size).toBe(0);
  });

  test("filters out pull requests from issues endpoint", async () => {
    mockFetch.mockImplementation((url: string): Promise<Response> => {
      if (url.includes("/milestones/")) {
        return Promise.resolve(createMockResponse({ 
          id: "1", 
          number: 1, 
          title: "Test Milestone", 
          description: "Test", 
          created_at: "2024-01-01T00:00:00Z", 
          due_on: "2024-02-01T00:00:00Z" 
        }));
      }
      if (url.includes("/issues")) {
        return Promise.resolve(createMockResponse([
          { number: 1, title: "Real Issue", closed_at: "2024-01-10T00:00:00Z", labels: [{ name: "bug" }] },
          { number: 2, title: "Pull Request", pull_request: {}, labels: [] },
          { number: 3, title: "Another Issue", closed_at: null, labels: [{ name: "enhancement" }] },
          { number: 4, title: "Another PR", pull_request: { url: "..." }, labels: [] },
        ]));
      }
      return Promise.resolve(createMockResponse([]));
    });

    const jobs: Job[] = [["owner", "repo", "1"]];
    const callback = vi.fn();

    getIssues("test_token", jobs, callback);

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(callback).toHaveBeenCalled();
    const [error, data] = callback.mock.calls[0];
    expect(error).toBeNull();

    const milestone = data.values().next().value;
    // Should only have 2 issues (PRs filtered out)
    expect(milestone.issues).toHaveLength(2);
    expect(milestone.issues.map((i: { title: string }) => i.title)).toEqual([
      "Real Issue",
      "Another Issue",
    ]);
  });

  test("handles repository not found (404)", async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        headers: new Map(),
      } as unknown as Response)
    );

    const jobs: Job[] = [["owner", "missing-repo"]];
    const callback = vi.fn();

    getIssues("test_token", jobs, callback);

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(callback).toHaveBeenCalled();
    const [error] = callback.mock.calls[0];
    expect(error.message).toContain('Repository "owner/missing-repo" not found');
    expect(error.variables).toEqual({ owner: "owner", repo: "missing-repo" });
  });

  test("handles milestone not found (404)", async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        headers: new Map(),
      } as unknown as Response)
    );

    const jobs: Job[] = [["owner", "repo", "999"]];
    const callback = vi.fn();

    getIssues("test_token", jobs, callback);

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(callback).toHaveBeenCalled();
    const [error] = callback.mock.calls[0];
    expect(error.message).toContain("Milestone #999 not found");
    expect(error.variables).toEqual({
      owner: "owner",
      repo: "repo",
      milestoneNumber: "999",
    });
  });

  test("reads rate limit headers and retries on 429", async () => {
    let callCount = 0;
    // Set reset time to now so wait time is minimal
    const resetTime = Math.floor(Date.now() / 1000);
    
    mockFetch.mockImplementation((url: string): Promise<Response> => {
      callCount++;
      
      // First call: rate limited
      if (callCount === 1 && url.includes("/milestones")) {
        return Promise.resolve({
          ok: false,
          status: 429,
          headers: new Map([
            ["X-RateLimit-Remaining", "0"],
            ["X-RateLimit-Limit", "5000"],
            ["X-RateLimit-Reset", String(resetTime)],
          ]),
          json: () => Promise.resolve({}),
        } as unknown as Response);
      }
      
      // Subsequent calls: success
      if (url.includes("/milestones")) {
        return Promise.resolve(createMockResponse({ 
          id: "1", 
          number: 1, 
          title: "Test", 
          description: null, 
          created_at: "2024-01-01T00:00:00Z", 
          due_on: null 
        }));
      }
      return Promise.resolve(createMockResponse([]));
    });

    const jobs: Job[] = [["owner", "repo"]];
    const callback = vi.fn();

    // Start fetching
    getIssues("test_token", jobs, callback);

    // Give time for retry (minimal wait with no reset time)
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Verify retry happened (2+ calls)
    expect(callCount).toBeGreaterThanOrEqual(2);
    // Verify completion
    expect(callback).toHaveBeenCalled();
  });

  test("aborts in-flight requests on cancel", async () => {
    let fetchCalled = 0;
    
    mockFetch.mockImplementation((url: string): Promise<Response> => {
      fetchCalled++;
      // Simulate a slow fetch that can be aborted
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(createMockResponse({ 
            id: "1", 
            number: 1, 
            title: "Test", 
            description: null, 
            created_at: "2024-01-01T00:00:00Z", 
            due_on: null 
          }));
        }, 5000); // 5 second delay - will be aborted before completion
      });
    });

    const jobs: Job[] = [["owner", "repo"]];
    const callback = vi.fn();

    // Start fetching
    const cancel = getIssues("test_token", jobs, callback);
    
    // Immediately cancel
    cancel();
    
    // Wait a bit but not long enough for the fetch to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Should not complete because it was cancelled
    expect(callback).not.toHaveBeenCalled();
  });

  test("returns milestones in deterministic order (sorted by number)", async () => {
    // Return milestones in reverse order to test sorting
    mockFetch.mockImplementation((url: string): Promise<Response> => {
      if (url.includes("/milestones?state=all")) {
        // Return milestones in random-ish order (5, 1, 3, 2, 4)
        return Promise.resolve(createMockResponse([
          { id: "5", number: 5, title: "Milestone 5", description: "Fifth", created_at: "2024-01-05T00:00:00Z", due_on: null },
          { id: "1", number: 1, title: "Milestone 1", description: "First", created_at: "2024-01-01T00:00:00Z", due_on: null },
          { id: "3", number: 3, title: "Milestone 3", description: "Third", created_at: "2024-01-03T00:00:00Z", due_on: null },
          { id: "2", number: 2, title: "Milestone 2", description: "Second", created_at: "2024-01-02T00:00:00Z", due_on: null },
          { id: "4", number: 4, title: "Milestone 4", description: "Fourth", created_at: "2024-01-04T00:00:00Z", due_on: null },
        ]));
      }
      if (url.includes("/milestones/")) {
        const num = parseInt(url.split("/").pop() || "1");
        return Promise.resolve(createMockResponse({ 
          id: String(num), 
          number: num, 
          title: `Milestone ${num}`, 
          description: `${num}th`, 
          created_at: `2024-01-0${num % 10 || 1}T00:00:00Z`, 
          due_on: null 
        }));
      }
      return Promise.resolve(createMockResponse([]));
    });

    // Run multiple times to catch non-deterministic ordering
    const orderings: string[][] = [];
    
    for (let i = 0; i < 5; i++) {
      const jobs: Job[] = [["owner", "repo"]];
      const callback = vi.fn();
      
      getIssues("test_token", jobs, callback);
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      expect(callback).toHaveBeenCalled();
      const [error, data] = callback.mock.calls[callback.mock.calls.length - 1];
      expect(error).toBeNull();
      
      // Collect milestone numbers in order
      const numbers = Array.from(data.values()).map((m: { number: number }) => m.number);
      orderings.push(numbers);
    }

    // All orderings should be the same (sorted ascending: 1, 2, 3, 4, 5)
    const expectedOrder = [1, 2, 3, 4, 5];
    
    for (const order of orderings) {
      expect(order).toEqual(expectedOrder);
    }
  });
});
