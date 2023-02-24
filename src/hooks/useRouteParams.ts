import { useRoute } from "wouter";
import routes, { Route, type RouteParams } from "../routes";
import useRouter from "./useRouter";

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
