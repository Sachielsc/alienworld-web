# Stage 1: build the Vue client
FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json client/
COPY server/package.json server/
RUN npm ci
COPY client/ client/
RUN npm run build

# Stage 2: runtime - Express server + built client
FROM node:24-slim
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json client/
COPY server/package.json server/
RUN npm ci --omit=dev --workspace=server && npm cache clean --force
COPY server/ server/
COPY --from=build /app/client/dist client/dist
RUN mkdir -p server/data && chown -R node:node /app
USER node
EXPOSE 3010
CMD ["node", "server/index.js"]
