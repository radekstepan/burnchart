import React, { memo, useEffect, useState } from "react";
import { Pane, Spinner, Text } from "evergreen-ui";
import { cls } from "../utils/css";
import { due } from "../utils/format";
import { Milestone, Stats, WithStats } from "../interfaces";
import "./progressBar.less";

interface Props {
  milestone: WithStats<Milestone>;
}

const ProgressBar: React.FC<Props> = ({ milestone }) => (
  <div className="progressBar">
    <Pane display="flex">
      <Pane flexGrow="1">
        {milestone.dueOn && (
          <div className={cls("due", milestone.stats.meta.isOverdue && "red")}>
            {due(milestone.dueOn)}
          </div>
        )}
      </Pane>
      <div className="percent">
        {Math.floor(milestone.stats.progress.points)}%
      </div>
    </Pane>
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
