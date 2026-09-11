#!/bin/bash

/usr/bin/ffmpeg \
-i "udp://239.0.1.1:400$1?localaddr=127.0.0.1" \
-vf "drawtext=text='%{localtime\: Stream $1 %d\/%m\/%Y %H.%M.%S}':fontsize=30:x=10:y=10:box=1, fps=1/5" \
-frames:v 1 \
-y \
"/usr/share/cockpit/DVB-Streams/tmp-fs/screenshot$1.jpg"
