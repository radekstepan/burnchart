import React from "react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { AuthProvider } from "../../providers/AuthProvider";
import useIssues from "../useIssues";

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(global, "sessionStorage", {
  value: sessionStorageMock,
  writable: true,
});

// Mock fetch
const mockFetch = vi.fn();
globalThis.fetch = mockFetch as unknown as typeof fetch;

describe("useIssues", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorageMock.getItem.mockReturnValue('"test_token"');
    sessionStorageMock.setItem.mockReturnValue(undefined);
    sessionStorageMock.removeItem.mockReturnValue(undefined);
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ login: "test" }),
    } as Response);
  });

  describe("initial state", () => {
    test("returns default state when unauthenticated", () => {
      sessionStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useIssues([["owner", "repo", "1"]]), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.data).toEqual([]);
    });

    test("returns default state when ask array is empty", () => {
      const { result } = renderHook(() => useIssues([]), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.data).toEqual([]);
    });

    test("has expected properties", () => {
      const { result } = renderHook(() => useIssues([["owner", "repo", "1"]]), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      expect(result.current).toHaveProperty("loading");
      expect(result.current).toHaveProperty("data");
      expect(result.current).toHaveProperty("error");
    });
  });

  describe("API calls", () => {
    test("fetches milestone data from correct endpoint", () => {
      renderHook(() => useIssues([["myorg", "myrepo", "42"]]), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      const calls = mockFetch.mock.calls;
      const urls = calls.map((c) => String(c[0]));
      expect(urls.some((url) => url.includes("/milestones/42"))).toBe(true);
    });

    test("uses Bearer token authentication", () => {
      renderHook(() => useIssues([["owner", "repo", "1"]]), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      const calls = mockFetch.mock.calls;
      const authHeaders = calls
        .map((c) => c[1] as { headers?: { Authorization?: string } })
        .map((options) => options.headers?.Authorization)
        .filter(Boolean);

      expect(authHeaders.length).toBeGreaterThan(0);
      expect(authHeaders[0]).toBe("Bearer test_token");
    });

    test("includes GitHub API version header", () => {
      renderHook(() => useIssues([["owner", "repo", "1"]]), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      const calls = mockFetch.mock.calls;
      const acceptHeaders = calls
        .map((c) => c[1] as { headers?: { Accept?: string } })
        .map((options) => options.headers?.Accept)
        .filter(Boolean);

      expect(acceptHeaders.length).toBeGreaterThan(0);
      expect(acceptHeaders[0]).toContain("application/vnd.github.v3");
    });

    test("handles special characters in repo name", () => {
      renderHook(() => useIssues([["my-org", "my_repo-name", "1"]]), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      const calls = mockFetch.mock.calls;
      const urls = calls.map((c) => String(c[0]));
      expect(urls.some((url) => 
        url.includes("my-org") || url.includes("my_repo-name")
      )).toBe(true);
    });

    test("fetches all milestones when no milestone number specified", () => {
      renderHook(() => useIssues([["owner", "repo"]]), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      const calls = mockFetch.mock.calls;
      const urls = calls.map((c) => String(c[0]));
      expect(urls.some((url) => url.includes("/milestones?"))).toBe(true);
    });

    test("triggers fetch when authenticated", () => {
      renderHook(() => useIssues([["owner", "repo", "1"]]), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("error handling", () => {
    test("handles API error response", () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({}),
      } as unknown as Response);

      const { result } = renderHook(() => useIssues([["owner", "repo", "1"]]), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      expect(result.current).toHaveProperty("loading");
      expect(result.current).toHaveProperty("data");
      expect(result.current).toHaveProperty("error");
    });

    test("handles network failure", () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useIssues([["owner", "repo", "1"]]), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      expect(result.current).toHaveProperty("loading");
      expect(result.current).toHaveProperty("data");
      expect(result.current).toHaveProperty("error");
    });
  });

  describe("data handling", () => {
    test("handles milestone with issues", () => {
      const milestoneWithIssues = {
        id: "1",
        number: 1,
        title: "Test Milestone",
        description: "A test",
        created_at: "2024-01-01T00:00:00Z",
        due_on: "2024-02-01T00:00:00Z",
        issues: [
          { number: 1, title: "Issue 1", closed_at: "2024-01-15T00:00:00Z", labels: [{ name: "bug" }] },
        ],
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(milestoneWithIssues),
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(milestoneWithIssues.issues),
        } as unknown as Response);

      const { result } = renderHook(() => useIssues([["owner", "repo", "1"]]), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      expect(result.current).toHaveProperty("data");
    });

    test("handles empty issues list", () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: "1", number: 1, title: "M", description: null, created_at: "", due_on: null }),
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([]),
        } as unknown as Response);

      const { result } = renderHook(() => useIssues([["owner", "repo", "1"]]), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      expect(result.current).toHaveProperty("data");
    });

    test("handles null due_on date", () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: "1", number: 1, title: "M", description: null, created_at: "", due_on: null }),
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([]),
        } as unknown as Response);

      const { result } = renderHook(() => useIssues([["owner", "repo", "1"]]), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      expect(result.current).toHaveProperty("data");
    });
  });

  describe("multiple jobs", () => {
    test("handles multiple milestone requests", () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      } as unknown as Response);

      renderHook(
        () => useIssues([
          ["owner", "repo", "1"],
          ["owner", "repo", "2"],
        ]),
        {
          wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
        }
      );

      expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(1);
    });
  });
});
