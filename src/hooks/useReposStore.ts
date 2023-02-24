import { useCallback, useEffect, useMemo } from "react";
import { useLocalStorage } from "@rehooks/local-storage";

interface Repo {
  owner: string;
  repo: string;
}

interface LegacyRepo {
  owner: string;
  name: string;
}

type UseReposStore = () => {
  repos: Repo[];
  addRepo: (owner: string, repo: string) => void;
  removeRepo: (owner: string, repo: string) => void;
};

const useReposStore: UseReposStore = () => {
  const [repos, setRepos] = useLocalStorage<Repo[]>("repos");
  const [legacy, , deleteLegacy] =
    useLocalStorage<LegacyRepo[]>("lscache-projects");

  const addRepo = useCallback(
    (owner: string, repo: string) => {
      const newRepo = { owner, repo };

      if (!repos) {
        setRepos([newRepo]);
        return;
      }

      if (repos.some((r) => r.owner === owner && r.repo === repo)) {
        return;
      }

      setRepos(repos.concat([newRepo]));
    },
    [repos, setRepos]
  );

  const removeRepo = useCallback(
    (owner: string, repo: string) => {
      if (!repos) {
        return;
      }
      const i = repos.findIndex((r) => r.owner === owner && r.repo === repo);
      if (i === -1) {
        return;
      }
      const newRepos = [...repos];
      newRepos.splice(i, 1);
      setRepos(newRepos);
    },
    [repos, setRepos]
  );

  // Migrate legacy
  useEffect(() => {
    if (!legacy) {
      return;
    }
    const newRepos = legacy.reduce(
      (acc, item) => {
        const { owner, name } = item;
        if (!acc.some((r) => r.owner === owner && r.repo === name)) {
          return acc.concat([{ owner, repo: name }]);
        }
        return acc;
      },
      [...(repos || [])]
    );

    setRepos(newRepos);
    deleteLegacy();
  }, []);

  return useMemo(
    () => ({
      repos: repos || [],
      addRepo,
      removeRepo,
    }),
    [repos, addRepo, removeRepo]
  );
};

export default useReposStore;
