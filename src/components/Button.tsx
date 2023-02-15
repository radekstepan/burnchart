import React, { ReactNode } from "react";
import "./button.less";

interface Props {
  onClick: (evt: unknown) => void;
  children: ReactNode;
}

const Button: React.FC<Props> = ({ onClick, children }) => {
  return (
    <button className="button" onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
