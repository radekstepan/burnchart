import React from "react";
import { useOatmilk } from "oatmilk";
import Box, { BoxType } from "../Box/Box";
import Link from "../Link/Link";
import Icon from "../Icon/Icon";
import { useReposStore } from "../../hooks/useStore";
import { ErrorWithVars } from "../../interfaces";

interface Props {
  error: ErrorWithVars;
  onClose?: () => void;
}

const Error: React.FC<Props> = ({ error, onClose }) => {
  const { goTo } = useOatmilk();
  const [repos, setRepos] = useReposStore();

  const onRemove = () => {
    if (
      !repos ||
      !error.variables ||
      !("owner" in error.variables) ||
      !("repo" in error.variables)
    ) {
      return;
    }
    const { owner, repo } = error.variables;
    setRepos(repos.filter((r) => r.owner !== owner || r.repo !== repo));
    goTo("repos");
  };

  return (
    <Box type={BoxType.error} onClose={onClose}>
      {error.message}
      {error.variables && (
        <div style={{ marginTop: 10 }}>
          This could be a temporary problem. You can try again later or you can{" "}
          <Link styled onClick={onRemove}>
            Remove this Repo
          </Link>
          .
        </div>
      )}
    </Box>
  );
};

export default Error;
