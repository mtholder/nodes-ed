YUI.add('four-leaf-tree-canvas', function(Y) { //AUTOMATICALLY-PRUNE

function FourLeafTreeCanvas(config) {
	FourLeafTreeCanvas.superclass.constructor.apply(this, arguments);
}


Y.FourLeafTreeCanvas = Y.extend(FourLeafTreeCanvas, Y.Widget, {
		// identifies the classname applied to the value field
		CANVAS_CLASS : Y.ClassNameManager.getClassName('fourLeafWidgetCanvas'),
		CANVAS_TEMPLATE : '<canvas width="300" height="200" class="' + Y.ClassNameManager.getClassName('fourLeafWidgetCanvas') + '">',
		
		initializer: function(config) {
			//Y.log('FourLeafTreeCanvas.initializer');
			var c;
			this.treeName = config.treeName;
			this.leafNames = ['A', 'B', 'C', 'D']; //\todo should be in ATTRS
			this.treeIndex = config.treeIndex;
		
			this.leafUpLeftIndex = 0;
			if (this.treeIndex == 1) { // AC|BD
				this.leafUpRightIndex = 1;
				this.leafDownLeftIndex = 2;
				this.leafDownRightIndex = 3;
				this.set('color', "#FF5555");
			}
			else if (this.treeIndex == 2) {
				this.leafUpRightIndex = 1;
				this.leafDownLeftIndex = 3;
				this.leafDownRightIndex = 2;
				this.set('color', "#0000FF");
			}
			else {
				this.leafUpRightIndex = 2;
				this.leafDownLeftIndex = 1;
				this.leafDownRightIndex = 3;
				this.set('color', "#00DD00");
			}
			this.internalIndex = 4; // this is the same for all three trees
			
			c = config.color;
			if (!NdEjs.isNone(c)) {
				this.set('color', c);
			}
			this.X_ANGLE_MULTIPLIER = Math.sqrt(2);
			this.Y_ANGLE_MULTIPLIER = Math.sqrt(2);
			
			this.canvasDOMNd = null;
			this.canvasNd = null;
			this.canvasContext = null;
			
			this._edgeLenToPlot = [];
			this.edgeLenValueSource = null;
				
		},

		destructor : function() {
			//Y.log('in FourLeafTreeCanvas.destructor');
			this.canvasContext = null;
			this.canvasDOMNd = null;
			this.canvasNd = null;
			this.edgeLenValueSource = null;
			this._edgeLenToPlot = null;
			
		},

		renderUI : function() {
			//Y.log('in FourLeafTreeCanvas.renderUI');
			this._renderCanvas();
			this._paint();
		},

		bindUI : function() {
			//Y.log('in FourLeafTreeCanvas.bindUI');
			this.after('colorChange', Y.bind(this._colorChanged, this));
		},

		syncUI : function() {
			//Y.log('in FourLeafTreeCanvas.syncUI');
			this._uiSetValue(this.get("value"));
		},

		_renderCanvas : function() {
			//Y.log('in FourLeafTreeCanvas._renderCanvas');
			
			var contentBox = this.get("contentBox"),
				canvYuiNode = null;
			canvYuiNode = contentBox.one("." + this.CANVAS_CLASS);
			if (!canvYuiNode) {
				canvYuiNode = Y.Node.create(this.CANVAS_TEMPLATE);
				contentBox.prepend(canvYuiNode);
			}
			this.canvasNd = canvYuiNode;
			this.canvasDOMNd = Y.Node.getDOMNode(this.canvasNd);
			//Y.log('in FourLeafTreeCanvas._renderCanvas canvasDOMNd = ' + this.canvasDOMNd + ' this.canvasDOMNd.width=' + this.canvasDOMNd.width);
			this.canvasContext = this.canvasDOMNd.getContext("2d");
			//Y.log('in FourLeafTreeCanvas._renderCanvas canvasContext = ' + this.canvasContext + ' this.color=' + this.color);
			this.canvasContext.font = "bold 12pt fixed-width";
			this._colorChanged();

		  },
		  
		_defaultCB : function() {
			return null;
		},

		  
		_afterEdgeLengthChanged : function (e) {
			this._paint();
		},
			  
		_paint : function () {
			this._updateEdgeLengthsFromInput();
			this._paintFromCachedVals();
		},

		_updateEdgeLengthsFromInput : function() {
			var i, 
				elvs,
				nv, 
				changedVal = false,
				ev = null;
			if (this.edgeLenValueSource) {
			    ev = this.edgeLenValueSource.get('value');
				for (i = 0; i < ev.length; ++i) {
                    nv = +ev[i];
                    if (nv != this._edgeLenToPlot[i]) {
                        this._edgeLenToPlot[i] = nv;
                        changedVal = true;
                    }
				}
			}
			if (changedVal) {
				this.set('value', this._edgeLenToPlot);
			}
		},
	
		_paintFromCachedVals : function () {			
			this._calcCoordinates();
			this._repaintFromCoordinates();
		},

		_repaintFromCoordinates : function () {
			var dim, nextLabel;
			//Y.log('this.canvasContext.clearRect(0, 0, ' + this.canvasDOMNd.width + ', '+ this.canvasDOMNd.height + ')');
			this.canvasContext.clearRect(0, 0, this.canvasDOMNd.width, this.canvasDOMNd.height);
			this.canvasContext.beginPath();
			//Y.log('this.canvasContext.moveTo(' + this.leafUpLeftX + ', '+ this.leafUpLeftY + ')');
			this.canvasContext.moveTo(this.leafUpLeftX, this.leafUpLeftY);
			this.canvasContext.lineTo(this.leftIntX, this.leftIntY);
			this.canvasContext.lineTo(this.leafDownLeftX, this.leafDownLeftY);
			this.canvasContext.moveTo(this.leftIntX, this.leftIntY);
			this.canvasContext.lineTo(this.rightIntX, this.rightIntY);
			this.canvasContext.moveTo(this.leafUpRightX, this.leafUpRightY);
			this.canvasContext.lineTo(this.rightIntX, this.rightIntY);
			this.canvasContext.lineTo(this.leafDownRightX, this.leafDownRightY);
			this.canvasContext.stroke();
			
			nextLabel = this.leafNames[this.leafUpLeftIndex];
			dim = this.canvasContext.measureText(nextLabel);
			this.canvasContext.fillText(nextLabel, this.leafUpLeftX - 2 - dim.width, this.leafUpLeftY);
			
			nextLabel = this.leafNames[this.leafUpRightIndex];
			dim = this.canvasContext.measureText(nextLabel);
			this.canvasContext.fillText(nextLabel, this.leafUpRightX + 2, this.leafUpRightY);
			
			nextLabel = this.leafNames[this.leafDownLeftIndex];
			dim = this.canvasContext.measureText(nextLabel);
			this.canvasContext.fillText(nextLabel, this.leafDownLeftX - 2 - dim.width, this.leafDownLeftY + 12);
			
			nextLabel = this.leafNames[this.leafDownRightIndex];
			this.canvasContext.fillText(nextLabel, this.leafDownRightX + 2, this.leafDownRightY + 12);
		},
	
		_calcCoordinates : function () {
			var cnvsWidth, 
				cnvsHeight,
				xScaler,
				yScaler,
				v;
			v = this._edgeLenToPlot;

			if (v.length === 0) {
				this.leftIntX = 0;
				this.leftIntY = 0;
				this.rightIntX = 0;
				this.rightIntY = 0;
				this.leafUpLeftEdgeLen = 0;
				this.leafUpLeftX = 0;
				this.leafUpLeftY = 0;
				this.leafDownLeftEdgeLen = 0;
				this.leafDownLeftX = 0;
				this.leafDownLeftY = 0;
				this.leafUpRightEdgeLen = 0;
				this.leafUpRightX = 0;
				this.leafUpRightY = 0;
				this.leafDownRightEdgeLen = 0;
				this.leafDownRightX = 0;
				this.leafDownRightY = 0;
				return;
			}

			cnvsWidth = this.canvasDOMNd.width;
			cnvsHeight = this.canvasDOMNd.height;
			// denominator in Y is:
			//		a factor of 2.0 because we want room for 2 branches and labels (and the branches will be at 45-degrees)
			//		times  0.5 because the max branch length is 0.5
			yScaler = cnvsHeight/(2.0*0.5); 
			// denominator in X has a 3.0 because we plot the internal horizontally,
			//		so the graph could be three edges wide.
			xScaler = cnvsWidth/(3.0*0.5); 
			

			// left internal node always shows up at the same spot.
			this.leftIntX = cnvsWidth/3;
			this.leftIntY = cnvsHeight/2;
			// right internal node is directly to the right of the leftInt
			this.rightIntX = this.leftIntX + xScaler*(v[this.internalIndex]);
			this.rightIntY = this.leftIntY;
			// all other nodes are off at 45 degree angles, so we can deal with this
			//	 by rescaling our scalers...
			yScaler /= this.Y_ANGLE_MULTIPLIER;
			xScaler /= this.X_ANGLE_MULTIPLIER;

			this.leafUpLeftEdgeLen = v[this.leafUpLeftIndex];
			this.leafUpLeftX = this.leftIntX - xScaler*this.leafUpLeftEdgeLen;
			this.leafUpLeftY = this.leftIntY - yScaler*this.leafUpLeftEdgeLen;
			this.leafDownLeftEdgeLen = v[this.leafDownLeftIndex];
			this.leafDownLeftX = this.leftIntX - xScaler*this.leafDownLeftEdgeLen;
			this.leafDownLeftY = this.leftIntY + yScaler*this.leafDownLeftEdgeLen;
			this.leafUpRightEdgeLen = v[this.leafUpRightIndex];
			this.leafUpRightX = this.rightIntX + xScaler*this.leafUpRightEdgeLen;
			this.leafUpRightY = this.rightIntY - yScaler*this.leafUpRightEdgeLen;
			this.leafDownRightEdgeLen = v[this.leafDownRightIndex];
			this.leafDownRightX = this.rightIntX + xScaler*this.leafDownRightEdgeLen;
			this.leafDownRightY = this.rightIntY + yScaler*this.leafDownRightEdgeLen;
		},


		_afterValueChange : function(e) {
			//Y.log('in FourLeafTreeCanvas._afterValueChange');
			var i, 
				nv, 
				changedVal = false;
			if (e.newVal) {
				for (i = 0; i < e.newVal.length; ++i) {
					nv = +e.newVal[i];
					if (nv != this._edgeLenToPlot[i]) {
						this._edgeLenToPlot[i] = nv;
						changedVal = true;
					}
				}
			}
			if (changedVal) {
				this._uiSetValue(e.newVal);
			}
			
		},

		// Updates the input box and slider to reflect val
		_uiSetValue : function(val) {
			var i, ev;
			if (NdEjs.isNone(val)) {
				return;
			}
			if (this.edgeLenValueSource) {
			    ev = this.edgeLenValueSource.get('value');
				for (i = 0; (i < val.length && i < 5) ; ++i ) {
					if ((!ev) || Math.abs(+val[i] - +ev[i]) > 1e-7) {
					    this.edgeLenValueSource.set('value', val);
					    break;
					}
				}
			}
			this._paint();
		},
		_colorChanged : function() {
			var c = this.get('color');
			if (this.canvasContext) {
				this.canvasContext.strokeStyle = c;
				this.canvasContext.fillStyle = c;
			}

		},
		// returns true if the val is an array of at least 5 numbers in the range [min, max]
		_validateValue: function(val) {
			var min = this.get("min"), 
				max = this.get("max"),
				i,v;
			//Y.log("_validateValue val=" + val);
			if (!Y.Lang.isArray(val) || val.length < 5) {
				//Y.log("_validateValue returning false");
				return false;
			}
			for (i = 0; i < 5; i++) {
				v = val[i];
				//Y.log("_validateValue val[" + i + "]" + v);
				if (!(Y.Lang.isNumber(+v)&& (+v >= +min) && (+v <= +max))) {
					//Y.log("_validateValue returning false");
					return false;
				}
			}
			return true;
	  }
	}, {
	NAME :	"fourLeafTreeCanvas", // required for Widget classes and used as event prefix

	ATTRS : {
		min :	{ value : 0.0 }, // min branch length
		max :	{ value : Infinity}, // max branch length
		value : { value : null,
				  validator : function(val) {
						return this._validateValue(val);
					}
				},
		color : { value : null}
		}
	
});

}, '@VERSION@' ,{requires:['widget', 'console', 'numeric-input', 'node']}); //AUTOMATICALLY-PRUNE







