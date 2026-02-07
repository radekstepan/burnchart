import React, { useState, useCallback, useEffect } from "react";
import Icon from "../Icon/Icon";
import { useAuthContext } from "../../providers/AuthProvider";
import TokenInput from "../TokenInput/TokenInput";
import Modal from "../Modal/Modal";
import "./header.less";

function Auth() {
  const { isAuthenticated, signOut } = useAuthContext();
  const [showTokenInput, setShowTokenInput] = useState(false);

  // Listen for custom event to show modal
  useEffect(() => {
    const handleShowModal = () => {
      if (!isAuthenticated) {
        setShowTokenInput(true);
      }
    };
    window.addEventListener("show-token-modal", handleShowModal);
    return () => window.removeEventListener("show-token-modal", handleShowModal);
  }, [isAuthenticated]);

  const handleSignOut = useCallback(() => {
    signOut();
    setShowTokenInput(false);
  }, [signOut]);

  const handleClose = useCallback(() => {
    setShowTokenInput(false);
  }, []);

  const handleButtonClick = useCallback(() => {
    setShowTokenInput(true);
  }, []);

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
      <button onClick={handleButtonClick} className="auth__button">
        <Icon name="github" /> Add Token
      </button>

      <Modal
        isOpen={showTokenInput}
        onClose={handleClose}
        title="Add GitHub Token"
      >
        <TokenInput
          onSuccess={handleClose}
        />
      </Modal>
    </>
  );
}

export default Auth;
