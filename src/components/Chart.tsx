import React, { useCallback, useEffect, useState } from "react";
import {
  Chart as ChartJs,
  type ChartData,
  type ChartConfiguration,
  type ChartItem,
} from "chart.js/auto"; // TODO optimize
import "chartjs-adapter-moment";
import { Milestone, WithStats } from "../interfaces";
import * as lines from "../utils/lines";
import "./chart.less";
import moment from "moment";
import useStateRef from "../hooks/useStateRef";

interface Props {
  milestone: WithStats<Milestone>;
}

enum SeriesIndex {
  ACTUAL = 0,
  TREND = 1,
  IDEAL = 2,
}

interface Tooltip {
  i: number;
  x: number;
  y: number;
}

const Chart: React.FC<Props> = ({ milestone }) => {
  const [el, setEl] = useStateRef<ChartItem>();
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
        data: trend,
      },
      {
        borderWidth: 3,
        borderColor: "#cacaca",
        pointStyle: false,
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
            type: "timeseries",
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
              setTooltip({
                i: dataPoint.dataIndex,
                x: tooltipModel.caretX,
                y: tooltipModel.caretY,
              });
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
    <div className="chart">
      {tooltip?.i && (
        <div className="tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          #{milestone.issues.closed.nodes[tooltip.i - 1].number}:
          {milestone.issues.closed.nodes[tooltip.i - 1].title}
        </div>
      )}
      <canvas ref={setEl} />
    </div>
  );
};

export default Chart;
