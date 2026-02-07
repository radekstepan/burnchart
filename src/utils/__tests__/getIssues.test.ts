import { describe, test, expect, vi, beforeEach } from "vitest";
import getIssues, { Job } from "../getIssues";

// Simplified mock that always returns a valid response
const mockFetch = vi.fn((url: string) => {
  if (url.includes("/milestones/")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ 
        id: "123", 
        number: parseInt(url.split("/").pop() || "1"), 
        title: "Test Milestone", 
        description: "Test", 
        created_at: "2024-01-01T00:00:00Z", 
        due_on: "2024-02-01T00:00:00Z" 
      }),
      status: 200,
    });
  }
  if (url.includes("/issues")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
      status: 200,
    });
  }
  // Milestones list
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve([{ 
      id: "1", 
      number: 1, 
      title: "Milestone 1", 
      description: "First", 
      created_at: "2024-01-01T00:00:00Z", 
      due_on: "2024-02-01T00:00:00Z" 
    }]),
    status: 200,
  });
});
globalThis.fetch = mockFetch as unknown as typeof fetch;

describe("getIssues REST API", () => {
  beforeEach(() => {
    mockFetch.mockClear();
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
    // Override mock for this test
    mockFetch.mockImplementation(() => 
      Promise.resolve({ ok: true, json: () => Promise.resolve([]), status: 200 })
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
      Promise.resolve({ ok: false, json: () => Promise.resolve({}), status: 404 })
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

  test("formats issues correctly from REST API", async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes("/milestones/")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            id: "1", 
            number: 1, 
            title: "Test", 
            description: null, 
            created_at: "2024-01-01T00:00:00Z", 
            due_on: null 
          }),
          status: 200,
        });
      }
      if (url.includes("/issues")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { number: 1, title: "Issue with labels", closed_at: "2024-01-10T00:00:00Z", labels: [{ name: "bug" }, { name: "priority:high" }] },
            { number: 2, title: "Open issue", closed_at: null, labels: [] },
          ]),
          status: 200,
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]), status: 200 });
    });

    const jobs: Job[] = [["owner", "repo", "1"]];
    const callback = vi.fn();

    getIssues("test_token", jobs, callback);

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(callback).toHaveBeenCalled();
    const [error, data] = callback.mock.calls[0];
    expect(error).toBeNull();

    const milestone = data.values().next().value;
    expect(milestone.issues[0].labels).toEqual(["bug", "priority:high"]);
    expect(milestone.issues[1].closedAt).toBeNull();
  });

  test("handles network error gracefully", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const jobs: Job[] = [["owner", "repo"]];
    const callback = vi.fn();

    getIssues("test_token", jobs, callback);

    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(callback).toHaveBeenCalled();
  });
});
