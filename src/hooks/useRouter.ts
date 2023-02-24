import { useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import UrlPattern from "url-pattern";
import routes, { Route, RouteParam, RouteParams } from "../routes";

type UseRoute<Return, T = Route> = (
  name: T,
  state?: T extends Route ? RouteParams[T] : undefined
) => Return;

/**
 * A hook for creating hrefs and navigation.
 * @returns a `getHref` function for creating href URLs and a `goTo` function for navigating to a route.
 */
const useRouter = () => {
  const [, setLocation] = useLocation();

  const getHref: UseRoute<string> = (name, state) => {
    const route = routes.find((r) => r.name === name);
    if (!route) {
      return getHref(Route.notFound);
    }

    if (!state) {
      return route.path;
    }

    const pattern = new UrlPattern(route.path);
    return pattern.stringify(state);
  };

  const goTo: UseRoute<void> = useCallback(
    (name: Route, state?: RouteParam) => {
      const path = getHref(name, state);
      setLocation(path);
    },
    [setLocation]
  );

  return useMemo(
    () => ({
      getHref,
      goTo,
    }),
    [goTo]
  );
};

export default useRouter;
