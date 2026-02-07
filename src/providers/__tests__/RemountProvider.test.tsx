import React, { useContext } from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import RemountProvider, { RemountContext } from "../RemountProvider";

const TestComponent = () => {
  const remount = useContext(RemountContext);
  return (
    <button data-testid="remount-button" onClick={remount}>
      Remount
    </button>
  );
};

describe("RemountProvider", () => {
  it("renders children", () => {
    render(
      <RemountProvider>
        <div data-testid="child">Child Content</div>
      </RemountProvider>
    );
    expect(screen.getByTestId("child")).toBeDefined();
    expect(screen.getByText("Child Content")).toBeDefined();
  });

  it("increments key when remount is called", () => {
    let renderCount = 0;
    const ChildComponent = () => {
      renderCount++;
      return <div data-testid="child">Render count: {renderCount}</div>;
    };

    render(
      <RemountProvider>
        <TestComponent />
        <ChildComponent />
      </RemountProvider>
    );

    expect(renderCount).toBe(1);
    
    const button = screen.getByTestId("remount-button");
    
    act(() => {
      fireEvent.click(button);
    });

    // Remounting causes the wrapper div to change its key, 
    // which should cause a full re-render of children.
    expect(renderCount).toBe(2);
  });
});
