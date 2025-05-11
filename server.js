// ES module compatible server script
import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// Get directory name in ES modules context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);

  // Create Vite server in middleware mode
  const vite = await createViteServer({
    root: 'client',
    server: {
      middlewareMode: true,
      hmr: { server: httpServer },
    },
    appType: 'custom',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'client/src'),
        '@assets': path.resolve(__dirname, 'attached_assets'),
      },
    },
  });
  
  // Use vite's connect middleware
  app.use(vite.middlewares);
  
  // Handle all other routes (SPA)
  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl;
      const template = await vite.transformIndexHtml(url, '<!DOCTYPE html><html><head></head><body>Loading...</body></html>');
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      console.error(e);
      res.status(500).end(`Server Error: ${e.message}`);
    }
  });

  // Start the server
  httpServer.listen(5000, '0.0.0.0', () => {
    console.log('Server is running on http://localhost:5000');
  });
}

startServer().catch(err => {
  console.error('Error starting server:', err);
});