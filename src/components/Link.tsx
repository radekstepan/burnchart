import React, { ReactNode, useCallback } from "react";
import { useOatmilk } from "oatmilk";
import { cls } from "../utils/css";
import "./link.less";

interface Props {
  routeName?: string;
  state?: { [key: string]: string };
  styled?: boolean;
  onClick?: (evt: unknown) => void;
  children: ReactNode;
  [key: string]: unknown;
}

const Link: React.FC<Props> = ({
  routeName,
  state,
  styled,
  onClick,
  children,
  className,
  ...rest
}) => {
  const { getHref, goTo } = useOatmilk();

  const $onClick = useCallback(
    // TODO type
    (evt: any) => {
      evt.preventDefault();
      if (routeName) {
        goTo(routeName, state);
      }
      if (onClick) {
        onClick(evt);
      }
    },
    [goTo, onClick]
  );

  return (
    <a
      className={cls("link", styled && "link--styled", className)}
      href={routeName ? getHref(routeName, state) : undefined}
      onClick={$onClick}
      {...rest}
    >
      {children}
    </a>
  );
};

export default Link;
