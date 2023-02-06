import React, { memo, useContext, useEffect, useState } from "react";
import { Button, Pane, Spinner, Text } from "evergreen-ui";
import { FirebaseContext } from "../providers/FirebaseProvider";
import Icon from "./Icon";
import Link from "./Link";
import useFirebase from "../hooks/useFirebase";
import { useTokenStore } from "../hooks/useStore";

function Auth() {
  const { user, signIn, signOut } = useFirebase();
  const [token] = useTokenStore();

  if (user) {
    return (
      <Link onClick={signOut}>
        <Icon name="signout" /> Sign Out {user.displayName}
      </Link>
    );
  }

  // Wait to check the token.
  if (token) {
    return null;
  }

  return (
    <Button appearance="primary" onClick={signIn}>
      <Icon name="github" /> &nbsp; Sign In
    </Button>
  );
}

export default Auth;
