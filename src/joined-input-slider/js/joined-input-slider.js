

//Y.log("starting to declare JoinedInputSlider");
// ctor...
function JoinedInputSlider(config) {
	JoinedInputSlider.superclass.constructor.apply(this, arguments);
}


Y.JoinedInputSlider = Y.extend(JoinedInputSlider, Y.Widget, {
        // identifies the classname applied to the value field
        INPUT_CLASS : Y.ClassNameManager.getClassName('joinedInputSlider', "value"),
        
        // used to create JoinedInputSlider DOM elements 
        INPUT_TEMPLATE : '<input type="text" class="' + Y.ClassNameManager.getClassName('joinedInputSlider', "value") + '">',
        SLIDER_TEMPLATE : '<span class="horiz_slider"></span>',
        
        // Used to configure widget frome the value html attribute on the markup on the page
        HTML_PARSER : {
            value: function (srcNode) {
                var val = +srcNode.get("value"); 
                //Y.log("In HTML_PARSER val= " + val); 
                return ((Y.Lang.isNumber(+val) && val === val) ? val : null);
            }
        },
        initializer: function(config) {
			//NdEjs.logObject(config, Y.log, {level:'info', prefix: 'in initializer(config).  config is:'});

			// \todo the following code should go in a hook triggered when max, min, or sliderLength change (except it shouldn't raise exception there....)
            this._uiInvalid = false;
			this.valueMax = this.get('max'); 
			this.valueMin = this.get('min');
			if (NdEjs.isNone(this.valueMax) || NdEjs.isNone(this.valueMin) || (this.valueMax < this.valueMin)) {
				throw {name : 'Error' , message : 'JoinedInputSlider max must be >= min'};
			}
			this.valueRange = this.valueMax - this.valueMin;
			this.slider2InputDenom = 10000;
			this.sliderMin = 0.0;
			this.sliderMax = this.sliderMin + this.slider2InputDenom*this.valueRange;
			// Create a horizontal Slider using all defaults
			var configVi = this.get('value'),
			    valueInitial;
			valueInitial = (!configVi ? this.valueMin + 0.1*this.valueRange : configVi);
			this.sliderInitial = this.sliderMin + this.slider2InputDenom*(valueInitial - this.valueMin);
			if (NdEjs.isNone(this.get('sliderLength')) || this.get('sliderLength') < 0)	 {
				this.set('sliderLength', 200);
			}
			this.sliderBinSize = 1/this.get('sliderLength');
			if (valueInitial != configVi) {
				this.set('value', valueInitial);
			}

		},

		destructor : function() {
			//Y.log('in destructor');
			this.inputNode = null;
			this.slider = null;
		},

		renderUI : function() {
			//Y.log('in renderUI');
			this._renderSlider();
			this._renderInput();
		},

		bindUI : function() {
			//Y.log('in bindUI');
			this.after("valueChange", this._afterValueChange);
			var boundingBox = this.get("boundingBox"), 
			    keyEventSpec;

			// Looking for a key event which will fire continously across browsers while the key is held down. 38, 40 = arrow up/down, 33, 34 = page up/down
			keyEventSpec = (!Y.UA.opera) ? "down:" : "press:";
			keyEventSpec += "38, 40, 33, 34";

			Y.on("key", Y.bind(this._onDirectionKey, this), boundingBox, keyEventSpec);
			Y.on("change", Y.bind(this._onInputChange, this), this.inputNode);
			this.slider.after( "valueChange", Y.bind(this._afterSliderChange, this), boundingBox );
			Y.on("keyup", Y.bind(this._onKeyUp, this), boundingBox );


		},

		syncUI : function() {
			//Y.log('in syncUI');
			if (!this._uiInvalid) {
			    this._uiSetValue(this.get("value"));
			}
		},

		_renderInput : function() {
			//Y.log('in renderInput');
			var contentBox = this.get("contentBox"),
				input = contentBox.one("." + this.INPUT_CLASS),
				strings = this.get("strings");

			if (!input) {
				input = Y.Node.create(this.INPUT_TEMPLATE);
				contentBox.appendChild(input);
			}

			input.set("title", strings.tooltip);
			this.inputNode = input;
			this.inputNode.setData( { slider: this.slider} );

		},

		_renderSlider : function() {
			//Y.log('in renderSlider');
			var contentBox = this.get("contentBox"),
			    strings,
			    inc;
			strings = this.get("strings");

			inc = this._createSlider(strings.slider, this.getClassName("horiz_slider"));
			this.sliderNode = contentBox.appendChild(inc);
			// Render the Slider next to the input
			this.slider.render(inc);
		  },

		_createSlider : function(text, className) {
			var btn = Y.Node.create(this.SLIDER_TEMPLATE);
			//btn.set("innerHTML", text);
			btn.set("title", text);
			btn.addClass(className);
			this.slider = new Y.Slider({value : this.sliderInitial, max : this.sliderMax, length : this.get('sliderLength')});
			return btn;
		 },

		_defaultCB : function() {
			return null;
		},

		// Increments/Decrement the input value, based on the key pressed.
		_onDirectionKey : function(e) {
			//Y.log('in _onDirectionKey');
			e.preventDefault();
			var currVal = this.get("value"),
			    newVal,
			    minorStep,
			    majorStep;
			newVal = +currVal;
			minorStep = +this.get("minorStep");
			majorStep = +this.get("majorStep");

			switch (e.charCode) {
				case 38:
					newVal += minorStep;
					break;
				case 40:
					newVal -= minorStep;
					break;
				case 33:
					newVal += majorStep;
					break;
				case 34:
					newVal -= majorStep;
					break;
			}
			newVal = Math.min(newVal, +this.get("max"));
			newVal = Math.max(newVal, +this.get("min"));
			if (newVal !== currVal) {
				this.set("value", newVal);
			}
		},

		// updates self from the inputNode if needed, or sets the inputnode back to a legal value
		_onInputChange : function(e) {
			//Y.log('in _onInputChange');
			var val = this.inputNode.get("value");
			if (!this._validateValue(val)) {
			    if (!this._uiInvalid) {

				    this.inputNode.setStyle("color", "red");
				    this._uiInvalid = true;
				}
				this.syncUI();
			}
			else {
			    if (this._uiInvalid) {
				    this.inputNode.setStyle("color", "black");
				    this._uiInvalid = false;
				}
				this.set('value', val);
			}
		},


		_onKeyUp : function (e) {
			//Y.log('in _onKeyUp');

			switch (e.charCode) {
				case 38:
				case 40:
				case 33:
				case 34:
					return;
			}
			//Y.log('in _onKeyUp not a DirectionKey');
			//NdEjs.logObjectData(e, Y.log, {prefix: 'event'});
			
			this._onInputChange(e);

		},
		// If the slider has moved enough to change the value substantially, then
		//	we update `this` which is the input.  We make sure the change is at least
		//	sliderBinSize because, setting the input triggers the slider to move 
		//	which then rounds off to the nearest sliderBinSize and calls this.
		_afterSliderChange : function(e) {
			//Y.log('in _afterSliderChange');
			var oldValue  = parseFloat(this.get("value")), 
			    nv = this.valueMin + ((e.newVal - this.sliderMin)/this.slider2InputDenom);
			//Y.log('this._afterSliderChange with e.newVal=' + e.newVal + '	 oldValue=' + oldValue + '	nv='+nv);
			if (Math.abs(oldValue - nv) > this.sliderBinSize/2) {
				if (nv <= this.valueMax && nv >= this.valueMin) {
					this.inputNode.setStyle('color', 'black');
				}
				this.set("value", nv );
			}
		},

		// updates the input box when the value changes.  
		// The e.newVal has already been checked by _validateValue, 
		// so it should be good (I think).
		_afterValueChange : function(e) {
			//Y.log('in _afterValueChange');
			if (this._uiInvalid) {
                this.inputNode.setStyle("color", "black");
				this._uiInvalid = false;
			}
			this._uiSetValue(e.newVal);
		},

		// Updates the input box and slider to reflect val
		_uiSetValue : function(val) {
			var nodeV = this.inputNode.get("value"),
			    nVal = +val,
			    nNodeV,
			    sliderValue;
			nNodeV = +nodeV;
			//Y.log('in _uiSetValue(' + val + ') nodeV=' + nodeV + ' as number (' + (nNodeV) + ')');
			if ((nNodeV !== nNodeV) || Math.abs(nVal - +nodeV) > 1e-9) {
				this.inputNode.set("value", nVal.toFixed(9).replace(/0+$/, '0'));
			}
			else {
				//Y.log('prev was ' + nodeV + ' not changing');
				
			}
			sliderValue = this.sliderMin + this.slider2InputDenom*(nVal - this.valueMin);
			if (this.slider.wait) {
				this.slider.wait.cancel();
			}
				// Update the Slider on a delay to allow time for typing
			this.slider.wait = Y.later( 20, this.slider, function () {
				this.wait = null;
				this.set( "value", sliderValue );
			});
		},

		// returns true if the value is valid
		_validateValue: function(val) {
			var min = this.get("min"), 
			    max = this.get("max");
			return (Y.Lang.isNumber(+val)) && (+val >= +min) && (+val <= +max);
	  }
	}, {
    NAME :  "joinedInputSlider", // required for Widget classes and used as event prefix

    ATTRS : {
        min :	{ value : 0 },
        max :	{ value : 100},
        value : { value : null,
                  validator : function(val) {
                        return this._validateValue(val);
                    }
                },
        minorStep : { value : 1},
        majorStep : { value : 10},
        sliderLength : { value : 100},
        strings:	{ value :	{
                            tooltip: "Press the arrow up/down keys for minor increments, page up/down for major increments.",
                            slider: "Slider"
                        }
                    }
        }
    
});
