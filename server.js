const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const DEFAULT_PORT = 3000;
const MAX_PORT_ATTEMPTS = 20;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function sendFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(err.code === "ENOENT" ? 404 : 500, {
        "Content-Type": "text/plain; charset=utf-8",
      });
      res.end(err.code === "ENOENT" ? "Not Found" : "Internal Server Error");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    res.end(data);
  });
}

function getRequestedPort() {
  const portArgIndex = process.argv.findIndex((arg) => arg === "--port" || arg === "-p");
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    return Number(process.argv[portArgIndex + 1]);
  }

  if (process.env.PORT) {
    return Number(process.env.PORT);
  }

  return DEFAULT_PORT;
}

function createServer() {
  return http.createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    const requestedPath = urlPath === "/" ? "/index.html" : urlPath;
    const safePath = path.normalize(path.join(ROOT, requestedPath));

    if (!safePath.startsWith(ROOT)) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Forbidden");
      return;
    }

    fs.stat(safePath, (err, stats) => {
      if (!err && stats.isDirectory()) {
        sendFile(res, path.join(safePath, "index.html"));
        return;
      }

      sendFile(res, safePath);
    });
  });
}

function startServer(startPort) {
  const tryListen = (port, attempt) => {
    const server = createServer();

    server.once("error", (err) => {
      if (err.code === "EADDRINUSE" && attempt < MAX_PORT_ATTEMPTS - 1) {
        tryListen(port + 1, attempt + 1);
        return;
      }

      console.error(`Failed to start local server: ${err.message}`);
      process.exit(1);
    });

    server.once("listening", () => {
      if (port !== startPort) {
        console.log(`Port ${startPort} is busy, switched to http://127.0.0.1:${port}`);
      } else {
        console.log(`SBTI local site running at http://127.0.0.1:${port}`);
      }
    });

    server.listen(port);
  };

  tryListen(startPort, 0);
}

startServer(getRequestedPort());
