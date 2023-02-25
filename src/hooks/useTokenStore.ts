import { useLocalStorage } from "react-use";

/**
 * A hook to manage and persist the GitHub personal access token used for API requests.
 * @returns A tuple with the token, a function to update it, and a function to delete it.
 */
const useTokenStore = () => useLocalStorage<string>("token");

export default useTokenStore;
