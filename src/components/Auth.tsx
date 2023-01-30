import React, { memo, useContext, useEffect, useState } from "react";
import { Button, Link, Pane, Spinner } from "evergreen-ui";
import { FirebaseContext } from "../providers/FirebaseProvider";
import Icon from "./Icon";
import useFirebase from "../hooks/useFirebase";
import { useTokenStore } from "../hooks/useStore";

function Auth() {
  const { user, signIn, signOut } = useFirebase();
  const [token] = useTokenStore();

  if (user) {
    return (
      <Link onClick={signOut}>
        <Icon name="signout" />
        Sign Out
        {user.displayName}
      </Link>
    );
  }

  // Wait to check the token.
  if (token) {
    return null;
  }

  return (
    <Button appearance="primary" onClick={signIn}>
      Sign In
    </Button>
  );
}

export default Auth;
