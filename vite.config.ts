import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    exclude: ["hamburger-react"],
  },
  plugins: [
    react({
      include: [/\.tsx?$/],
      babel: {
        configFile: "./babel.config.cjs",
      },
    }),
  ],
});
