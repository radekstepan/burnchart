import React, { useCallback, useMemo, useState } from "react";
import ProgressBar from "../ProgressBar/ProgressBar";
import Link from "../Link/Link";
import Icon from "../Icon/Icon";
import useIssues from "../../hooks/useIssues";
import { sortBy, SortBy } from "../../utils/sort";
import addStats from "../../utils/addStats";
import "./table.less";

const sortFns = [SortBy.priority, SortBy.name, SortBy.progress];

type UseIssues = ReturnType<typeof useIssues>;

interface Props extends UseIssues {
  heading: string;
}

const Table: React.FC<Props> = ({ heading, data }) => {
  const [sortOrder, setSortOrder] = useState<SortBy>(SortBy.priority);

  const onSort = useCallback(() => {
    const i = 1 + sortFns.indexOf(sortOrder);
    if (i === sortFns.length) {
      setSortOrder(sortFns[0]);
    } else {
      setSortOrder(sortFns[i]);
    }
  }, [sortOrder]);

  const withStats = useMemo(() => data.map(addStats), [data]);
  const sorted = useMemo(
    () => sortBy(withStats, sortOrder),
    [withStats, sortOrder]
  );

  return (
    <div className="tbl">
      <div className="header">
        <div className="heading">{heading}</div>
        <div className="sort">
          <Link onClick={onSort}>
            <Icon name="sort" /> Sorted by {sortOrder}
          </Link>
        </div>
      </div>
      <div className="table">
        <div className="table__body">
          {sorted.map((d) => (
            <div className="table__row" key={d.id}>
              <div className="table__cell">
                <Link
                  className="strong"
                  routeName="milestones"
                  state={{ owner: d.owner, repo: d.repo }}
                >
                  {d.owner}/{d.repo}
                </Link>
              </div>
              <div className="table__cell">
                <Link
                  routeName="milestone"
                  state={{
                    owner: d.owner,
                    repo: d.repo,
                    number: "" + d.number,
                  }}
                >
                  {d.title}
                </Link>
              </div>
              <div className="table__cell">
                <ProgressBar milestone={d} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Table;
