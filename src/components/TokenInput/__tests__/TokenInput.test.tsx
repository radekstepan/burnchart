import React from "react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AuthProvider } from "../../../providers/AuthProvider";
import TokenInput from "../TokenInput";

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

describe("TokenInput", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Return valid JSON string for no token
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockReturnValue(undefined);
    localStorageMock.removeItem.mockReturnValue(undefined);
  });

  test("renders token input form", () => {
    render(
      <AuthProvider>
        <TokenInput />
      </AuthProvider>
    );

    expect(screen.getByLabelText("GitHub Personal Access Token")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Add Token" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "GitHub Settings → Tokens" })).toBeTruthy();
  });

  test("submit button exists when input is empty", () => {
    render(
      <AuthProvider>
        <TokenInput />
      </AuthProvider>
    );

    const button = screen.getByRole("button", { name: "Add Token" });
    expect(button).toBeTruthy();
  });

  test("input has correct placeholder", () => {
    render(
      <AuthProvider>
        <TokenInput />
      </AuthProvider>
    );

    const input = screen.getByLabelText("GitHub Personal Access Token");
    expect(input.getAttribute("placeholder")).toBe("ghp_xxxxxxxxxxxxxxxxxxxx");
  });

  test("input has correct type", () => {
    render(
      <AuthProvider>
        <TokenInput />
      </AuthProvider>
    );

    const input = screen.getByLabelText("GitHub Personal Access Token");
    expect(input.getAttribute("type")).toBe("text");
  });

  test("form has correct structure", () => {
    render(
      <AuthProvider>
        <TokenInput />
      </AuthProvider>
    );

    const form = document.querySelector("form");
    expect(form).toBeTruthy();
    expect(form?.className).toContain("token-input");
  });
});
