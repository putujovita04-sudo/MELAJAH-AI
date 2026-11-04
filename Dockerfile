FROM node:22-alpine

WORKDIR /app

# Install dependencies (workspaces: client + server)
COPY package.json package-lock.json ./
COPY client/package.json client/package.json
COPY server/package.json server/package.json
RUN npm ci --include=dev --no-audit --no-fund

# Build frontend and copy source
COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=4100
EXPOSE 4100

# Express serves the API and client/dist
CMD ["npm", "start"]
