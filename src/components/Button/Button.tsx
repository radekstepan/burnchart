import React, { ReactNode } from "react";
import { cls } from "../../utils/css";
import "./button.less";

interface Props {
  withInput?: boolean;
  onClick: (evt: unknown) => void;
  children: ReactNode;
}

const Button: React.FC<Props> = ({ withInput, onClick, children }) => {
  const className = "button";

  return (
    <button
      className={cls(className, withInput && `${className}--with-input`)}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
