import React from "react";
import Box, { BoxType } from "../Box/Box";
import Link from "../Link/Link";
import useReposStore from "../../hooks/useReposStore";
import useRouter from "../../hooks/useRouter";
import { ErrorWithVars } from "../../interfaces";

interface Props {
  error: ErrorWithVars;
  onClose?: () => void;
}

const Error: React.FC<Props> = ({ error, onClose }) => {
  const { goTo } = useRouter();
  const { repos, removeRepo } = useReposStore();

  const onRemove = () => {
    if (
      !repos.length ||
      !error.variables ||
      !("owner" in error.variables) ||
      !("repo" in error.variables)
    ) {
      return;
    }
    const { owner, repo } = error.variables;
    removeRepo(owner as string, repo as string);
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
