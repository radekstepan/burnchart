import React, { ReactNode } from "react";
import "./text.less";

interface Props {
  children: ReactNode;
}

export const Title: React.FC<Props> = ({ children }) => (
  <div className="text__title">{children}</div>
);

export const Paragraph: React.FC<Props> = ({ children }) => (
  <div className="text__paragraph">{children}</div>
);
