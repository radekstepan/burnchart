import React from "react";
import { useOatmilk } from "oatmilk";
import Box, { BoxType } from "../Box/Box";
import Link from "../Link/Link";
import { RequestError } from "../../utils/getIssues";
import { useReposStore } from "../../hooks/useStore";

interface Props {
  error: RequestError;
}

const Error: React.FC<Props> = ({ error }) => {
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
    <Box type={BoxType.error}>
      {error.message}
      {error.variables && (
        <div style={{ marginTop: 10 }}>
          This could be a temporary problem. You can try again later or you can{" "}
          <Link styled onClick={onRemove}>
            Remove the Repo
          </Link>
          .
        </div>
      )}
    </Box>
  );
};

export default Error;
