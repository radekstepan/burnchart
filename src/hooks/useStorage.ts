import { useMemo } from "react";
import {
  writeStorage,
  deleteFromStorage,
  useLocalStorage,
} from "@rehooks/local-storage";
import { Repo } from "../interfaces";

const isRepo = (obj: unknown): obj is Repo =>
  !!obj &&
  typeof obj === "object" &&
  "owner" in obj &&
  typeof obj["owner"] === "string" &&
  "repo" in obj &&
  typeof obj["repo"] === "string";

export const useReposStorage = () => useLocalStorage<Repo[]>("repos");
