/**
 * Generates a key by joining a list of strings on forward slashes (/).
 * @param args The list of strings to join.
 * @returns The joined string.
 */
const k = (...args: any[]) => args.flat().join("/");

export default k;
