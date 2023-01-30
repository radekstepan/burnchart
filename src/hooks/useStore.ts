import { useEffect, useMemo } from "react";
import {
  writeStorage,
  deleteFromStorage,
  useLocalStorage,
} from "@rehooks/local-storage";
import { Repo } from "../interfaces";
import { AuthCredential } from "@firebase/auth";

const isRepo = (obj: unknown): obj is Repo =>
  !!obj &&
  typeof obj === "object" &&
  "owner" in obj &&
  typeof obj["owner"] === "string" &&
  "repo" in obj &&
  typeof obj["repo"] === "string";

export const useReposStore = () => {
  return useLocalStorage<Repo[]>("repos");

  // useEffect(() => {
  //   if (!repos) {
  //     setRepos([{owner: 'rails', repo: 'rails'}]);
  //   }
  // }, [repos]);

  // return repos;
};

export const useTokenStore = () => useLocalStorage<string>("token");
