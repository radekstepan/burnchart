import React, { useState, useCallback } from "react";
import { useAuthContext } from "../../providers/AuthProvider";
import "./token-input.less";

interface Props {
  onSuccess?: () => void;
}

const TokenInput: React.FC<Props> = ({ onSuccess }) => {
  const { signIn, isValidating, error, clearError } = useAuthContext();
  const [token, setToken] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();
      clearError();
      const success = await signIn(token);
      if (success && onSuccess) {
        onSuccess();
      }
    },
    [token, signIn, clearError, onSuccess]
  );

  return (
    <form onSubmit={handleSubmit} className="token-input">
      <div className="token-input__field">
        <label htmlFor="github-token" className="token-input__label">
          GitHub Personal Access Token
        </label>
        <input
          id="github-token"
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
          className="token-input__input"
          disabled={isValidating}
          autoComplete="off"
          autoFocus
        />
        <p className="token-input__help">
          Generate a token at{" "}
          <a
            href="https://github.com/settings/tokens"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub Settings → Tokens
          </a>
        </p>
        <div className="token-input__permissions">
          <strong>Required permissions:</strong>
          <ul>
            <li><code>repo</code> – Full control of private repositories (to read milestones & issues)</li>
          </ul>
        </div>
        <div className="token-input__warning">
          <strong>Security Note:</strong> This token is stored in your browser's session storage 
          and provides full access to your private repositories. Only use this app on trusted devices.
        </div>
      </div>

      {error && <div className="token-input__error">{error}</div>}

      <button
        type="submit"
        disabled={isValidating || !token.trim()}
        className="token-input__submit"
      >
        {isValidating ? "Validating..." : "Add Token"}
      </button>
    </form>
  );
};

export default TokenInput;
