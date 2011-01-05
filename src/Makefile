build_tmp/nodes-ed-min.js: build_tmp/nodes-ed.js build_tmp/joined-input-slider.js
	java -jar ../../builder/componentbuild/lib/yuicompressor/yuicompressor-2.4.jar -v --disable-optimizations --preserve-semi --line-break 6000 --nomunge -o build_tmp/nodes-ed-min.js build_tmp/nodes-ed.js

build_tmp/nodes-ed.js: js/util.js build_tmp/joined-input-slider.js
	cp js/util.js build_tmp/nodes-ed.js
	cat build_tmp/joined-input-slider.js >> build_tmp/nodes-ed.js

build_tmp/joined-input-slider.js: js/joined-input-slider.js
	ant all

clean:
	ant clean

install: build_tmp/nodes-ed-min.js
	cp build_tmp/nodes-ed-min.js $(DOCUMENT_ROOT)/lib/
