import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { AuthProvider } from "../../providers/AuthProvider";
import useIssues from "../useIssues";
import getIssues from "../../utils/getIssues";
import { Milestone } from "../../interfaces";

vi.mock("../../utils/getIssues", () => ({
  default: vi.fn(),
  Job: {} // Just for typing if needed
}));

vi.mock("../../providers/AuthProvider", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useAuthContext: () => ({
      token: "test-token",
      isAuthenticated: true,
      isValidating: false,
      error: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
      clearError: vi.fn(),
    }),
  };
});

describe("useIssues logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handles error from getIssues", async () => {
    const mockError = { message: "Test Error" };
    (getIssues as any).mockImplementation((token, jobs, cb) => {
      cb(mockError, null);
      return () => {};
    });

    const { result } = renderHook(() => useIssues([["o", "r", "1"]]));

    expect(result.current.error).toEqual(mockError);
    expect(result.current.loading).toBe(false);
  });

  it("handles successful data and caching", () => {
    const milestone: Milestone = {
      number: 1,
      title: "M1",
      openIssues: 1,
      closedIssues: 0,
      state: "open",
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
      due_on: null,
      issues: []
    };
    
    const mockRes = new Map([["o/r/1", milestone]]);
    
    (getIssues as any).mockImplementation((token, jobs, cb) => {
      // First call loading, but cb is called after
      cb(null, mockRes);
      return () => {};
    });

    const { result, rerender } = renderHook(({ jobs }) => useIssues(jobs), {
      initialProps: { jobs: [["o", "r", "1"]] as any }
    });

    expect(result.current.data).toEqual([milestone]);
    expect(result.current.loading).toBe(false);

    // Test caching - second render with same jobs should NOT call getIssues again
    (getIssues as any).mockClear();
    rerender({ jobs: [["o", "r", "1"]] as any });
    
    // Actually useDeepCompareEffect will still run, but if cached, jobs passed to getIssues will be empty?
    // Let's check implementation. 
    // It filters out cached jobs.
    expect(getIssues).not.toHaveBeenCalled();
  });

  it("handles fetching all milestones (no milestone number)", () => {
    const milestones: Milestone[] = [
      { number: 1, title: "M1", openIssues: 1, closedIssues: 0, state: "open", created_at: "", updated_at: "", due_on: null, issues: [] },
      { number: 2, title: "M2", openIssues: 1, closedIssues: 0, state: "open", created_at: "", updated_at: "", due_on: null, issues: [] }
    ];
    
    const mockRes = new Map([
      ["o/r/1", milestones[0]],
      ["o/r/2", milestones[1]]
    ]);
    
    (getIssues as any).mockImplementation((token, jobs, cb) => {
      cb(null, mockRes);
      return () => {};
    });

    const { result } = renderHook(() => useIssues([["o", "r"]]));

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data).toContainEqual(milestones[0]);
    expect(result.current.data).toContainEqual(milestones[1]);
  });
});
