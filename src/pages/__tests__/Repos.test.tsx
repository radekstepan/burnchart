import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Repos from "../Repos";
import { AuthContext } from "../../providers/AuthProvider";
import useReposStore from "../../hooks/useReposStore";
import useIssues from "../../hooks/useIssues";

vi.mock("../../hooks/useReposStore");
vi.mock("../../hooks/useIssues");

const mockAuthValue = {
  token: "test-token",
  isAuthenticated: true,
  isValidating: false,
  error: null,
  signIn: vi.fn(),
  signOut: vi.fn(),
  clearError: vi.fn(),
};

describe("Repos Page", () => {
  const mockRemoveRepo = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useReposStore as any).mockReturnValue({
      repos: [{ owner: "owner", repo: "repo" }],
      removeRepo: mockRemoveRepo,
    });
  });

  it("shows loader while loading", () => {
    (useIssues as any).mockReturnValue({ loading: true, data: [], error: null });

    render(
      <AuthContext.Provider value={mockAuthValue}>
        <Repos />
      </AuthContext.Provider>
    );

    expect(screen.getByTitle("Loading")).toBeDefined();
  });

  it("automatically removes repo if 404 error occurs", async () => {
    (useIssues as any).mockReturnValue({
      loading: false,
      data: [],
      error: {
        message: 'Repository "owner/repo" not found',
        variables: { owner: "owner", repo: "repo" },
      },
    });

    render(
      <AuthContext.Provider value={mockAuthValue}>
        <Repos />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(mockRemoveRepo).toHaveBeenCalledWith("owner", "repo");
    });
  });

  it("renders Error component when an error occurs", () => {
    (useIssues as any).mockReturnValue({
      loading: false,
      data: [],
      error: { message: "Some other error" },
    });

    render(
      <AuthContext.Provider value={mockAuthValue}>
        <Repos />
      </AuthContext.Provider>
    );

    expect(screen.getByText("Some other error")).toBeDefined();
  });
});
