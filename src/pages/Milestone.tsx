import React, { useEffect, useMemo } from "react";
import { useOatmilk } from "oatmilk";
import Content from "../components/Content/Content";
import Chart from "../components/Chart/Chart";
import Loader from "../components/Loader/Loader";
import Status, { WhySignIn } from "../components/Status/Status";
import Error from "../components/Error/Error";
import Link from "../components/Link/Link";
import { Title } from "../components/Text/Text";
import useIssues from "../hooks/useIssues";
import useFirebase from "../hooks/useFirebase";
import { useReposStore, useTokenStore } from "../hooks/useStore";
import { Job } from "../utils/getIssues";
import addStats from "../utils/addStats";

function Milestone() {
  const { signIn } = useFirebase();
  const [token] = useTokenStore();
  const oatmilk = useOatmilk();
  const [repos, setRepos] = useReposStore();

  const { owner, repo, number } = oatmilk.state;

  // Save the repo?
  useEffect(() => {
    document.title = `${owner}/${repo}/${number}`;

    if (!repos) {
      setRepos([{ owner, repo }]);
      return;
    }
    if (repos.find((r) => r.owner === owner && r.repo === repo)) {
      return;
    }
    setRepos(repos.concat([{ owner, repo }]));
  }, [owner, repo]);

  const jobs = useMemo<Job[] | null>(() => {
    return [[owner, repo, number]];
  }, [owner, repo, number]);

  const res = useIssues(jobs);
  const { data } = res;

  const milestone = useMemo(() => {
    if (!data.length) {
      return null;
    }
    return addStats(data[0]);
    // All the data arrive at the same time.
  }, [data.length]);

  if (!token) {
    return (
      <Content title={`${owner}/${repo}/${number}`}>
        <Status>
          <>
            <Link styled onClick={signIn}>
              Sign In
            </Link>{" "}
            to view your milestone
            <WhySignIn />
          </>
        </Status>
      </Content>
    );
  }

  if (res.error) {
    return (
      <Content title={`${owner}/${repo}/${number}`}>
        <Error error={res.error} />
      </Content>
    );
  }

  if (res.loading) {
    return (
      <Content title={`${owner}/${repo}/${number}`}>
        <Loader speed={2} />
      </Content>
    );
  }

  // TODO?
  if (!milestone) {
    return null;
  }

  return (
    <Content>
      <Title>
        {owner}/{repo} {milestone.title}
      </Title>
      <Chart milestone={milestone} />
    </Content>
  );
}

export default Milestone;
