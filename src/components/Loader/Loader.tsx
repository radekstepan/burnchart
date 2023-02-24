import React from "react";
import ContentLoader from "react-content-loader";
import "./loader.less";

const LINES = 5;
const LINE_HEIGHT = 20;
const LINE_GAP = 30;

interface Props {
  speed: number;
}

const Loader: React.FC<Props> = ({ speed }) => (
  <ContentLoader
    className="loader"
    speed={speed}
    width="100%"
    height={LINES * (LINE_HEIGHT + LINE_GAP) - LINE_GAP}
    foregroundColor="#edeff5"
    title={speed ? "Loading" : ""}
  >
    {Array(LINES)
      .fill(1)
      .map((_, i) => (
        <rect
          key={i}
          x="0"
          y={i * (LINE_HEIGHT + LINE_GAP)}
          rx="5"
          ry="5"
          width="100%"
          height={LINE_HEIGHT}
        />
      ))}
  </ContentLoader>
);

export default Loader;
