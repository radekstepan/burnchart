import { useMemo } from "react";
import { useLocation, useRoute as useWoute } from "wouter";
import UrlPattern from "url-pattern";
import routes from "../routes";

interface RouteState {
  [key: string]: string;
}

const ROUTE_404 = "/404";

const useRouter = () => {
  const [location, setLocation] = useLocation();

  const getHref = (name: string, state?: RouteState) => {
    const route = routes.find((r) => r.name === name);
    if (!route) {
      return ROUTE_404;
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
      goTo: (name: string, state?: RouteState) => {
        const path = getHref(name, state);
        setLocation(path);
      },
    }),
    [location, setLocation]
  );
};

export const useRoute = (name: string) => {
  const route = routes.find((r) => r.name === name);
  const [match, params] = useWoute<RouteState>(route ? route.path : ROUTE_404);

  if (!route || !match) {
    return {};
  }

  return params;
};

export default useRouter;
