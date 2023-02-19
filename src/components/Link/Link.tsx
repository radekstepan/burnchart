import React, { ReactNode, useCallback } from "react";
import { useOatmilk } from "oatmilk";
import useRemount from "../../hooks/useRemount";
import { cls } from "../../utils/css";
import "./link.less";

interface Props {
  routeName?: string;
  href?: string;
  state?: { [key: string]: string };
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
  const { getHref, goTo, ...milk } = useOatmilk();
  const remount = useRemount();

  const $onClick = useCallback(
    // TODO type
    (evt: any) => {
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
      href={routeName ? getHref(routeName, state) : href}
      onClick={$onClick}
      target={href ? "_blank" : undefined}
      {...rest}
    >
      {children}
    </a>
  );
};

export default Link;
