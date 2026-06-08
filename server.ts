import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { apiMiddleware } from "./api-backend";
import path from 'path';

// ... ከExpress ሰርቨርህ Setup በታች ...

// 1. Vite build ሲያደርግ የሚወጣውን 'dist' ፎልደር static እንዲሆን ማድረግ
app.use(express.static(path.join(__dirname, 'dist')));

// 2. ማንኛውም ጥያቄ ሲመጣ የReact ን index.html እንዲከፍት ማድረግ
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Mount modular API middleware
  app.use(apiMiddleware);

  // Vite development middleware vs Static Production delivery
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve static SPA default index for any unrecognized route
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
