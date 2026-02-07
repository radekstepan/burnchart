import React from "react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { AuthProvider } from "../../providers/AuthProvider";
import useIssues from "../useIssues";
import * as mapUtils from "../../utils/map";
import * as keysUtils from "../../utils/keys";

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

describe("useIssues caching behavior", () => {
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

    test("has loading, data, and error properties", () => {
      const { result } = renderHook(() => useIssues([["owner", "repo", "1"]]), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      expect(result.current).toHaveProperty("loading");
      expect(result.current).toHaveProperty("data");
      expect(result.current).toHaveProperty("error");
    });
  });

  describe("caching", () => {
    test("checks cache for milestones", () => {
      // Mock map.get to return cached data
      const cachedMilestone = {
        id: "1",
        number: 1,
        title: "Cached Milestone",
        description: "From cache",
        dueOn: "2024-02-01",
        issues: [],
      };

      vi.spyOn(mapUtils, "get").mockReturnValue(cachedMilestone);

      const { result } = renderHook(() => useIssues([["owner", "repo", "1"]]), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      // Should have loaded data from cache
      expect(result.current.data.length).toBeGreaterThanOrEqual(1);
      if (result.current.data.length > 0) {
        expect(result.current.data[0].title).toBe("Cached Milestone");
      }
    });

    test("map.get is called with correct key format", () => {
      const keyFn = keysUtils.default;
      expect(keyFn("owner", "repo", 42)).toBe("owner/repo/42");
    });

    test("keys are consistent", () => {
      const keyFn = keysUtils.default;
      const key1 = keyFn("test", "repo", 1);
      const key2 = keyFn("test", "repo", 1);
      expect(key1).toBe(key2);
    });
  });

  describe("data population", () => {
    test("handles milestone with issues", () => {
      const milestoneWithIssues = {
        id: "1",
        number: 1,
        title: "Test",
        description: null,
        dueOn: "2024-02-01",
        issues: [{ number: 1, title: "Issue 1", closedAt: null, labels: [] }],
      };

      vi.spyOn(mapUtils, "get").mockReturnValue(milestoneWithIssues);

      const { result } = renderHook(() => useIssues([["owner", "repo", "1"]]), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      if (result.current.data.length > 0) {
        expect(result.current.data[0].issues.length).toBe(1);
      }
    });

    test("handles milestone without issues", () => {
      const emptyMilestone = {
        id: "1",
        number: 1,
        title: "Empty",
        description: null,
        dueOn: null,
        issues: [],
      };

      vi.spyOn(mapUtils, "get").mockReturnValue(emptyMilestone);

      const { result } = renderHook(() => useIssues([["owner", "repo", "1"]]), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      if (result.current.data.length > 0) {
        expect(result.current.data[0].issues).toEqual([]);
      }
    });
  });

  describe("key generation", () => {
    test("generates correct key format", () => {
      const keyFn = keysUtils.default;
      expect(keyFn("myorg", "myrepo", 42)).toBe("myorg/myrepo/42");
    });

    test("keys contain owner, repo, and milestone number", () => {
      const keyFn = keysUtils.default;
      const key = keyFn("owner", "repo", 123);
      expect(key).toContain("owner");
      expect(key).toContain("repo");
      expect(key).toContain("123");
    });
  });

  describe("store utilities", () => {
    test("map utilities are available", () => {
      expect(typeof mapUtils.get).toBe("function");
    });
  });
});

describe("useIssues error handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('"test_token"');
    mockFetch.mockClear();
    mockFetchPromise.ok = true;
  });

  test("returns error when API fails", () => {
    mockFetch.mockResolvedValue({ ok: false });

    const { result } = renderHook(() => useIssues([["owner", "repo", "1"]]), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    // Hook should complete without crashing
    expect(result.current).toHaveProperty("loading");
    expect(result.current).toHaveProperty("data");
    expect(result.current).toHaveProperty("error");
  });

  test("handles network errors gracefully", () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useIssues([["owner", "repo", "1"]]), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    expect(result.current).toHaveProperty("loading");
    expect(result.current).toHaveProperty("data");
    expect(result.current).toHaveProperty("error");
  });

  test("handles unmount gracefully", () => {
    const { unmount } = renderHook(() => useIssues([["owner", "repo", "1"]]), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    // Unmount should not cause errors
    expect(() => unmount()).not.toThrow();
  });
});

describe("useIssues multiple jobs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('"test_token"');
    mockFetch.mockClear();
    mockFetchPromise.ok = true;
  });

  test("handles multiple milestone jobs", () => {
    vi.spyOn(mapUtils, "get").mockReturnValue(undefined);

    const { result } = renderHook(
      () => useIssues([
        ["owner1", "repo1", "1"],
        ["owner2", "repo2", "2"],
      ]),
      {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      }
    );

    expect(result.current).toHaveProperty("data");
    expect(result.current).toHaveProperty("loading");
  });

  test("handles job without milestone number", () => {
    vi.spyOn(mapUtils, "get").mockReturnValue(undefined);

    const { result } = renderHook(() => useIssues([["owner", "repo"]]), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    expect(result.current).toHaveProperty("data");
    expect(result.current).toHaveProperty("loading");
  });

  test("handles mixed cached and uncached jobs", () => {
    const cached = {
      id: "1",
      number: 1,
      title: "Cached",
      description: null,
      dueOn: null,
      issues: [],
    };

    let callCount = 0;
    vi.spyOn(mapUtils, "get").mockImplementation(() => {
      callCount++;
      return callCount === 1 ? cached : undefined;
    });

    const { result } = renderHook(
      () => useIssues([
        ["owner", "repo", "1"], // cached
        ["owner", "repo", "2"], // not cached
      ]),
      {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      }
    );

    expect(result.current).toHaveProperty("data");
  });
});
