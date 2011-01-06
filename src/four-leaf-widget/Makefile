COMPONENT_NAME = four-leaf-widget
COMPILED_COMPONENT = build_tmp/$(COMPONENT_NAME).js
UNCOMPILED_COMPONENT = js/$(COMPONENT_NAME).js

all : $(COMPILED_COMPONENT)

$(COMPILED_COMPONENT) : $(UNCOMPILED_COMPONENT)
	ant -propertyfile all

.PHONY : clean

clean :
	ant clean
