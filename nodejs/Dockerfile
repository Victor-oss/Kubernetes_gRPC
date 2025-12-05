FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install --omit=dev
RUN npm install prom-client express
EXPOSE 50051
CMD ["node", "server.js"]
