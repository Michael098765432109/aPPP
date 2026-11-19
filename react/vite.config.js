import { resolve } from "node:path";
import { createReadStream, statSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const sharedAudio = resolve(__dirname, "../assets/audio/hasta-ese-entonces.mp3");

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    {
      name: "serve-shared-audio",
      configureServer(server) {
        server.middlewares.use("/audio/hasta-ese-entonces.mp3", (request, response, next) => {
          try {
            const { size } = statSync(sharedAudio);
            response.statusCode = 200;
            response.setHeader("Content-Type", "audio/mpeg");
            response.setHeader("Content-Length", size);
            if (request.method === "HEAD") return response.end();
            createReadStream(sharedAudio).pipe(response);
          } catch {
            next();
          }
        });
      }
    }
  ],
  server: {
    port: 5173,
    open: false
  },
  build: {
    rollupOptions: {
      input: {
        hub: resolve(__dirname, "index.html"),
        cartas: resolve(__dirname, "cartas.html"),
        musica: resolve(__dirname, "musica.html"),
        galeria: resolve(__dirname, "galeria.html")
      }
    }
  }
});
