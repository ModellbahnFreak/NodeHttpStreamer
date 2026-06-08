FROM node:alpine

RUN apk add --no-cache --repository=http://dl-cdn.alpinelinux.org/alpine/edge/testing/ --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community/ --repository=http://dl-cdn.alpinelinux.org/alpine/edge/main/ rpicam-apps

RUN addgroup -g 44 pi-video && addgroup node video && addgroup node pi-video && \
    addgroup -g 29 pi-audio && addgroup node pi-audio && \
    addgroup -g 988 pi-i2c && addgroup node pi-i2c

ADD . /home/node/NodeHttpStreamer
RUN chown -R node:node /home/node/NodeHttpStreamer

WORKDIR /home/node/NodeHttpStreamer
USER node

RUN chmod a+x cam.sh && \
    npm i && \
    npm run build

CMD [ "/home/node/NodeHttpStreamer/cam.sh" ]