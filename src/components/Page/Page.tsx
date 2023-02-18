import React from "react";
import Oatmilk from "oatmilk";
import Loader from "../Loader/Loader";
import "./page.less";

const Page: React.FC = () => (
  <div className="page">
    <React.Suspense fallback={<Loader speed={2} />}>
      <Oatmilk.RouterView />
    </React.Suspense>
  </div>
);

export default Page;
