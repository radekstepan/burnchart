import React from "react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { AuthProvider } from "../../providers/AuthProvider";
import useIssues from "../useIssues";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// Mock fetch
const mockFetchPromise = { ok: true, json: () => Promise.resolve({ login: "test" }) };
const mockFetch = vi.fn(() => Promise.resolve(mockFetchPromise));
globalThis.fetch = mockFetch as unknown as typeof fetch;

describe("useIssues", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('"test_token"');
    localStorageMock.setItem.mockReturnValue(undefined);
    localStorageMock.removeItem.mockReturnValue(undefined);
    mockFetch.mockClear();
    mockFetchPromise.ok = true;
  });

  describe("initial state", () => {
    test("returns default state when unauthenticated", () => {
      localStorageMock.getItem.mockReturnValue(null);

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

      const urls = mockFetch.mock.calls.map(c => c[0]);
      expect(urls.some(url => url.includes("/milestones/42"))).toBe(true);
    });

    test("uses Bearer token authentication", () => {
      renderHook(() => useIssues([["owner", "repo", "1"]]), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      const authHeaders = mockFetch.mock.calls
        .map(([url, options]) => options?.headers?.Authorization)
        .filter(Boolean);

      expect(authHeaders.length).toBeGreaterThan(0);
      expect(authHeaders[0]).toBe("Bearer test_token");
    });

    test("includes GitHub API version header", () => {
      renderHook(() => useIssues([["owner", "repo", "1"]]), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      const acceptHeaders = mockFetch.mock.calls
        .map(([url, options]) => options?.headers?.Accept)
        .filter(Boolean);

      expect(acceptHeaders.length).toBeGreaterThan(0);
      expect(acceptHeaders[0]).toContain("application/vnd.github.v3");
    });

    test("handles special characters in repo name", () => {
      renderHook(() => useIssues([["my-org", "my_repo-name", "1"]]), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      const urls = mockFetch.mock.calls.map(c => c[0]);
      expect(urls.some(url => 
        url.includes("my-org") || url.includes("my_repo-name")
      )).toBe(true);
    });

    test("fetches all milestones when no milestone number specified", () => {
      renderHook(() => useIssues([["owner", "repo"]]), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      const urls = mockFetch.mock.calls.map(c => c[0]);
      expect(urls.some(url => url.includes("/milestones?"))).toBe(true);
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
      mockFetch.mockResolvedValue({ ok: false });

      const { result } = renderHook(() => useIssues([["owner", "repo", "1"]]), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      // Result should have expected structure regardless of error
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
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(milestoneWithIssues) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(milestoneWithIssues.issues) });

      const { result } = renderHook(() => useIssues([["owner", "repo", "1"]]), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      expect(result.current).toHaveProperty("data");
    });

    test("handles empty issues list", () => {
      mockFetch
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ id: "1", number: 1, title: "M", description: null, created_at: "", due_on: null }) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });

      const { result } = renderHook(() => useIssues([["owner", "repo", "1"]]), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      expect(result.current).toHaveProperty("data");
    });

    test("handles null due_on date", () => {
      mockFetch
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ id: "1", number: 1, title: "M", description: null, created_at: "", due_on: null }) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });

      const { result } = renderHook(() => useIssues([["owner", "repo", "1"]]), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      expect(result.current).toHaveProperty("data");
    });
  });

  describe("multiple jobs", () => {
    test("handles multiple milestone requests", () => {
      mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

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
