import React, { useCallback, useMemo, useState } from "react";
import { Text, Pane, Strong, Table, Heading, Link } from "evergreen-ui";
import { useReposStore } from "../hooks/useStore";
import ProgressBar from "../components/ProgressBar";
import useIssues from "../hooks/useIssues";
import { sortBy, SortBy } from "../utils/sort";
import "./repos.less";

const sortFns = [SortBy.priority, SortBy.name, SortBy.progress];

function Repos() {
  const [repos] = useReposStore();
  const [sortOrder, setSortOrder] = useState<SortBy>(SortBy.priority);
  const { error, loading, data } = useIssues(
    repos?.map(({ owner, repo }) => [owner, repo]) || null
  );

  const onSort = useCallback(() => {
    const i = 1 + sortFns.indexOf(sortOrder);
    if (i === sortFns.length) {
      setSortOrder(sortFns[0]);
    } else {
      setSortOrder(sortFns[i]);
    }
  }, [sortOrder]);

  const sorted = useMemo(() => sortBy(data, sortOrder), [data, sortOrder]);

  if (!repos?.length) {
    // TODO show a hero banner
    return null;
  }

  if (error || loading) {
    // TODO
    return null;
  }

  return (
    <Pane flex={1} id="repos">
      <Pane display="flex" flex={1}>
        <Heading size={600}>Projects</Heading>
        <Pane flexGrow={1} className="sort">
          <Link onClick={onSort}>Sorted by {sortOrder}</Link>
        </Pane>
      </Pane>
      <Table width="100%">
        <Table.Body>
          {sorted.map((d) => (
            <Table.Row key={d.id}>
              <Table.TextCell>
                <Strong size={300}>
                  {d.owner}/{d.repo}
                </Strong>
              </Table.TextCell>
              <Table.TextCell>
                <Text size={300} color="gray600">
                  {d.title}
                </Text>
              </Table.TextCell>
              {
                <Table.TextCell>
                  <ProgressBar milestone={d} />
                </Table.TextCell>
              }
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Pane>
  );
}

export default Repos;
