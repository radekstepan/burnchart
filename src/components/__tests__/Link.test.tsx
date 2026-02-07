import React from "react";
import { vi, describe, test, expect } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import Link from "../Link/Link";
import { Route } from "../../routes";

const mockGoTo = vi.fn();
const mockGetHref = vi.fn((route, state) => `/${route}${state ? `?${JSON.stringify(state)}` : ""}`);
const mockRemount = vi.fn();

// Mock the hooks
vi.mock("../../hooks/useRouter", () => ({
  default: () => ({
    goTo: mockGoTo,
    getHref: mockGetHref,
  }),
}));

vi.mock("../../hooks/useRemount", () => ({
  default: () => mockRemount,
}));

describe("Link component", () => {
  test("renders a link with the correct href and onClick function", () => {
    const onClick = vi.fn();
    const { getByText } = render(
      <Link href="/example" onClick={onClick}>
        Click me
      </Link>
    );

    const link = getByText("Click me");
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toEqual("/example");

    fireEvent.click(link);
    expect(onClick).toHaveBeenCalled();
  });

  test("adds target='_blank' when href is provided", () => {
    const { getByText } = render(
      <Link href="https://example.com" target="_blank">
        External
      </Link>
    );

    const link = getByText("External");
    expect(link.getAttribute("target")).toEqual("_blank");
  });

  test("renders styled link with styled prop", () => {
    const { getByText } = render(
      <Link href="/example" styled>
        Styled Link
      </Link>
    );

    const link = getByText("Styled Link");
    expect(link.className).toContain("link--styled");
  });

  test("renders without styled class when styled is false", () => {
    const { getByText } = render(
      <Link href="/example">
        Unstyled Link
      </Link>
    );

    const link = getByText("Unstyled Link");
    expect(link.className).not.toContain("link--styled");
  });

  test("passes additional props to the anchor element", () => {
    const { getByText } = render(
      <Link href="/example" data-testid="test-link" aria-label="Test Link">
        Test
      </Link>
    );

    const link = getByText("Test");
    expect(link.getAttribute("data-testid")).toEqual("test-link");
    expect(link.getAttribute("aria-label")).toEqual("Test Link");
  });

  test("handles onClick without href", () => {
    const onClick = vi.fn();
    const { getByText } = render(
      <Link onClick={onClick}>
        Click Only
      </Link>
    );

    const link = getByText("Click Only");
    expect(link.getAttribute("href")).toBeNull();

    fireEvent.click(link);
    expect(onClick).toHaveBeenCalled();
  });

  test("applies custom className", () => {
    const { getByText } = render(
      <Link href="/example" className="custom-class">
        Custom
      </Link>
    );

    const link = getByText("Custom");
    expect(link.className).toContain("custom-class");
  });

  test("renders children correctly", () => {
    const { getByText } = render(
      <Link href="/example">
        <span data-testid="child">Child content</span>
      </Link>
    );

    expect(getByText("Child content")).toBeTruthy();
  });

  test("does nothing when clicked without routeName and onClick", () => {
    const { getByText } = render(<Link>No Action</Link>);
    const link = getByText("No Action");
    
    // Should not throw or do anything
    fireEvent.click(link);
  });

  test.skip("calls remount when navigating to same page", () => {
    const route = Route.repos;
    const path = "/0"; // Mock returned by getHref for Route.repos
    
    const oldLocation = window.location;
    delete (window as any).location;
    window.location = { ...oldLocation, pathname: path } as any;

    render(
      <Link routeName={route}>
        Same Page
      </Link>
    );

    const link = screen.getByText("Same Page");
    fireEvent.click(link);

    expect(mockRemount).toHaveBeenCalled();
    
    window.location = oldLocation;
  });

  test("calls goTo when navigating to different page", () => {
    const route = Route.milestones;
    
    const oldLocation = window.location;
    delete (window as any).location;
    window.location = { ...oldLocation, pathname: "/different" } as any;

    render(
      <Link routeName={route} state={{ owner: "o", repo: "r" }}>
        Different Page
      </Link>
    );

    const link = screen.getByText("Different Page");
    fireEvent.click(link);

    expect(mockGoTo).toHaveBeenCalledWith(route, { owner: "o", repo: "r" });

    window.location = oldLocation;
  });
});
