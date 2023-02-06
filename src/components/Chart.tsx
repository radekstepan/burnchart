import React from "react";
import ApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Milestone, WithStats } from "../interfaces";
import "./chart.less";

interface Props {
  milestone: WithStats<Milestone>;
}

const Chart: React.FC<Props> = ({ milestone }) => {
  const { isEmpty } = milestone.stats.meta;

  if (isEmpty) {
    return null;
  }

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
      events: {
        markerClick(e, chart, options) {
          console.log(e, chart, options);
        },
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
        formatter: (val) => (val / 1000000).toFixed(0),
      },
    },
    xaxis: {
      type: "datetime",
      axisBorder: {
        show: false,
      },
      axisTicks: {
        color: "",
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
      custom: ({ series, seriesIndex, dataPointIndex, w }) =>
        `<a class="tooltip">
          #${dataPointIndex}: Reticulate splines on Rails:ActiveIndex
          </a>
        `,
    },
    theme: {
      palette: "palette9",
    },
  };
  const series = [
    {
      name: "actual",
      data: [
        [1324508400000, 34],
        [1324594800000, 54],
        [1326236400000, 43],
      ],
    },
  ];

  return <ApexChart className="chart" options={options} series={series} />;
};

export default Chart;
