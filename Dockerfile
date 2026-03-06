FROM node:18.18.0 AS builder
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

ARG MONGODB_DB=placeholder
ARG MONGODB_URI=placeholder
ENV MONGODB_DB=$MONGODB_DB
ENV MONGODB_URI=$MONGODB_URI

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

FROM node:18.18.0-slim
WORKDIR /app
COPY package*.json ./

RUN npm install --production --legacy-peer-deps

COPY --from=builder /app/public ./public
COPY --from=builder /app/src ./src
COPY --from=builder /app/views ./views
COPY --from=builder /app/.babelrc ./
COPY --from=builder /app/.eslintrc.js ./
COPY --from=builder /app/.stylelintrc.json ./
COPY --from=builder /app/index.js ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/project-config.js ./
COPY --from=builder /app/webpack.config.js ./

EXPOSE 5005
ENV NODE_ENV=production
CMD ["npm", "start"]