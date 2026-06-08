#!/bin/sh

scriptPath="$PWD/out/index.js"

if [ ! -f "$scriptPath" ]; then
    if [ -f "~/NodeHttpStreamer/out/index.js" ]; then
        scriptPath="~/NodeHttpStreamer/out/index.js"
    elif [ -f "~/NodeHttpStreamer/out/index.js" ]; then
        scriptPath="~/Software/NodeHttpStreamer/out/index.js"
    else
        echo "NodeHttpStreamer script not found" && exit 1
    fi
fi

rpicam-vid --awb auto --codec mjpeg --width 1920 --height 1080 -t 0 --inline -o - --framerate 50 | node $SCRIPT_DIR/out/index.js
#additional options: --awbgains 2.5,2.3
