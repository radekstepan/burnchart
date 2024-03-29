import React, { useCallback, useMemo, useState } from "react";
import ProgressBar from "../ProgressBar/ProgressBar";
import Link from "../Link/Link";
import Icon from "../Icon/Icon";
import { Title } from "../Text/Text";
import { Menu, MenuItem } from "../Menu/Menu";
import { Route } from "../../routes";
import useIssues from "../../hooks/useIssues";
import useReposStore from "../../hooks/useReposStore";
import useRouter from "../../hooks/useRouter";
import { sortBy, SortBy } from "../../utils/sort";
import addStats from "../../utils/addStats";
import "./table.less";

const sortFns = [SortBy.priority, SortBy.name, SortBy.progress];

type UseIssues = ReturnType<typeof useIssues>;

interface Props extends UseIssues {
  showRemove?: boolean;
  heading?: string;
}

const Table: React.FC<Props> = ({ heading, data, showRemove }) => {
  const { goTo } = useRouter();
  const { repos, removeRepo } = useReposStore();
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

  // Remove repo.
  const onRemove = () => {
    const [{ owner, repo }] = data;
    if (!repos.length) {
      return;
    }
    removeRepo(owner, repo);
    goTo(Route.repos);
  };

  return (
    <div className="tbl">
      <div className="tbl__header">
        {heading && <Title className="tbl__header__heading">{heading}</Title>}
        {sorted.length > 1 && (
          <div className="tbl__header__sort">
            <Link onClick={onSort}>
              <Icon name="sort" /> Sorted by {sortOrder}
            </Link>
          </div>
        )}
        {showRemove && (
          <Menu>
            <MenuItem red onClick={onRemove}>
              <Icon name="delete" /> Remove this Repo
            </MenuItem>
          </Menu>
        )}
      </div>
      <div className="table">
        <div className="table__body">
          {sorted.map((d) => (
            <div className="table__row" key={d.id}>
              <div className="table__cell">
                <Link
                  className="table__text--strong"
                  routeName={Route.milestones}
                  state={{ owner: d.owner, repo: d.repo }}
                >
                  {d.owner}/{d.repo}
                </Link>
              </div>
              <div className="table__cell">
                <Link
                  routeName={Route.milestone}
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
