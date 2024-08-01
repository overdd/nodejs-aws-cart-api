FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json .
RUN npm install --force
COPY . .
RUN npm run build 

FROM node:20-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist .
COPY --from=builder /usr/src/app/node_modules ./node_modules
EXPOSE 4000
CMD ls -la && node main.js