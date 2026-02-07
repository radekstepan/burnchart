import { useState, useCallback, useRef } from "react";
import { useDeepCompareEffect } from "react-use";
import { useAuthContext } from "../providers/AuthProvider";
import * as map from "../utils/map";
import k from "../utils/keys";
import getIssues, { Job } from "../utils/getIssues";
import { Milestone, ErrorWithVars } from "../interfaces";

// Cache entry with TTL
interface CacheEntry {
  data: Milestone;
  timestamp: number;
}

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
 * Keyed by token hash to separate sessions
 */
const createCache = () => {
  const cache = new Map<string, CacheEntry>();
  
  return {
    get(key: string): Milestone | undefined {
      const entry = cache.get(key);
      if (!entry) return undefined;
      
      // Check TTL
      if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
        cache.delete(key);
        return undefined;
      }
      return entry.data;
    },
    set(key: string, data: Milestone): void {
      // Evict oldest entries if at max size
      if (cache.size >= MAX_CACHE_SIZE) {
        const oldestKey = cache.keys().next().value;
        cache.delete(oldestKey);
      }
      cache.set(key, { data, timestamp: Date.now() });
    },
    clear(): void {
      cache.clear();
    },
    keys(): IterableIterator<string> {
      return cache.keys();
    },
  };
};

// Token-scoped cache instances (keyed by token prefix)
const caches = new Map<string, ReturnType<typeof createCache>>();

/**
 * Get or create cache for a token
 */
const getCache = (token: string): ReturnType<typeof createCache> => {
  if (!token) return createCache();
  
  // Use hash of token as cache key
  const tokenKey = `token_${token.slice(0, 8)}_${token.slice(-4)}`;
  
  if (!caches.has(tokenKey)) {
    caches.set(tokenKey, createCache());
  }
  return caches.get(tokenKey)!;
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
  const cacheRef = useRef<ReturnType<typeof createCache>>(createCache());
  const getCurrentCache = useCallback(() => getCache(token), [token]);

  useDeepCompareEffect(() => {
    if (!ask.length || !isAuthenticated) {
      return;
    }

    const cache = getCurrentCache();
    const jobs: Job[] = [];
    for (const job of ask) {
      const [owner, repo, milestone] = job;
      if (milestone !== undefined) {
        const key = k(owner, repo, milestone);
        const d = cache.get(key);
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
          cache.set(key, milestone);
        }

        // Populate the result
        const data: Milestone[] = [];
        for (const [owner, repo, milestone] of ask) {
          if (milestone !== undefined) {
            const key = k(owner, repo, milestone);
            const d = cache.get(key);
            if (!d) {
              continue;
            }
            data.push(d);
            continue;
          }

          const key = new RegExp(`^${owner}\/${repo}`);
          const d = map.get(cache, key);
          if (!d.length) {
            continue;
          }
          data.push(...d);
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
