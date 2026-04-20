FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_AUTH_API_URL=http://localhost:3000
ARG VITE_CATALOG_API_URL=http://localhost:3001
ARG VITE_ORDERS_API_URL=http://localhost:3002

ENV VITE_AUTH_API_URL=$VITE_AUTH_API_URL
ENV VITE_CATALOG_API_URL=$VITE_CATALOG_API_URL
ENV VITE_ORDERS_API_URL=$VITE_ORDERS_API_URL

RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]