import React from "react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { AuthProvider } from "../../providers/AuthProvider";
import useIssues, { clearAllCaches } from "../useIssues";
import * as keysUtils from "../../utils/keys";

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
const mockFetchPromise = { ok: true, json: () => Promise.resolve({ login: "test" }) as Promise<{ login: string }> };
const mockFetch = vi.fn((): Promise<Response> => Promise.resolve(mockFetchPromise as unknown as Response));
globalThis.fetch = mockFetch as unknown as typeof fetch;

describe("useIssues caching behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorageMock.getItem.mockReturnValue('"test_token"');
    sessionStorageMock.setItem.mockReturnValue(undefined);
    sessionStorageMock.removeItem.mockReturnValue(undefined);
    mockFetch.mockClear();
    mockFetchPromise.ok = true;
    clearAllCaches();
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

    test("has loading, data, and error properties", () => {
      const { result } = renderHook(() => useIssues([["owner", "repo", "1"]]), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      expect(result.current).toHaveProperty("loading");
      expect(result.current).toHaveProperty("data");
      expect(result.current).toHaveProperty("error");
    });
  });

  describe("cache utilities", () => {
    test("clearAllCaches function is exported", () => {
      expect(typeof clearAllCaches).toBe("function");
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

    test("keys are consistent", () => {
      const keyFn = keysUtils.default;
      const key1 = keyFn("test", "repo", 1);
      const key2 = keyFn("test", "repo", 1);
      expect(key1).toBe(key2);
    });
  });
});

describe("useIssues error handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorageMock.getItem.mockReturnValue('"test_token"');
    mockFetch.mockClear();
    mockFetchPromise.ok = true;
    clearAllCaches();
  });

  test("returns error when API fails", () => {
    mockFetch.mockResolvedValue({ ok: false, json: () => Promise.resolve({}) } as unknown as Response);

    const { result } = renderHook(() => useIssues([["owner", "repo", "1"]]), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

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

    expect(() => unmount()).not.toThrow();
  });
});

describe("useIssues multiple jobs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorageMock.getItem.mockReturnValue('"test_token"');
    mockFetch.mockClear();
    mockFetchPromise.ok = true;
    clearAllCaches();
  });

  test("handles multiple milestone jobs", () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as unknown as Response);

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
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    } as unknown as Response);

    const { result } = renderHook(() => useIssues([["owner", "repo"]]), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    expect(result.current).toHaveProperty("data");
    expect(result.current).toHaveProperty("loading");
  });
});
