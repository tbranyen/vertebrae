NODE_JS = $(if $(shell test -f /usr/bin/nodejs && echo "true"),nodejs,node)
BASE = .

all:
	@@$(NODE_JS) $(BASE)/build/tool

watch:
	@@$(NODE_JS) $(BASE)/build/watch
