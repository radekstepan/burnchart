import React, { useEffect, useState } from "react";
import moment from "moment";
import {
  Chart as ChartJs,
  TimeScale,
  LinearScale,
  LineController,
  PointElement,
  LineElement,
} from "chart.js";
import {
  type ChartData,
  type ChartConfiguration,
  type TooltipModel,
} from "chart.js/dist/types";
import "chartjs-adapter-moment";
import * as lines from "../../utils/lines";
import useStateRef from "../../hooks/useStateRef";
import { ChartD, Milestone, WithStats } from "../../interfaces";
import { pick } from "../../utils/object";
import "./chart.less";

ChartJs.register([
  TimeScale,
  LinearScale,
  LineController,
  PointElement,
  LineElement,
]);

interface Props {
  milestone: WithStats<Milestone>;
}

enum SeriesIndex {
  ACTUAL = 0,
  TREND = 1,
  IDEAL = 2,
}

interface Tooltip
  extends Pick<
    TooltipModel,
    "x" | "y" | "caretX" | "caretY" | "width" | "xAlign" | "yAlign"
  > {
  meta: NonNullable<ChartD["meta"]>;
}

const isMeta = (obj: unknown): obj is ChartD["meta"] =>
  !!obj && typeof obj === "object" && "number" in obj && "title" in obj;

const Chart: React.FC<Props> = ({ milestone, ...rest }) => {
  const [el, setEl] = useStateRef<HTMLCanvasElement>();
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  useEffect(() => {
    if (!el || milestone.stats.meta.isEmpty) {
      return;
    }

    const total = milestone.issues.closed.size + milestone.issues.open.size;

    const actual = {
      borderWidth: 3,
      borderColor: "#64584c",
      pointBackgroundColor: "#64584c",
      lineTension: 0,
      data: lines.actual(
        milestone.issues.closed.nodes,
        milestone.createdAt,
        total
      ),
    };

    const trend = lines.trend(actual.data);

    const datasets = [
      actual,
      trend && {
        borderWidth: 1,
        borderColor: "#64584c",
        pointStyle: false,
        borderDash: [5, 5],
        lineTension: 0,
        data: trend,
      },
      {
        borderWidth: 3,
        borderColor: "#cacaca",
        pointStyle: false,
        lineTension: 0,
        data: lines.ideal(milestone.createdAt, milestone.dueOn, total),
      },
    ].filter(Boolean);

    // TODO fix types
    const data: ChartData<"line"> = {
      datasets: datasets as any,
    };

    const config: ChartConfiguration = {
      data,
      type: "line",
      options: {
        scales: {
          x: {
            type: "time",
            grid: {
              color: "#f2f2f2",
            },
            ticks: {
              maxTicksLimit: 12,
              // TODO come up with a "nice" date formatter
              callback: function (value, index, ticks) {
                return moment(value).fromNow();
              },
            },
          },
          y: {
            grid: {
              color: "#f2f2f2",
            },
            ticks: {
              // Show only whole numbers.
              precision: 0,
            },
          },
        },
        animation: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: false,
            callbacks: {
              // For accurate positioning.
              label: (context) => {
                const node =
                  milestone.issues.closed.nodes[context.dataIndex - 1];
                if (node) {
                  return `#${node.number}: ${node.title}`;
                }
                return "";
              },
            },
            external: (context) => {
              const tooltipModel = context.tooltip;
              if (!tooltipModel.opacity) {
                setTooltip(null);
                return;
              }

              const [dataPoint] = tooltipModel.dataPoints;
              // Show only on actual.
              if (dataPoint.datasetIndex !== SeriesIndex.ACTUAL) {
                return;
              }
              // Skip the start of the sprint.
              if (!dataPoint.dataIndex) {
                return;
              }
              const [point] = tooltipModel.dataPoints;
              if (
                point.raw &&
                typeof point.raw === "object" &&
                "meta" in point.raw
              ) {
                if (point.raw.meta && isMeta(point.raw.meta)) {
                  setTooltip({
                    meta: point.raw.meta,
                    ...pick(tooltipModel, [
                      "x",
                      "y",
                      "caretX",
                      "caretY",
                      "width",
                      "xAlign",
                      "yAlign",
                    ]),
                  });
                }
              }
            },
          },
        },
      },
    };

    const chart = new ChartJs(el, config);

    return () => {
      chart.destroy();
    };
  }, [el]);

  return (
    <div className="chart" {...rest}>
      {tooltip && (
        <div
          className="tooltip"
          style={{ left: tooltip.x, top: tooltip.y, maxWidth: tooltip.width }}
        >
          #{tooltip.meta.number}:{tooltip.meta.title}
        </div>
      )}
      <canvas ref={setEl} />
    </div>
  );
};

export default Chart;
