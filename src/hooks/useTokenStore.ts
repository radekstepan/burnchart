import { useLocalStorage } from "@rehooks/local-storage";

/**
 * A hook to manage and persist the GitHub personal access token used for API requests.
 * @returns A tuple with the token and a function to update it.
 */
const useTokenStore = () => useLocalStorage<string>("token");

export default useTokenStore;
