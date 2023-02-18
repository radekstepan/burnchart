import React, { ReactNode } from "react";
import { Title } from "../Text/Text";
import { cls } from "../../utils/css";
import "./content.less";

interface Props {
  title?: string;
  slim?: boolean;
  children: ReactNode;
}

const Content: React.FC<Props> = ({ title, slim, children }) => (
  <div className={cls("content", slim && "content--slim")}>
    {title && <Title>{title}</Title>}
    {children}
  </div>
);

export default Content;
