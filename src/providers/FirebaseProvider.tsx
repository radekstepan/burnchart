import React, { useMemo, useState } from "react";
import { initializeApp } from "@firebase/app";
import {
  getAuth,
  GithubAuthProvider,
  signInWithPopup,
  signOut,
} from "@firebase/auth";
import config from "../config";

interface User {
  displayName: string | null;
  email: string | null;
  accessToken: string;
}

interface ContextValue {
  signIn: () => void;
  signOut: () => void;
  user: User | null;
}

const defaultValue = {
  signIn: () => {},
  signOut: () => {},
  user: null,
};

export const FirebaseContext = React.createContext<ContextValue>(defaultValue);

interface Props {
  children?: React.ReactNode;
}

const FirebaseProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const app = initializeApp(config.firebase);
  const auth = getAuth(app);

  const provider = new GithubAuthProvider();
  // See https://developer.github.com/v3/oauth/#scopes
  provider.addScope("repo");

  const value = useMemo(
    () => ({
      user,
      signIn: async () => {
        if (user) {
          return;
        }

        const res = await signInWithPopup(auth, provider);
        const accessToken = await res.user.getIdToken();
        setUser({
          accessToken,
          ...res.user.providerData[0],
        });
      },
      signOut: async () => {
        setUser(null);
        await signOut(auth);
      },
    }),
    [user]
  );

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};

export default FirebaseProvider;
