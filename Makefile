NODE_JS = $(if $(shell test -f /usr/bin/nodejs && echo "true"),nodejs,node)

BASE = .
LIB_PATH = $(BASE)/lib

all:
	@@$(NODE_JS) $(BASE)/build/tool

test:
	@@$(NODE_JS) $(BASE)/test/index.js test

min:
	@@uglifyjs $(SRC_PATH)/combyne.js > $(SRC_PATH)/combyne.min.js

.PHONY: test
