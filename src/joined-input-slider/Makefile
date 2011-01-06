COMPONENT_NAME = joined-input-slider
COMPILED_COMPONENT = build_tmp/$(COMPONENT_NAME).js
UNCOMPILED_COMPONENT = js/$(COMPONENT_NAME).js

.PHONY : clean hack all

all : $(COMPILED_COMPONENT) hack


$(COMPILED_COMPONENT) : $(UNCOMPILED_COMPONENT)
	ant all

hack: $(UNCOMPILED_COMPONENT)
	@echo "YUI.add('$(COMPONENT_NAME)', function(Y) {" > build_tmp/$(COMPONENT_NAME)-hack.js
	@echo >> build_tmp/$(COMPONENT_NAME)-hack.js
	@cat $(UNCOMPILED_COMPONENT) >> build_tmp/$(COMPONENT_NAME)-hack.js
	@echo >> build_tmp/$(COMPONENT_NAME)-hack.js
	@echo >> build_tmp/$(COMPONENT_NAME)-hack.js
	@echo "}, '@VERSION@' ,{requires:['event-key', 'widget', 'console', 'slider', 'node']});" >> build_tmp/$(COMPONENT_NAME)-hack.js


clean :
	ant clean
