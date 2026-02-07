import useSessionStorage from "./useSessionStorage";

/**
 * A hook to manage and persist the GitHub personal access token used for API requests.
 * Uses sessionStorage for better security (cleared when browser tab closes).
 * @returns A tuple with the token, a function to update it, and a function to delete it.
 */
const useTokenStore = () => useSessionStorage<string>("token");

export default useTokenStore;
