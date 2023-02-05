import React, {
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Link as UILink } from "evergreen-ui";
import { useOatmilk } from "oatmilk";

interface Props {
  routeName: string;
  state?: { [key: string]: string };
  children: ReactNode;
}

const Link: React.FC<Props> = ({ routeName, state, children, ...rest }) => {
  const { getHref, goTo } = useOatmilk();

  const onClick = useCallback(
    (evt: any) => {
      // TODO type
      evt.preventDefault();
      goTo(routeName, state);
    },
    [goTo]
  );

  return (
    <UILink href={getHref(routeName, state)} onClick={onClick} {...rest}>
      {children}
    </UILink>
  );
};

export default Link;
