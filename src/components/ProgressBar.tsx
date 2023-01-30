import React, { memo, useEffect, useState } from "react";
import { Pane, Spinner } from "evergreen-ui";
import { cls } from "../utils/css";
import { due } from "../utils/format";
import { Milestone, Stats, WithStats } from "../interfaces";
import "./progressBar.less";

interface Props {
  milestone: WithStats<Milestone>;
}

const ProgressBar: React.FC<Props> = ({ milestone }) => (
  <div className="progress">
    <span className="percent">
      {Math.floor(milestone.stats.progress.points)}%
    </span>
    {milestone.due_on && (
      <span className={cls("due", { red: milestone.stats.isOverdue })}>
        {due(milestone.due_on)}
      </span>
    )}
    <div className="outer bar">
      <div
        className={cls("inner", "bar", {
          green: milestone.stats.isOnTime,
          red: !milestone.stats.isOnTime,
        })}
        style={{ width: `${milestone.stats.progress.points}%` }}
      />
    </div>
  </div>
);

export default ProgressBar;
