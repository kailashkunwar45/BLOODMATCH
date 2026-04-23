Deployment Instructions

1. Environment

- Set environment variables: `PORT` (default 5000), `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`, `ALLOWED_ORIGINS`.

2. Build frontend

- From project root:

```bash
npm run build
```

This produces `frontend/dist` which the backend serves.

3. Start server

- Locally:

```bash
npm start --prefix backend
# or
node backend/src/server.js
```

4. Hosts

- Heroku: add `Procfile` (already present). Push to Heroku remote and enable config vars.
- Render / Railway: set build command `npm run build` (root) and start command `npm start --prefix backend`.

5. Notes

- Ensure `frontend/dist` is produced during the deploy/build step so backend can serve static assets.
- Run `npm audit fix` if vulnerabilities are flagged.
