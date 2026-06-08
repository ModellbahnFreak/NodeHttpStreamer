FROM node:alpine

RUN apk add --no-cache --repository=http://dl-cdn.alpinelinux.org/alpine/edge/testing/ --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community/ --repository=http://dl-cdn.alpinelinux.org/alpine/edge/main/ rpicam-apps

ADD . /home/node/NodeHttpStreamer
RUN chown -R node:node /home/node/NodeHttpStreamer

WORKDIR /home/node/NodeHttpStreamer
USER node:node

RUN chmod a+x cam.sh && \
    npm i && \
    npm run build

CMD [ "/home/node/NodeHttpStreamer/cam.sh" ]