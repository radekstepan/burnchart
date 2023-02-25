import React from "react";
import { vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import Link from "../Link/Link";

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
});
