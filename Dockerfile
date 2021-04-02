FROM node:14-alpine

COPY package.json package-lock.json ./
COPY assets/background.png assets/bahnschrift.ttf ./assets/

RUN apk update && \
  apk add --no-cache \
  python \
  make \
  g++ \
  build-base\
  pkgconfig \
  cairo-dev \
  jpeg-dev \
  pango-dev && \
  rm -rf /var/cache/apk/* && \
  npm install

COPY main.js ./

CMD [ "node", "main.js" ]