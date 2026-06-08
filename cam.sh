#!/bin/sh

rpicam-vid --awb auto --codec mjpeg --width 1920 --height 1080 -t 0 --inline -o - --framerate 50 | node ~/NodeHttpStreamer/out/index.js
#additional options: --awbgains 2.5,2.3
