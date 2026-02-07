import React, { createContext, useContext, useCallback, useState, ReactNode } from "react";
import useAuth, { AuthState } from "../hooks/useAuth";

interface AuthContextValue extends AuthState {
  signIn: (token: string) => Promise<boolean>;
  signOut: () => void;
  clearError: () => void;
  showTokenModal: () => void;
  closeTokenModal: () => void;
  showTokenInput: boolean;
}

const defaultValue: AuthContextValue = {
  token: "",
  isAuthenticated: false,
  isValidating: false,
  error: null,
  signIn: async () => false,
  signOut: () => {},
  clearError: () => {},
  showTokenModal: () => {},
  closeTokenModal: () => {},
  showTokenInput: false,
};

export const AuthContext = createContext<AuthContextValue>(defaultValue);

interface Props {
  children: ReactNode;
}

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const auth = useAuth();
  const [showTokenInput, setShowTokenInput] = useState(false);

  const signIn = useCallback(
    async (token: string) => {
      const result = await auth.validateAndSetToken(token);
      if (result) {
        setShowTokenInput(false);
      }
      return result;
    },
    [auth.validateAndSetToken]
  );

  const showTokenModal = useCallback(() => {
    setShowTokenInput(true);
  }, []);

  const closeTokenModal = useCallback(() => {
    setShowTokenInput(false);
  }, []);

  const value: AuthContextValue = {
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    isValidating: auth.isValidating,
    error: auth.error,
    signIn,
    signOut: auth.signOut,
    clearError: auth.clearError,
    showTokenModal,
    closeTokenModal,
    showTokenInput,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

/**
 * Hook to access auth context
 */
export const useAuthContext = () => useContext(AuthContext);
