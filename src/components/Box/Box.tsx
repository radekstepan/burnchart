import React, { ReactNode } from "react";
import { cls } from "../../utils/css";
import "./box.less";

export enum BoxType {
  error = "error",
}

export interface BoxProps {
  absolute?: boolean;
  type?: BoxType;
  onClose?: () => void;
  children: ReactNode;
}

const Box: React.FC<BoxProps> = ({ absolute, type, onClose, children }) => (
  <div
    className={cls("box", absolute && "box--absolute", type && `box--${type}`)}
  >
    {onClose && (
      <button className="box__close" onClick={onClose}>
        &#10005;
      </button>
    )}
    {children}
  </div>
);

export default Box;
