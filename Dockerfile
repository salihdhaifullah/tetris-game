FROM node:16-alpine as builder

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./
COPY vite.config.ts ./

RUN yarn install

COPY . ./

RUN yarn build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
