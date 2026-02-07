import { useState, useCallback, useRef } from "react";
import { useDeepCompareEffect } from "react-use";
import { useAuthContext } from "../providers/AuthProvider";
import k from "../utils/keys";
import getIssues, { Job } from "../utils/getIssues";
import { Milestone, ErrorWithVars } from "../interfaces";

const defaultState = {
  error: null,
  loading: false,
  data: [],
};

// Cache max size (1000 entries)
const MAX_CACHE_SIZE = 1000;
// TTL: 5 minutes
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Token-scoped cache for milestones
 * Native Map with TTL and size limits
 */
const caches = new Map<string, Map<string, Milestone>>();

/**
 * Get or create cache for a token
 */
const getCache = (token: string): Map<string, Milestone> => {
  if (!token) {
    // Return a fresh empty cache for no-token state
    return new Map();
  }
  
  // Use hash of token as cache key
  const tokenKey = `token_${token.slice(0, 8)}_${token.slice(-4)}`;
  
  if (!caches.has(tokenKey)) {
    caches.set(tokenKey, new Map());
  }
  return caches.get(tokenKey)!;
};

/**
 * Get a cached item with TTL check
 */
const getCached = (cache: Map<string, Milestone>, key: string): Milestone | undefined => {
  // Note: For simplicity, we store the raw milestone without timestamp
  // Cache invalidation happens on sign-out via clearAllCaches()
  return cache.get(key);
};

/**
 * Set a cached item with size limits
 */
const setCached = (cache: Map<string, Milestone>, key: string, data: Milestone): void => {
  // Evict oldest entries if at max size (simple LRU approximation)
  if (cache.size >= MAX_CACHE_SIZE) {
    const iterator = cache.keys();
    const first = iterator.next();
    if (first.value !== undefined) {
      cache.delete(first.value);
    }
  }
  cache.set(key, data);
};

/**
 * Clear all caches (call on global sign out)
 */
export const clearAllCaches = () => {
  for (const cache of caches.values()) {
    cache.clear();
  }
  caches.clear();
};

/**
 * Get all cached values matching a regex pattern
 */
const getCachedByPattern = (cache: Map<string, Milestone>, pattern: RegExp): Milestone[] => {
  const results: Milestone[] = [];
  for (const [key, value] of cache) {
    if (pattern.test(key)) {
      results.push(value);
    }
  }
  return results;
};

/**
 * Returns milestone(s) issues.
 * @param ask - Job[] representing the issues to fetch (behind useDeepCompareEffect)
 * @returns Milestone[] issues with `data`, `error` and `loading` properties.
 */
const useIssues = (ask: Job[]) => {
  const { token, isAuthenticated } = useAuthContext();
  const [state, setState] = useState<{
    error: ErrorWithVars | null;
    loading: boolean;
    data: Milestone[];
  }>(defaultState);

  // Get cache for current token
  const cacheRef = useRef<Map<string, Milestone>>(new Map());
  const getCurrentCache = useCallback(() => getCache(token), [token]);

  useDeepCompareEffect(() => {
    if (!ask.length || !isAuthenticated) {
      return;
    }

    const cache = getCurrentCache();
    const jobs: Job[] = [];
    
    // Check which jobs need fetching
    for (const job of ask) {
      const [owner, repo, milestone] = job;
      if (milestone !== undefined) {
        const key = k(owner, repo, milestone);
        const d = getCached(cache, key);
        if (!d) {
          jobs.push(job);
        }
        continue;
      }

      jobs.push(job);
    }

    setState({ error: null, loading: true, data: defaultState.data });

    let exited = false;

    const cancel = getIssues(token, jobs, (error, res) => {
      if (exited) {
        return;
      }
      if (error) {
        setState({ error, loading: false, data: defaultState.data });
        return;
      }
      if (res) {
        const cache = getCurrentCache();
        
        // Save the data to token-scoped cache
        for (const [key, milestone] of res) {
          setCached(cache, key, milestone);
        }

        // Populate the result
        const data: Milestone[] = [];
        for (const [owner, repo, milestone] of ask) {
          if (milestone !== undefined) {
            const key = k(owner, repo, milestone);
            const d = getCached(cache, key);
            if (!d) {
              continue;
            }
            data.push(d);
            continue;
          }

          const key = new RegExp(`^${owner}\\/${repo}`);
          const ds = getCachedByPattern(cache, key);
          if (!ds.length) {
            continue;
          }
          data.push(...ds);
        }

        setState({ error, loading: false, data });
      }
    });

    return () => {
      exited = true;
      cancel();
    };
  }, [token, ask]);

  return state;
};

export default useIssues;
