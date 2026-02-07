import React, { createContext, useContext, useCallback, ReactNode } from "react";
import useAuth, { AuthState } from "../hooks/useAuth";
import { clearAllCaches } from "../hooks/useIssues";

interface AuthContextValue extends AuthState {
  signIn: (token: string) => Promise<boolean>;
  signOut: () => void;
  clearError: () => void;
}

const defaultValue: AuthContextValue = {
  token: "",
  isAuthenticated: false,
  isValidating: false,
  error: null,
  signIn: async () => false,
  signOut: () => {},
  clearError: () => {},
};

export const AuthContext = createContext<AuthContextValue>(defaultValue);

interface Props {
  children: ReactNode;
}

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const auth = useAuth();

  const signIn = useCallback(
    async (token: string) => {
      return auth.validateAndSetToken(token);
    },
    [auth.validateAndSetToken]
  );

  const signOut = useCallback(() => {
    // Clear the issues cache when signing out
    clearAllCaches();
    auth.signOut();
  }, [auth.signOut]);

  const value: AuthContextValue = {
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    isValidating: auth.isValidating,
    error: auth.error,
    signIn,
    signOut,
    clearError: auth.clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

/**
 * Hook to access auth context
 */
export const useAuthContext = () => useContext(AuthContext);
