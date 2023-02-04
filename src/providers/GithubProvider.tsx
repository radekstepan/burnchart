import React, { useEffect, useMemo, useState } from "react";
import { Milestone } from "../interfaces";

interface ContextValue {
  issues: Map<string, Milestone>;
}

const defaultValue = new Map();

export const GithubContext = React.createContext<ContextValue>(defaultValue);

interface Props {
  children?: React.ReactNode;
}

// TODO store the data here between navigation or always refresh?
const GithubProvider: React.FC<Props> = ({ children }) => {
  const [data, setData] = useState(new Map<string, Milestone>());

  const value = useMemo(() => {}, [data]);

  return (
    <GithubContext.Provider value={data}>{children}</GithubContext.Provider>
  );
};

export default GithubProvider;
