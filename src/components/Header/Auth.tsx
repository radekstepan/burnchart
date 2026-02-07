import React, { useCallback } from "react";
import Icon from "../Icon/Icon";
import { useAuthContext } from "../../providers/AuthProvider";
import TokenInput from "../TokenInput/TokenInput";
import Modal from "../Modal/Modal";
import "./header.less";

function Auth() {
  const { isAuthenticated, signOut, showTokenModal, closeTokenModal, showTokenInput } = useAuthContext();

  const handleSignOut = useCallback(() => {
    signOut();
  }, [signOut]);

  if (isAuthenticated) {
    return (
      <div className="auth auth--authenticated">
        <button onClick={handleSignOut} className="auth__signout">
          <Icon name="signout" /> Sign Out
        </button>
      </div>
    );
  }

  return (
    <>
      <button onClick={showTokenModal} className="auth__button">
        <Icon name="github" /> Add Token
      </button>

      <Modal
        isOpen={showTokenInput}
        onClose={closeTokenModal}
        title="Add GitHub Token"
      >
        <TokenInput
          onSuccess={closeTokenModal}
        />
      </Modal>
    </>
  );
}

export default Auth;
