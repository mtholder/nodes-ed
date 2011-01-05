build_tmp/nodes-ed-min.js : build_tmp/nodes-ed.js build_tmp/joined-input-slider.js
	java -jar ../../builder/componentbuild/lib/yuicompressor/yuicompressor-2.4.jar -v --disable-optimizations --preserve-semi --line-break 6000 --nomunge -o build_tmp/nodes-ed-min.js build_tmp/nodes-ed.js

build_tmp/nodes-ed.js : js/util.js build_tmp/joined-input-slider.js
	cp js/util.js build_tmp/nodes-ed.js
	cat build_tmp/joined-input-slider.js >> build_tmp/nodes-ed.js

build_tmp/joined-input-slider.js : js/joined-input-slider.js
	ant all

.PHONY : clean
clean :
	ant clean

install: build_tmp/nodes-ed-min.js
	if test -z $(DOCUMENT_ROOT) ; then echo ; echo "DOCUMENT_ROOT must be set!"; echo && false ; fi
	cp build_tmp/nodes-ed-min.js "$(DOCUMENT_ROOT)/lib/"
	cp build_tmp/nodes-ed.js "$(DOCUMENT_ROOT)/lib/"
	echo ; echo "Successfully installed node-ed.js and nodes-ed-min.js to $(DOCUMENT_ROOT)/lib"; echo

EXAMPLE_FILES = ../examples/tree-likelihood-viz/tree_likelihood_viz.html

installexamples: $(EXAMPLE_FILES)
	if test -z $(DOCUMENT_ROOT) ; then echo ; echo "DOCUMENT_ROOT must be set!"; echo && false ; fi
	cp  $(EXAMPLE_FILES) "$(DOCUMENT_ROOT)/"
	echo ; echo "Successfully installed examples to $(DOCUMENT_ROOT)"; echo
