import { useContext } from "react";
import { RemountContext } from "../providers/RemountProvider";

const useRemount = () => useContext(RemountContext);

export default useRemount;
