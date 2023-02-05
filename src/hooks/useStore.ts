import { useLocalStorage } from "@rehooks/local-storage";

interface Repo {
  owner: string;
  repo: string;
}

const isRepo = (obj: unknown): obj is Repo =>
  !!obj &&
  typeof obj === "object" &&
  "owner" in obj &&
  typeof obj["owner"] === "string" &&
  "repo" in obj &&
  typeof obj["repo"] === "string";

export const useReposStore = () => useLocalStorage<Repo[]>("repos");

export const useTokenStore = () => useLocalStorage<string>("token");
