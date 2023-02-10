import React, { useCallback, useEffect, useState } from "react";
import {
  Chart as ChartJs,
  type ChartData,
  type ChartConfiguration,
} from "chart.js/auto"; // TODO optimize
import "chartjs-adapter-moment";
import { Milestone, WithStats } from "../interfaces";
import * as lines from "../utils/lines";
import "./chart.less";

interface Props {
  milestone: WithStats<Milestone>;
}

enum SeriesIndex {
  ACTUAL = 0,
  TREND = 1,
  IDEAL = 2,
}

const Chart: React.FC<Props> = ({ milestone }) => {
  const [el, setEl] = useState();

  // TODO useRef
  const handleRef = useCallback((node) => {
    setEl(node);
  }, []);

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

    const datasets = [
      actual,
      {
        borderWidth: 1,
        borderColor: "#64584c",
        pointStyle: false,
        borderDash: [5, 5],
        data: lines.trend(actual.data, milestone.createdAt, milestone.dueOn),
      },
      {
        borderWidth: 3,
        borderColor: "#cacaca",
        pointStyle: false,
        data: lines.ideal(milestone.createdAt, milestone.dueOn, total),
      },
    ];

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
          },
        },
        animation: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: false,
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
      <canvas ref={handleRef} />
    </div>
  );

  const options = {
    chart: {
      type: "line",
      height: 350,
      fontFamily: "MuseoSans500Regular, sans-serif",
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
      animations: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 0,
      hover: {
        size: 0,
      },
      discrete: actual.data.map((d, i) => ({
        seriesIndex: SeriesIndex.ACTUAL,
        dataPointIndex: i + 1,
        fillColor: "#e3e3e3",
        strokeColor: "#fff",
        size: 3,
        shape: "circle",
      })),
    },
    yaxis: {
      axisBorder: {
        show: false,
      },
      labels: {
        // TODO use rounding?
        formatter: (val, opts) => val.toFixed(0),
      },
    },
    xaxis: {
      type: "datetime",
      crosshairs: {
        show: true,
      },
      axisBorder: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    stroke: {
      width: [1, 1, 1],
      curve: "straight",
      dashArray: [0, 5, 8],
    },
    legend: {
      show: false,
    },
    tooltip: {
      shared: true,
      enabledOnSeries: [SeriesIndex.ACTUAL],
      custom: ({ dataPointIndex, seriesIndex }) => {
        if (seriesIndex !== SeriesIndex.ACTUAL) {
          return null;
        }
        const { meta } = actual.data[dataPointIndex];
        // TODO do not render the start of the chart
        if (!meta) {
          return null;
        }
        // TODO truncate long text
        return `<div class="tooltip">#${meta.number}: ${meta.title}</div>`;
      },
    },
    theme: {
      palette: "palette9",
    },
  };

  // return <ApexChart className="chart" options={options} series={series} />;
};

export default Chart;
