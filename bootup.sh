#!/bin/bash
ourdir="$(readlink -f "$(dirname "$0")")"
cd "$ourdir"
{
	sleep 20 # wait for rethinkdb
	tmux new-window node index.js
} &
