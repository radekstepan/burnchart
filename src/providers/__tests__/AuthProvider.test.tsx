import React from "react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthProvider, useAuthContext, AuthContext } from "../AuthProvider";

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

describe("AuthProvider edge cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorageMock.getItem.mockReturnValue(null);
    sessionStorageMock.setItem.mockReturnValue(undefined);
    sessionStorageMock.removeItem.mockReturnValue(undefined);
  });

  describe("context value structure", () => {
    test("provides token from useAuth when present", () => {
      sessionStorageMock.getItem.mockReturnValue('"my_token"');

      const TestComponent = () => {
        const { token } = useAuthContext();
        return <div data-testid="token">{token}</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId("token").textContent).toBe("my_token");
    });

    test("provides empty token when not authenticated", () => {
      const TestComponent = () => {
        const { token } = useAuthContext();
        return <div data-testid="token">{token}</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId("token").textContent).toBe("");
    });

    test("isAuthenticated is false without token", () => {
      const TestComponent = () => {
        const { isAuthenticated } = useAuthContext();
        return <div data-testid="auth">{String(isAuthenticated)}</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId("auth").textContent).toBe("false");
    });

    test("isValidating is false initially", () => {
      const TestComponent = () => {
        const { isValidating } = useAuthContext();
        return <div data-testid="validating">{String(isValidating)}</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId("validating").textContent).toBe("false");
    });

    test("error is null initially", () => {
      const TestComponent = () => {
        const { error } = useAuthContext();
        return <div data-testid="error">{error || "none"}</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId("error").textContent).toBe("none");
    });

    test("signIn is a function", () => {
      const TestComponent = () => {
        const { signIn } = useAuthContext();
        return <div data-testid="signin">{typeof signIn}</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId("signin").textContent).toBe("function");
    });

    test("signOut is a function", () => {
      const TestComponent = () => {
        const { signOut } = useAuthContext();
        return <div data-testid="signout">{typeof signOut}</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId("signout").textContent).toBe("function");
    });

    test("clearError is a function", () => {
      const TestComponent = () => {
        const { clearError } = useAuthContext();
        return <div data-testid="clearError">{typeof clearError}</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId("clearError").textContent).toBe("function");
    });
  });

  describe("children rendering", () => {
    test("renders children correctly", () => {
      render(
        <AuthProvider>
          <div data-testid="child">Child Content</div>
        </AuthProvider>
      );

      expect(screen.getByTestId("child").textContent).toBe("Child Content");
    });

    test("handles multiple children", () => {
      render(
        <AuthProvider>
          <span>First</span>
          <span>Second</span>
          <span>Third</span>
        </AuthProvider>
      );

      expect(screen.getByText("First")).toBeTruthy();
      expect(screen.getByText("Second")).toBeTruthy();
      expect(screen.getByText("Third")).toBeTruthy();
    });

    test("handles nested components", () => {
      render(
        <AuthProvider>
          <div>
            <span>Nested</span>
            <div>
              <button>Deep</button>
            </div>
          </div>
        </AuthProvider>
      );

      expect(screen.getByText("Nested")).toBeTruthy();
      expect(screen.getByText("Deep")).toBeTruthy();
    });
  });

  describe("context properties", () => {
    test("context value object has all required properties", () => {
      let contextValue: unknown = null;

      const TestComponent = () => {
        const ctx = React.useContext(AuthContext);
        contextValue = ctx;
        return null;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(contextValue).not.toBeNull();
      expect(contextValue).toHaveProperty("token");
      expect(contextValue).toHaveProperty("isAuthenticated");
      expect(contextValue).toHaveProperty("signIn");
      expect(contextValue).toHaveProperty("signOut");
      expect(contextValue).toHaveProperty("clearError");
    });

    test("context is properly provided via Provider", () => {
      let providerWrapped = false;

      const TestComponent = () => {
        const ctx = React.useContext(AuthContext);
        providerWrapped = ctx !== null && typeof ctx === "object";
        return null;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(providerWrapped).toBe(true);
    });

    test("context has expected property types", () => {
      const TestComponent = () => {
        const auth = useAuthContext();
        return (
          <div>
            <span data-testid="token-type">{typeof auth.token}</span>
            <span data-testid="auth-type">{typeof auth.isAuthenticated}</span>
            <span data-testid="signin-type">{typeof auth.signIn}</span>
            <span data-testid="signout-type">{typeof auth.signOut}</span>
            <span data-testid="clear-type">{typeof auth.clearError}</span>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId("token-type").textContent).toBe("string");
      expect(screen.getByTestId("auth-type").textContent).toBe("boolean");
      expect(screen.getByTestId("signin-type").textContent).toBe("function");
      expect(screen.getByTestId("signout-type").textContent).toBe("function");
      expect(screen.getByTestId("clear-type").textContent).toBe("function");
    });
  });

  describe("sessionStorage interaction", () => {
    test("signOut removes token from sessionStorage", () => {
      sessionStorageMock.getItem.mockReturnValue('"existing_token"');

      const TestComponent = () => {
        const { signOut } = useAuthContext();
        return (
          <button onClick={() => signOut()}>Sign Out</button>
        );
      };

      const { container } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      container.querySelector("button")?.click();

      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith("token");
    });
  });
});

describe("useAuthContext hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorageMock.getItem.mockReturnValue(null);
  });

  test("returns context value", () => {
    const TestComponent = () => {
      const auth = useAuthContext();
      return <div data-testid="hasContext">{auth ? "yes" : "no"}</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("hasContext").textContent).toBe("yes");
  });
});
