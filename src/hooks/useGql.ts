import { graphql } from "@octokit/graphql";
import { GraphQLClient } from "graphql-request";
import { useEffect } from "react";
import { Repo } from "../interfaces";
import { useTokenStore } from "./useStore";
import GetMilestonesQuery from "../queries/GetMilestones";

export const client = new GraphQLClient("https://api.github.com/graphql");

const useGql = (repos: Repo[]) => {
  const [token] = useTokenStore();

  useEffect(() => {
    if (!token) {
      return;
    }

    client.setHeader("Authorization", `token ${token}`);

    const run = async () => {
      const res = await client.request(GetMilestonesQuery, {
        owner: "rails",
        name: "rails",
      });

      console.log(res);
    };

    run();
  }, [token]);
};

export default useGql;
