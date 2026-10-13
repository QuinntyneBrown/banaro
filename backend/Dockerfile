# banaro-api image (ADR-0007). The `dev` stage is what Docker Compose runs locally, with the source
# bind-mounted; `runner` is the production image built from the standalone output.
FROM node:22.20-bookworm-slim AS dev
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
CMD ["npm", "run", "dev"]

FROM dev AS build
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22.20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=8000 HOSTNAME=0.0.0.0
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/resources ./resources
USER node
EXPOSE 8000
CMD ["node", "server.js"]
