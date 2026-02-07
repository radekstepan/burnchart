import React from "react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import * as AuthProviderModule from "../../../providers/AuthProvider";
import TokenInput from "../TokenInput";

const mockSignIn = vi.fn();
const mockClearError = vi.fn();

vi.mock("../../../providers/AuthProvider", async (importOriginal) => {
  const actual = await importOriginal<typeof AuthProviderModule>();
  return {
    ...actual,
    useAuthContext: () => ({
      token: "",
      isAuthenticated: false,
      isValidating: false,
      error: null,
      signIn: mockSignIn,
      signOut: vi.fn(),
      clearError: mockClearError,
    }),
  };
});

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

describe("TokenInput", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Return valid JSON string for no token
    sessionStorageMock.getItem.mockReturnValue(null);
    sessionStorageMock.setItem.mockReturnValue(undefined);
    sessionStorageMock.removeItem.mockReturnValue(undefined);
  });

  test("renders token input form", () => {
    render(<TokenInput />);

    expect(screen.getByLabelText("GitHub Personal Access Token")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Add Token" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "GitHub Settings → Tokens" })).toBeTruthy();
  });

  test("submit button exists when input is empty", () => {
    render(<TokenInput />);

    const button = screen.getByRole("button", { name: "Add Token" });
    expect(button).toBeTruthy();
  });

  test("input has correct placeholder", () => {
    render(<TokenInput />);

    const input = screen.getByLabelText("GitHub Personal Access Token");
    expect(input.getAttribute("placeholder")).toBe("ghp_xxxxxxxxxxxxxxxxxxxx");
  });

  test("input has correct type", () => {
    render(<TokenInput />);

    const input = screen.getByLabelText("GitHub Personal Access Token");
    expect(input.getAttribute("type")).toBe("password");
  });

  test("form has correct structure", () => {
    render(<TokenInput />);

    const form = document.querySelector("form");
    expect(form).toBeTruthy();
    expect(form?.className).toContain("token-input");
  });

  test("calls signIn on form submission and onSuccess if successful", async () => {
    const onSuccess = vi.fn();
    mockSignIn.mockResolvedValue(true);
    
    render(<TokenInput onSuccess={onSuccess} />);

    const input = screen.getByLabelText("GitHub Personal Access Token");
    const button = screen.getByRole("button", { name: "Add Token" });

    fireEvent.change(input, { target: { value: "test-token" } });
    
    await act(async () => {
      fireEvent.click(button);
    });

    expect(mockSignIn).toHaveBeenCalledWith("test-token");
    expect(onSuccess).toHaveBeenCalled();
  });
});
