#!/bin/sh

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

rpicam-vid --awb auto --codec mjpeg --width 1920 --height 1080 -t 0 --inline -o - --framerate 50 | node $SCRIPT_DIR/out/index.js
#additional options: --awbgains 2.5,2.3
