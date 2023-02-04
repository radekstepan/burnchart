import { useContext } from "react";
import { GithubContext } from "../providers/GithubProvider";

const useGithub = () => useContext(GithubContext);

export default useGithub;
