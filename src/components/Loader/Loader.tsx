import React from "react";
import ContentLoader from "react-content-loader";
import "./loader.less";

interface Props {
  speed: number;
}

const Loader: React.FC<Props> = ({ speed }) => (
  <ContentLoader
    className="loader"
    speed={speed}
    width={600}
    height={140}
    foregroundColor="#edeff5"
    title={speed ? "Loading" : "Placeholder"}
  >
    <rect x="0" y="0" rx="5" ry="5" width="600" height="20" />
    <rect x="0" y="40" rx="5" ry="5" width="600" height="20" />
    <rect x="0" y="80" rx="5" ry="5" width="600" height="20" />
    <rect x="0" y="120" rx="5" ry="5" width="600" height="20" />
  </ContentLoader>
);

export default Loader;
