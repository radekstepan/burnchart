import React from "react";
import Icon from "./Icon/Icon";
import Link from "./Link/Link";
import Button from "./Button/Button";
import useFirebase from "../hooks/useFirebase";
import { useTokenStore } from "../hooks/useStore";

function Auth() {
  const { user, signIn, signOut } = useFirebase();
  const [token] = useTokenStore();

  if (user) {
    return (
      <Link onClick={signOut}>
        <Icon name="signout" /> Sign Out
      </Link>
    );
  }

  // Wait to check the token.
  if (token) {
    return null;
  }

  return (
    <Button onClick={signIn}>
      <Icon name="github" /> &nbsp; Sign In
    </Button>
  );
}

export default Auth;
