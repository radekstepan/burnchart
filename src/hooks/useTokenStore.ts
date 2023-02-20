import { useLocalStorage } from "@rehooks/local-storage";

const useTokenStore = () => useLocalStorage<string>("token");

export default useTokenStore;
