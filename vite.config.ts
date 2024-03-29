import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 1234,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "node-fetch": "cross-fetch",
    },
  },
  define: {
    global: "window",
  },
});
