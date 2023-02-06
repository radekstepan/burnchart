import React, { useCallback, useMemo, useState } from "react";
import { Pane, Heading, Text, Strong, Table as UITable } from "evergreen-ui";
import ProgressBar from "./ProgressBar";
import Link from "./Link";
import useIssues from "../hooks/useIssues";
import { sortBy, SortBy } from "../utils/sort";
import "./table.less";

const sortFns = [SortBy.priority, SortBy.name, SortBy.progress];

type UseIssues = ReturnType<typeof useIssues>;

interface Props extends UseIssues {
  heading: string;
}

const Table: React.FC<Props> = ({ heading, error, loading, data }) => {
  const [sortOrder, setSortOrder] = useState<SortBy>(SortBy.priority);

  const onSort = useCallback(() => {
    const i = 1 + sortFns.indexOf(sortOrder);
    if (i === sortFns.length) {
      setSortOrder(sortFns[0]);
    } else {
      setSortOrder(sortFns[i]);
    }
  }, [sortOrder]);

  const sorted = useMemo(() => sortBy(data, sortOrder), [data, sortOrder]);

  if (error || loading) {
    // TODO
    return null;
  }

  return (
    <div className="table">
      <Pane display="flex" flex={1}>
        <Heading size={600}>{heading}</Heading>
        <Pane flexGrow={1} className="sort" onClick={onSort}>
          <Text size={300}>Sorted by {sortOrder}</Text>
        </Pane>
      </Pane>
      <UITable width="100%">
        <UITable.Body>
          {sorted.map((d) => (
            <UITable.Row key={d.id}>
              <UITable.TextCell>
                <Link
                  routeName="milestones"
                  state={{ owner: d.owner, repo: d.repo }}
                >
                  <Strong size={300}>
                    {d.owner}/{d.repo}
                  </Strong>
                </Link>
              </UITable.TextCell>
              <UITable.TextCell>
                <Text size={300} color="gray600">
                  {d.title}
                </Text>
              </UITable.TextCell>
              <UITable.TextCell>
                <ProgressBar milestone={d} />
              </UITable.TextCell>
            </UITable.Row>
          ))}
        </UITable.Body>
      </UITable>
    </div>
  );
};

export default Table;
