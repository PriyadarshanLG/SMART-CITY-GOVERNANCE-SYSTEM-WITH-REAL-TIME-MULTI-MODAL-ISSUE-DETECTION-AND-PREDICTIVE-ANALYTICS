FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY tsconfig.base.json ./
COPY server/package*.json ./server/
COPY server/tsconfig.json ./server/
COPY server/src ./server/src
RUN npm install --workspace server
WORKDIR /app/server
RUN npm run build
EXPOSE 5000
CMD ["npm", "run", "start"]
