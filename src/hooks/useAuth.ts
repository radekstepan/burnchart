import { useState, useCallback } from "react";
import useTokenStore from "./useTokenStore";

export interface AuthState {
  token: string;
  isAuthenticated: boolean;
  error: string | null;
  isValidating: boolean;
}

const GITHUB_API = "https://api.github.com";

/**
 * Validate a GitHub PAT by making a simple API call
 */
const validateToken = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch(`${GITHUB_API}/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Hook to manage GitHub authentication via Personal Access Token
 */
const useAuth = () => {
  const [storedToken, setStoredToken, deleteStoredToken] = useTokenStore();
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = storedToken || "";
  const isAuthenticated = !!token;

  const validateAndSetToken = useCallback(
    async (newToken: string) => {
      const tokenString = String(newToken || "");
      if (!tokenString.trim()) {
        setError("Token cannot be empty");
        return false;
      }

      setIsValidating(true);
      setError(null);

      try {
        const isValid = await validateToken(tokenString);
        if (isValid) {
          setStoredToken(tokenString);
          return true;
        } else {
          setError("Invalid token - GitHub API rejected it");
          return false;
        }
      } catch (err) {
        setError("Failed to validate token - check your connection");
        return false;
      } finally {
        setIsValidating(false);
      }
    },
    [setStoredToken]
  );

  const signOut = useCallback(() => {
    deleteStoredToken();
    setError(null);
  }, [deleteStoredToken]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    token,
    isAuthenticated,
    isValidating,
    error,
    validateAndSetToken,
    signOut,
    clearError,
  };
};

export default useAuth;
