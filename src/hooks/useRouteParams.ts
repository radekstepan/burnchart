import { useRoute } from "wouter";
import routes, { Route, type RouteParams } from "../routes";
import useRouter from "./useRouter";

/**
 * A hook to extract the parameters of the current route.
 * @param name - the name of the route, as defined in the `routes` array
 * @returns the parameters of the current route, or undefined if there's no match (JS)
 */
const useRouteParams = <T extends Route>(name: T): RouteParams[T] => {
  const { getHref } = useRouter();

  const route = routes.find((r) => r.name === name);
  const [match, params] = useRoute(
    route ? route.path : getHref(Route.notFound)
  );

  if (!route || !match) {
    return undefined as RouteParams[T];
  }

  return params as RouteParams[T];
};

export default useRouteParams;
