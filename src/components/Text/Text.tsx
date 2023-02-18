import React, { ReactNode } from "react";
import { cls } from "../../utils/css";
import "./text.less";

interface Props {
  className?: string;
  children: ReactNode;
}

const Text: React.FC<Props & { suffix: string }> = ({
  suffix,
  className,
  children,
}) => <div className={cls(`text__${suffix}`, className)}>{children}</div>;

export const Title: React.FC<Props> = (props) => (
  <Text suffix="title" {...props} />
);

export const Paragraph: React.FC<Props> = (props) => (
  <Text suffix="paragraph" {...props} />
);
