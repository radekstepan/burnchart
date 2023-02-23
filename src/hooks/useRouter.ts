import { useMemo } from "react";
import { useLocation } from "wouter";
import UrlPattern from "url-pattern";
import routes, { Route, RouteParam } from "../routes";

const useRouter = () => {
  const [location, setLocation] = useLocation();

  const getHref = (name: Route, state?: RouteParam): string => {
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

  return useMemo(
    () => ({
      getHref,
      goTo: (name: Route, state?: RouteParam) => {
        const path = getHref(name, state);
        setLocation(path);
      },
    }),
    [location, setLocation]
  );
};

export default useRouter;
