import React, { memo, useContext, useEffect, useState } from "react";
import { Button, Link, Pane, Spinner } from "evergreen-ui";
import { FirebaseContext } from "../providers/FirebaseProvider";
import Icon from "./Icon";
import useFirebase from "../hooks/useFirebase";

function Auth() {
  const { user, signIn, signOut } = useFirebase();

  if (user) {
    return (
      <Link onClick={signOut}>
        <Icon name="signout" />
        Sign Out
        {user.displayName}
      </Link>
    );
  }

  return (
    <Button appearance="primary" onClick={signIn}>
      Sign In
    </Button>
  );
}

export default Auth;
