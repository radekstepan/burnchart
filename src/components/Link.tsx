import React, {
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Link as UILink } from "evergreen-ui";
import { useOatmilk } from "oatmilk";
import "./link.less";
import { cls } from "../utils/css";

interface Props {
  routeName?: string;
  state?: { [key: string]: string };
  onClick?: (evt: unknown) => void;
  children: ReactNode;
  [key: string]: unknown;
}

const Link: React.FC<Props> = ({
  routeName,
  state,
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
      className={cls("link", className)}
      href={routeName ? getHref(routeName, state) : undefined}
      onClick={$onClick}
      {...rest}
    >
      {children}
    </a>
  );
};

export default Link;
