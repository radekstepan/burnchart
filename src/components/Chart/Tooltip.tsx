import React from "react";
import { type TooltipModel } from "chart.js";
import { ChartD } from "../../interfaces";

export interface TooltipType
  extends Pick<
    TooltipModel,
    "x" | "y" | "caretX" | "caretY" | "width" | "xAlign" | "yAlign"
  > {
  meta: NonNullable<ChartD["meta"]>;
}

interface Props {
  tooltip: TooltipType | null;
}

const Tooltip: React.FC<Props> = ({ tooltip }) => {
  if (!tooltip) {
    return null;
  }

  return (
    <div
      className="tooltip"
      style={{ left: tooltip.x, top: tooltip.y, maxWidth: tooltip.width }}
    >
      #{tooltip.meta.number}:{tooltip.meta.title}
    </div>
  );
};

export default Tooltip;
