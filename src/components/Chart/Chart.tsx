import React, { useEffect, useState } from "react";
import moment from "moment";
import {
  Chart as ChartJs,
  TimeScale,
  LinearScale,
  LineController,
  PointElement,
  LineElement,
  Tooltip as ChartJsTooltip,
  type ChartConfiguration,
} from "chart.js";
import "chartjs-adapter-moment";
import Tooltip, { type TooltipType } from "./Tooltip";
import useStateRef from "../../hooks/useStateRef";
import { pick } from "../../utils/object";
import * as lines from "../../utils/lines";
import { formatTimeRange } from "../../utils/format";
import { ChartD, Milestone, WithStats } from "../../interfaces";
import "./chart.less";

ChartJs.register([
  TimeScale,
  LinearScale,
  LineController,
  PointElement,
  LineElement,
  ChartJsTooltip,
]);

interface Props {
  milestone: WithStats<Milestone>;
}

enum SeriesIndex {
  ACTUAL = 0,
  TREND = 1,
  IDEAL = 2,
}

const isMeta = (obj: unknown): obj is ChartD["meta"] =>
  !!obj && typeof obj === "object" && "number" in obj && "title" in obj;

const Chart: React.FC<Props> = ({ milestone }) => {
  const [el, setEl] = useStateRef<HTMLCanvasElement>();
  const [tooltip, setTooltip] = useState<TooltipType | null>(null);

  const tickTimeFormat = formatTimeRange(
    milestone.stats.startDate,
    milestone.stats.endDate
  );

  useEffect(() => {
    if (!el) {
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
        milestone.stats.startDate,
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
        data: lines.ideal(
          milestone.stats.startDate,
          milestone.stats.endDate,
          total
        ),
      },
    ].filter(Boolean);

    const config: ChartConfiguration = {
      data: {
        // @ts-expect-error TODO
        datasets,
      },
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
              callback: tickTimeFormat,
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

  if (milestone.stats.meta.isEmpty) {
    return null;
  }

  return (
    <div className="chart">
      <Tooltip tooltip={tooltip} />
      <canvas ref={setEl} />
    </div>
  );
};

export default Chart;
