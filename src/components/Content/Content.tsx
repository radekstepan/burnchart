import React, { ReactNode, useEffect } from "react";
import { Title } from "../Text/Text";
import Error from "../Error/Error";
import useFirebase from "../../hooks/useFirebase";
import { cls } from "../../utils/css";
import "./content.less";

interface Props {
  title?: string;
  slim?: boolean;
  children: ReactNode;
}

const Content: React.FC<Props> = ({ title, slim, children }) => {
  // Capture auth errors on a global basis.
  const { error, clearError } = useFirebase();

  useEffect(() => {
    return () => clearError();
  }, []);

  return (
    <div className={cls("content", slim && "content--slim")}>
      {title && <Title>{title}</Title>}
      {error && <Error error={{ message: error }} onClose={clearError} />}
      {!error && children}
    </div>
  );
};

export default Content;
