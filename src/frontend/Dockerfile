FROM node:20-slim

WORKDIR /app/src

COPY ./src/package.json ./src/package-lock.json ./
RUN npm ci

COPY ./src ./

EXPOSE 3000

CMD ["npm", "run", "dev"]
