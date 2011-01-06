DIRS = four-leaf-widget \
	joined-input-slider

.PHONY: all clean $(DIRS)

all : build_tmp/nodes-ed-min.js

build_tmp/nodes-ed-min.js : build_tmp/nodes-ed.js
	java -jar ../../builder/componentbuild/lib/yuicompressor/yuicompressor-2.4.jar --disable-optimizations --preserve-semi --line-break 6000 --nomunge -o build_tmp/nodes-ed-min.js build_tmp/nodes-ed.js

build_tmp/nodes-ed.js : js/util.js $(DIRS)
	cp js/util.js build_tmp/.hidden.js
	-for d in $(DIRS) ; do (cd $$d ; $(MAKE) ; cd .. ; cat $$d/build_tmp/$$d.js >> build_tmp/.hidden.js ); done
	diff build_tmp/nodes-ed.js build_tmp/.hidden.js >/dev/null || cp build_tmp/.hidden.js build_tmp/nodes-ed.js 

$(DIRS) :
	cd $(@F) ; $(MAKE) ; cd ..

clean :
	rm -f build_tmp/nodes-ed.js
	rm -f build_tmp/nodes-ed-min.js
	-for d in $(DIRS) ; do (cd $$d; $(MAKE) clean ); done


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

force_look :
	true
