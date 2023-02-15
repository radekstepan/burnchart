import React from "react";
import { cls } from "../utils/css";
import { due } from "../utils/format";
import { Milestone, WithStats } from "../interfaces";
import "./progressBar.less";

interface Props {
  milestone: WithStats<Milestone>;
}

const ProgressBar: React.FC<Props> = ({ milestone }) => (
  <div className="progressBar">
    <div className="top">
      <div className="left">
        {milestone.dueOn && (
          <div className={cls("due", milestone.stats.meta.isOverdue && "red")}>
            {due(milestone.dueOn)}
          </div>
        )}
      </div>
      <div className="percent">
        {Math.floor(milestone.stats.progress.points)}%
      </div>
    </div>
    <div className="outer bar">
      <div
        className={cls(
          "inner",
          "bar",
          milestone.stats.meta.isOnTime ? "green" : "red"
        )}
        style={{ width: `${milestone.stats.progress.points}%` }}
      />
    </div>
  </div>
);

export default ProgressBar;
