import React from "react";
import { cls } from "../../utils/css";
import { due } from "../../utils/format";
import { Milestone, WithStats } from "../../interfaces";
import "./progressBar.less";

interface Props {
  milestone: WithStats<Milestone>;
}

const className = "progressBar";

const ProgressBar: React.FC<Props> = ({ milestone }) => (
  <div className={className}>
    <div className={`${className}__top`}>
      <div className={`${className}__top__left`}>
        {milestone.dueOn && (
          <div
            className={cls(
              `${className}__top__left__due`,
              milestone.stats.meta.isOverdue &&
                `${className}__top__left__due--red`
            )}
          >
            {due(milestone.dueOn)}
          </div>
        )}
      </div>
      <div className={`${className}__top__percent`}>
        {Math.floor(milestone.stats.progress.points)}%
      </div>
    </div>
    <div className={cls(`${className}__bar`, `${className}__bar__outer`)}>
      <div
        className={cls(
          `${className}__bar`,
          `${className}__bar__inner`,
          `${className}__bar__inner--${
            milestone.stats.meta.isOnTime ? "green" : "red"
          }`
        )}
        style={{ width: `${milestone.stats.progress.points}%` }}
      />
    </div>
  </div>
);

export default ProgressBar;
