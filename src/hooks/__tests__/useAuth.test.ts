import { describe, test, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useAuth from "../useAuth";

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

// Mock fetch with default implementation
let mockOkValue = false;
let mockRejectError: Error | null = null;

const mockFetch = vi.fn(() => {
  if (mockRejectError) {
    return Promise.reject(mockRejectError);
  }
  return Promise.resolve({ ok: mockOkValue });
});

Object.defineProperty(globalThis, "fetch", {
  value: mockFetch,
  writable: true,
});

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockReturnValue(undefined);
    localStorageMock.removeItem.mockReturnValue(undefined);
    mockOkValue = false;
    mockRejectError = null;
    mockFetch.mockClear();
  });

  describe("initial state", () => {
    test("returns unauthenticated state when no token", () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.token).toBe("");
      expect(result.current.isValidating).toBe(false);
      expect(result.current.error).toBeNull();
    });

    test("returns authenticated state when token exists", () => {
      localStorageMock.getItem.mockReturnValue('"test_token_123"');

      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.token).toBe("test_token_123");
    });

    test("has expected properties", () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current).toHaveProperty("isAuthenticated");
      expect(result.current).toHaveProperty("token");
      expect(result.current).toHaveProperty("isValidating");
      expect(result.current).toHaveProperty("error");
      expect(result.current).toHaveProperty("validateAndSetToken");
      expect(result.current).toHaveProperty("signOut");
      expect(result.current).toHaveProperty("clearError");
    });
  });

  describe("function types", () => {
    test("validateAndSetToken is a function", () => {
      const { result } = renderHook(() => useAuth());
      expect(typeof result.current.validateAndSetToken).toBe("function");
    });

    test("signOut is a function", () => {
      const { result } = renderHook(() => useAuth());
      expect(typeof result.current.signOut).toBe("function");
    });

    test("clearError is a function", () => {
      const { result } = renderHook(() => useAuth());
      expect(typeof result.current.clearError).toBe("function");
    });
  });

  describe("signOut", () => {
    test("signOut removes token from localStorage", () => {
      localStorageMock.getItem.mockReturnValue('"existing_token"');

      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.signOut();
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
    });
  });

  describe("validateAndSetToken", () => {
    test("empty token returns false", async () => {
      const { result } = renderHook(() => useAuth());

      const success = await act(async () => {
        return result.current.validateAndSetToken("");
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe("Token cannot be empty");
    });

    test("successful validation stores token", async () => {
      mockOkValue = true;

      const { result } = renderHook(() => useAuth());

      const success = await act(async () => {
        return result.current.validateAndSetToken("valid_token");
      });

      expect(success).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith("token", JSON.stringify("valid_token"));
    });

    test("invalid token returns false", async () => {
      mockOkValue = false;

      const { result } = renderHook(() => useAuth());

      const success = await act(async () => {
        return result.current.validateAndSetToken("invalid_token");
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe("Invalid token - GitHub API rejected it");
    });

    test("network error returns false", async () => {
      // Set up a mock that rejects
      mockFetch.mockRejectedValueOnce(new Error("Network error"));
      // Reset mockOkValue to ensure we're testing the right path
      mockOkValue = false;

      const { result } = renderHook(() => useAuth());

      const success = await act(async () => {
        return result.current.validateAndSetToken("test_token");
      });

      expect(success).toBe(false);
      // Network errors should contain a different message
      expect(result.current.error).not.toBeNull();
    });
  });

  describe("clearError", () => {
    test("clearError resets error to null", async () => {
      const { result } = renderHook(() => useAuth());

      // Set an error first
      await act(async () => {
        await result.current.validateAndSetToken("");
      });

      // Clear it
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe("token storage", () => {
    test("signOut removes token", async () => {
      localStorageMock.getItem.mockReturnValue('"existing_token"');

      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.signOut();
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
    });
  });
});
