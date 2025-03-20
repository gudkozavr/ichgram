import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { host: true }, // нужно установить вместо true "localhost"  или удалить эту строку сервер если проект запускаетс я не в докере
});
