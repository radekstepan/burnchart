import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Milestones from "../Milestones";
import { AuthContext } from "../../providers/AuthProvider";
import useIssues from "../../hooks/useIssues";
import useRouteParams from "../../hooks/useRouteParams";

vi.mock("../../hooks/useIssues");
vi.mock("../../hooks/useRouteParams");
vi.mock("../../hooks/useReposStore", () => ({
  default: () => ({
    addRepo: vi.fn(),
    removeRepo: vi.fn(),
  }),
}));

const mockAuthValue = {
  token: "test-token",
  isAuthenticated: true,
  isValidating: false,
  error: null,
  signIn: vi.fn(),
  signOut: vi.fn(),
  clearError: vi.fn(),
};

describe("Milestones Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useRouteParams as any).mockReturnValue({ owner: "owner", repo: "repo" });
  });

  it("shows loader while loading", () => {
    (useIssues as any).mockReturnValue({ loading: true, data: [], error: null });

    render(
      <AuthContext.Provider value={mockAuthValue}>
        <Milestones />
      </AuthContext.Provider>
    );

    expect(screen.getByTitle("Loading")).toBeDefined();
  });

  it("shows 'No milestones found' when data is empty and not loading", () => {
    (useIssues as any).mockReturnValue({ loading: false, data: [], error: null });

    render(
      <AuthContext.Provider value={mockAuthValue}>
        <Milestones />
      </AuthContext.Provider>
    );

    expect(screen.getByText("No milestones found for this repository.")).toBeDefined();
  });

  it("renders Error component when an error occurs", () => {
    (useIssues as any).mockReturnValue({
      loading: false,
      data: [],
      error: { message: "Broken API" },
    });

    render(
      <AuthContext.Provider value={mockAuthValue}>
        <Milestones />
      </AuthContext.Provider>
    );

    expect(screen.getByText("Broken API")).toBeDefined();
  });
});
