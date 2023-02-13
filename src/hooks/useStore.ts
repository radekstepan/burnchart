import { useLocalStorage } from "@rehooks/local-storage";

interface Repo {
  owner: string;
  repo: string;
}

export const useReposStore = () => useLocalStorage<Repo[]>("repos");

export const useTokenStore = () => useLocalStorage<string>("token");
