FROM node:alpine

RUN apk add --no-cache --repository=http://dl-cdn.alpinelinux.org/alpine/edge/testing/ --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community/ --repository=http://dl-cdn.alpinelinux.org/alpine/edge/main/ rpicam-apps && \
    addgroup -g 1000 cam && \
    adduser -h /home/cam -g cam -u 1000 cam

ADD . /home/cam/NodeHttpStreamer

WORKDIR /home/cam/NodeHttpStreamer
USER cam:cam

RUN chmod a+x cam.sh && \
    npm i && \
    npm run build

CMD [ "/cam.sh" ]