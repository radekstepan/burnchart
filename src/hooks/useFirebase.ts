import { useContext } from "react";
import { FirebaseContext } from "../providers/FirebaseProvider";

const useFirebase = () => useContext(FirebaseContext);

export default useFirebase;
