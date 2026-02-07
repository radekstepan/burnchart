import { renderHook, act } from "@testing-library/react";
import useReposStore from "../useReposStore";

describe("useReposStore", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("should initialize with empty repos", () => {
    const { result } = renderHook(() => useReposStore());

    expect(result.current.repos).toEqual([]);
  });

  it("should add a repo", () => {
    const { result } = renderHook(() => useReposStore());

    act(() => result.current.addRepo("facebook", "react"));

    expect(result.current.repos).toEqual([
      { owner: "facebook", repo: "react" },
    ]);
  });

  it("should not add duplicate repos", () => {
    const { result } = renderHook(() => useReposStore());

    act(() => result.current.addRepo("facebook", "react"));
    act(() => result.current.addRepo("facebook", "react"));

    expect(result.current.repos).toEqual([
      { owner: "facebook", repo: "react" },
    ]);
  });

  it("should remove a repo", () => {
    const { result } = renderHook(() => useReposStore());

    act(() => result.current.addRepo("facebook", "react"));
    act(() => result.current.removeRepo("facebook", "react"));

    expect(result.current.repos).toEqual([]);
  });

  it("should migrate legacy repos", () => {
    const legacyRepos = [{ owner: "facebook", name: "react" }];
    window.localStorage.setItem(
      "lscache-projects",
      JSON.stringify(legacyRepos)
    );

    const { result } = renderHook(() => useReposStore());

    expect(result.current.repos).toEqual([
      { owner: "facebook", repo: "react" },
    ]);
    expect(window.localStorage.getItem("lscache-projects")).toBe(null);
  });

  it("should do nothing when removing a non-existent repo", () => {
    const { result } = renderHook(() => useReposStore());

    act(() => result.current.addRepo("facebook", "react"));
    act(() => result.current.removeRepo("google", "chrome"));

    expect(result.current.repos).toEqual([
      { owner: "facebook", repo: "react" },
    ]);
  });

  it("should handle migration when repos already exist", () => {
    window.localStorage.setItem("repos", JSON.stringify([{ owner: "google", repo: "chrome" }]));
    window.localStorage.setItem("lscache-projects", JSON.stringify([{ owner: "facebook", name: "react" }]));

    const { result } = renderHook(() => useReposStore());

    expect(result.current.repos).toContainEqual({ owner: "google", repo: "chrome" });
    expect(result.current.repos).toContainEqual({ owner: "facebook", repo: "react" });
  });
});
