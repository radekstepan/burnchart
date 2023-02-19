import React, { useCallback, useState } from "react";

type ContextValue = () => void;

const defaultValue = () => {};

export const RemountContext = React.createContext<ContextValue>(defaultValue);

interface Props {
  children: React.ReactNode;
}

const RemountProvider: React.FC<Props> = ({ children }) => {
  const [key, setKey] = useState(0);

  const value = useCallback(() => setKey((prev) => prev + 1), [setKey]);

  return (
    <RemountContext.Provider value={value}>
      <div key={key}>{children}</div>
    </RemountContext.Provider>
  );
};

export default RemountProvider;
