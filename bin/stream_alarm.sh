#!/bin/bash
# Script to be run as alarm command by plugin bitrate_monitor.

[[ "$1" =~ ^([0-9]) ]]
session_number=${BASH_REMATCH[1]}

(
    echo "{"
    echo -n "   \"Date\": \""
    date '+%Y/%m/%d %H:%M:%S",'
    echo "   \"Message\": \"$1\","
    echo "   \"Target_PID\": \"$2\","
    echo "   \"Alarm_state\": \"$3\","
    echo "   \"Current_bitrate\": \"$4\","
    echo "   \"Minimum_bitrate\": \"$5\","
    echo "   \"Maximum_bitrate\": \"$6\""
    echo "}"
) > "/usr/share/cockpit/DVB-Streams/tmp-fs/stream${session_number}_monitor.json"
