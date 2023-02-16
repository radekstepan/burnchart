import React, { ReactNode } from "react";
import { cls } from "../utils/css";
import "./box.less";

export enum BoxType {
  error = "error",
}

export interface BoxProps {
  absolute?: boolean;
  type?: BoxType;
  children: ReactNode;
}

const Box: React.FC<BoxProps> = ({ absolute, type, children }) => (
  <div
    className={cls("box", absolute && "box--absolute", type && `box--${type}`)}
  >
    {children}
  </div>
);

export default Box;
