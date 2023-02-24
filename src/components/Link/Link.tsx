import React, { ReactNode, useCallback } from "react";
import useRemount from "../../hooks/useRemount";
import useRouter from "../../hooks/useRouter";
import { Route, RouteParams } from "../../routes";
import { cls } from "../../utils/css";
import "./link.less";

interface Props<T = Route> {
  routeName?: Route;
  state?: T extends Route ? RouteParams[T] : undefined;
  href?: string;
  styled?: boolean;
  onClick?: (evt: unknown) => void;
  children: ReactNode;
  [key: string]: unknown;
}

const Link: React.FC<Props> = ({
  routeName,
  href,
  state,
  styled,
  onClick,
  children,
  className,
  ...rest
}) => {
  const { goTo, getHref } = useRouter();
  const remount = useRemount();

  const $onClick = useCallback(
    (evt: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      if (!routeName && !onClick) {
        return;
      }
      evt.preventDefault();

      if (routeName) {
        // Force reload of this page.
        const pathName = getHref(routeName, state);
        if (window.location.pathname === pathName) {
          remount();
        } else {
          goTo(routeName, state);
        }
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
      href={routeName !== undefined ? getHref(routeName, state) : href}
      onClick={$onClick}
      target={href ? "_blank" : undefined}
      {...rest}
    >
      {children}
    </a>
  );
};

export default Link;