YUI.add('four-leaf-tree-widget', function(Y) { //AUTOMATICALLY-PRUNE


function FourLeafTreeWidget(config) {
	FourLeafTreeWidget.superclass.constructor.apply(this, arguments);
}


Y.FourLeafTreeWidget = Y.extend(FourLeafTreeWidget, Y.Widget, {
		// identifies the classname applied to the value field
		CANVAS_NODE_DIV_TEMPLATE : '<div class="' + Y.ClassNameManager.getClassName('FourLeafTreeCanvas') + '-div"',
		INPUT_CLASS : Y.ClassNameManager.getClassName('fourLeafWidgetDiv'),
		
		initializer: function(config) {
			//Y.log('in FourLeafTreeWidget.initializer');
			this.treeName = config.treeName;
			this.leafNames = ['A', 'B', 'C', 'D']; //\todo should be in ATTRS
			this.treeIndex = config.treeIndex;
			this.edgeNameArray = ['A', 'B', 'C', 'D', 'internal'];
			
			this.inputGroup = null;
			this.treeCanvas = null;

		},

		destructor : function() {
			//Y.log('in FourLeafTreeWidget.destructor');
			this.inputGroup = null;
			this.treeCanvas = null;
			
		},

		renderUI : function() {
			//Y.log('in FourLeafTreeWidget.renderUI');
			this._renderCanvas();
			this._renderEdgeLengthSliders();
			if (!this.treeCanvas.edgeLenValueSource) {
				this.treeCanvas.edgeLenValueSource = this.inputGroup;
			}
			this.treeCanvas.set('value', this.inputGroup.get('value'));
			this.treeCanvas._paint();
			Y.log('FourLeafTreeWidget.render inputGroup.value = ' + this.inputGroup.get('value'));
		},

		bindUI : function() {
			//Y.log('in FourLeafTreeWidget.bindUI');
			var i, iv = [];
			if (!this.treeCanvas) {
				this._createCanvas();
			}
			if (!this.inputGroup) {
				this._createInputs();
			}
			this.inputGroup.after("valueChange", Y.bind(this.treeCanvas._afterEdgeLengthChanged, this.treeCanvas));
			this.inputGroup.after("valueChange", Y.bind(this._afterEdgeLengthChanged, this));
			this.after("colorChange", Y.bind(this._colorChanged, this));
			iv = this.inputGroup.get('value');
			this.treeCanvas.set('value', iv);
			this.set('value', iv);
		},

		syncUI : function() {
			//Y.log('in FourLeafTreeWidget.syncUI');
			if (this.treeCanvas !== null) {
				this.treeCanvas.syncUI();
			}
		},

		_renderEdgeLengthSliders : function() {
			//Y.log('in _renderEdgeLengthSliders');
			var cb, lab, v = this.get('value'), i;
			if (!this.inputGroup) {
				this._createInputs();
			}
			cb = this.get('contentBox');
			this.inputGroup.render(cb);
		},
		
		_createInputs : function() {
			Y.log('FourLeafTreeWidget._createInputs');
			var contentBox = this.get("contentBox"),
 				i, labels = [];
			if (this.inputGroup) {
			    return;
			}
            for (i = 0; i < this.edgeNameArray.length; ++i) {
                labels[i] = ' Edge: ' + this.edgeNameArray[i];
            }
            v = this.get('value');
            this.inputGroup = new Y.InputGroup({max : 0.5,
                                     min : 0.0,
                                     value : (this._validateValue(v) && v) || [0.05, 0.05, 0.05, 0.05, 0.05],
                                     minorStep : 0.0001,
                                     majorStep : 0.01,
                                     inputCtor : Y.JoinedInputSlider,
                                     labels : labels
                                     });
            contentBox.appendChild(this.inputGroup);
            if (this.treeCanvas) {
                this.treeCanvas.edgeLenValueSource = this.inputGroup;
            }
		},

		_createCanvas : function () {
			var contentBox = this.get("contentBox"),
				inpgroupid,
				inpNode = this.treeCanvas;
			//Y.log('creating treeCanvas');
			if (!inpNode) {
				inpgroupid =  this.treeName + '-canvas-div';
				contentBox.append(this.CANVAS_NODE_DIV_TEMPLATE + ' id="' + inpgroupid + '">');
				inpNode = contentBox.one("#" + inpgroupid);
			}
			this.treeCanvas = new Y.FourLeafTreeCanvas({
					srcNode : inpNode,
					treeName : this.treeName,
					leafNames : this.leafNames,
					treeIndex : this.treeIndex,
					color : this.get('color')
				});
			this.set('color', this.treeCanvas.get('color'));
			if (this.inputGroup) {
				this.treeCanvas.edgeLenValueSource = this.inputGroup;
			}
			inpNode.append(this.treeCanvas);
		},
		
		_renderCanvas : function() {
			//Y.log('in _renderCanvas');
			if (!this.treeCanvas) {
				this._createCanvas();
			}
			this.treeCanvas.render(this);
		  },
		  
		_defaultCB : function() {
			return null;
		},

		_afterEdgeLengthChanged : function (e) {
			this.set('value', e.newVal);
		},
		
		_colorChanged : function(e) {
			this.treeCanvas.color = e.newVal;
			this.treeCanvas._paint();
		},

		_afterValueChange : function(e) {
			//Y.log('in _afterValueChange');
			if (this.treeCanvas !== null) {
				this.treeCanvas.set('value', e);
			}
		},

		// returns true if the val is an array of at least 5 numbers in the range [min, max]
		_validateValue: function(val) {
			var min = this.get("min"), 
				max = this.get("max"),
				i,v;
			//Y.log("_validateValue val=" + val);
			if (!Y.Lang.isArray(val) || val.length < 5) {
				//Y.log("_validateValue returning false");
				return false;
			}
			for (i = 0; i < 5; i++) {
				v = val[i];
				//Y.log("_validateValue val[" + i + "]" + v);
				if (!(Y.Lang.isNumber(+v)&& (+v >= +min) && (+v <= +max))) {
					//Y.log("_validateValue returning false");
					return false;
				}
			}
			return true;
	  }
	}, {
	NAME :	"fourLeafTreeWidget", // required for Widget classes and used as event prefix

	ATTRS : {
		min :	{ value : 0.0 }, // min branch length
		max :	{ value : Infinity}, // max branch length
		value : { value : null,
				  validator : function(val) {
						return this._validateValue(val);
					}
				},
		color : { value : null }
		}
	

}); // close Y.add

}, '@VERSION@' ,{requires:['widget', 'console', 'numeric-input', 'node']}); //AUTOMATICALLY-PRUNE
