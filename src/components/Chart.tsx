import React from "react";
import ApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Milestone, WithStats } from "../interfaces";
import * as lines from "../utils/lines";
import "./chart.less";

interface Props {
  milestone: WithStats<Milestone>;
}

const Chart: React.FC<Props> = ({ milestone }) => {
  const { isEmpty } = milestone.stats.meta;

  if (isEmpty) {
    return null;
  }

  const actual = {
    name: "actual",
    data: lines.actual(
      milestone.issues.closed.nodes,
      milestone.createdAt,
      milestone.issues.closed.size + milestone.issues.open.size
    ),
  };

  const series = [
    actual,
    {
      name: "trend",
      data: lines.trend(actual.data, milestone.createdAt, milestone.dueOn),
    },
  ];

  const options: ApexOptions = {
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
      size: 3,
      hover: {
        size: 5,
      },
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
      width: 2,
    },
    legend: {
      show: false,
    },
    tooltip: {
      custom: ({ dataPointIndex }) => {
        const { meta } = actual.data[dataPointIndex];
        // TODO do not render the start of the chart
        if (meta) {
          // TODO truncate long text
          return `<div class="tooltip">#${meta.number}: ${meta.title}</div>`;
        }
      },
    },
    theme: {
      palette: "palette9",
    },
  };

  return <ApexChart className="chart" options={options} series={series} />;
};

export default Chart;
