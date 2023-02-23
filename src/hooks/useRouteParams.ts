import { useRoute } from "wouter";
import routes, { Route, type RouteParams } from "../routes";
import useRouter from "./useRouter";

type Return<T> = T extends Route ? RouteParams[T] : {};

const useRouteParams = <T extends Route>(name: T): Return<T> => {
  const { getHref } = useRouter();

  const route = routes.find((r) => r.name === name);
  const [match, params] = useRoute(
    route ? route.path : getHref(Route.notFound)
  );

  if (!route || !match) {
    return {} as Return<T>;
  }

  return params as Return<T>;
};

export default useRouteParams;
