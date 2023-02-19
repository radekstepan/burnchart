import React, { useEffect, useMemo, useState } from "react";
import { initializeApp } from "@firebase/app";
import {
  getAuth,
  GithubAuthProvider,
  signInWithCredential,
  signInWithPopup,
  signOut,
} from "@firebase/auth";
import config from "../config";
import { useTokenStore } from "../hooks/useStore";
import { serializeError } from "serialize-error";

interface User {
  displayName: string | null;
  email: string | null;
}

interface ContextValue {
  signIn: () => void;
  signOut: () => void;
  clearError: () => void;
  user: User | null;
  error: string | null;
}

const defaultValue = {
  signIn: () => {},
  signOut: () => {},
  clearError: () => {},
  user: null,
  error: null,
};

export const FirebaseContext = React.createContext<ContextValue>(defaultValue);

interface Props {
  children?: React.ReactNode;
}

const FirebaseProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<ContextValue["user"]>(null);
  const [error, setError] = useState<ContextValue["error"]>(null);

  const app = initializeApp(config.firebase);
  const auth = getAuth(app);

  const provider = new GithubAuthProvider();
  // See https://developer.github.com/v3/oauth/#scopes
  provider.addScope("repo");

  const [token, setToken, deleteToken] = useTokenStore();

  // Check if the stored token is still valid.
  useEffect(() => {
    if (user || !token) {
      return;
    }

    const signIn = async () => {
      try {
        const credential = GithubAuthProvider.credential(token);
        const res = await signInWithCredential(auth, credential);
        setUser(res.user.providerData[0]);
      } catch (err) {
        deleteToken();
      }
    };

    signIn();
  }, [user, token]);

  const value = useMemo(
    () => ({
      user,
      error,
      signIn: async () => {
        if (user) {
          return;
        }

        try {
          const res = await signInWithPopup(auth, provider);
          const credential = GithubAuthProvider.credentialFromResult(res);

          if (!credential?.accessToken) {
            return;
          }

          setToken(credential.accessToken);
          setUser(res.user.providerData[0]);
        } catch (err) {
          const { message } = serializeError(err);
          setError(
            message ||
              "Something went wrong during the OAuth authentication flow."
          );
        }
      },
      signOut: async () => {
        deleteToken();
        setUser(null);
        await signOut(auth);
      },
      clearError: () => {
        setError(null);
      },
    }),
    [user, error]
  );

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};

export default FirebaseProvider;
