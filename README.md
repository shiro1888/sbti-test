# SBTI Local Mirror

This folder contains a local static mirror of `https://sbti.unun.dev/`.

## Run

```powershell
npm start
```

The server prefers `http://127.0.0.1:3000`.
If that port is already in use, it will automatically switch to the next free port and print the final URL in the terminal.

You can also choose a port manually:

```powershell
node server.js --port 3100
```

## Cloudflare Pages

Build a clean upload directory:

```powershell
npm run build:pages
```

That creates `publish/` with only the static files needed for deployment.

Deploy with Wrangler after logging in:

```powershell
npx wrangler login
npm run deploy:pages -- --project sbti-shiro
```

If the Pages project does not exist yet, create it first in the Cloudflare dashboard or with:

```powershell
npx wrangler pages project create sbti-shiro
```
