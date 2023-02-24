import React, { ReactNode, useCallback } from "react";
import useRemount from "../../hooks/useRemount";
import useRouter from "../../hooks/useRouter";
import { Route, RouteParams } from "../../routes";
import { cls } from "../../utils/css";
import "./link.less";

interface Props<T = Route> {
  /** The name of the route to navigate to. If provided, the component will render an anchor that links to the specified route. */
  routeName?: Route;
  /** An object containing the parameters to use when navigating to the route. */
  state?: T extends Route ? RouteParams[T] : undefined;
  /** The URL to navigate to. If provided, the component will render an anchor that links to the specified URL. */
  href?: string;
  /** A flag that determines whether or not to apply a styling to the link. */
  styled?: boolean;
  /** A callback function that will be called when the link is clicked. */
  onClick?: (evt: unknown) => void;
  /** The content of the link. */
  children: ReactNode;
  /** Any additional props will be spread to the underlying anchor element. */
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
