import React from "react";
import { vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import useReposStore from "../../hooks/useReposStore";
import useRouter from "../../hooks/useRouter";
import Error from "../Error/Error";
import { Route } from "../../routes";

vi.mock("../../hooks/useReposStore");
vi.mock("../../hooks/useRouter");

describe("Error", () => {
  const mockGoTo = vi.fn();
  const mockRemoveRepo = vi.fn();

  beforeEach(() => {
    (useReposStore as any).mockReturnValue({
      repos: [{ owner: "user1", repo: "repo1" }],
      removeRepo: mockRemoveRepo,
    });
    (useRouter as any).mockReturnValue({ goTo: mockGoTo });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test("renders error message", () => {
    const error = { message: "Error message" };

    const { getByText } = render(<Error error={error} />);

    expect(getByText("Error message")).not.toBeNull();
  });

  test("renders remove link if variables exist", () => {
    const error = {
      message: "Error message",
      variables: { owner: "user1", repo: "repo1" },
    };

    const { getByText } = render(<Error error={error} />);

    expect(getByText("Remove this Repo")).not.toBeNull();
  });

  test("does not render remove link if variables are missing", () => {
    const error = { message: "Error message" };

    const { queryByText } = render(<Error error={error} />);

    expect(queryByText("Remove this Repo")).toBeNull();
  });

  test("calls removeRepo and goTo when remove link is clicked", () => {
    const error = {
      message: "Error message",
      variables: { owner: "user1", repo: "repo1" },
    };

    const { getByText } = render(<Error error={error} />);
    const removeLink = getByText("Remove this Repo");
    fireEvent.click(removeLink);

    expect(mockRemoveRepo).toHaveBeenCalledWith("user1", "repo1");
    expect(mockGoTo).toHaveBeenCalledWith(Route.repos);
  });

  test("does not call removeRepo and goTo when remove link is clicked and repos are empty", () => {
    (useReposStore as any).mockReturnValue({
      repos: [],
      removeRepo: mockRemoveRepo,
    });
    const error = {
      message: "Error message",
      variables: { owner: "user1", repo: "repo1" },
    };

    const { getByText } = render(<Error error={error} />);

    const removeLink = getByText("Remove this Repo");
    fireEvent.click(removeLink);

    expect(mockRemoveRepo).not.toHaveBeenCalled();
    expect(mockGoTo).not.toHaveBeenCalled();
  });
});
