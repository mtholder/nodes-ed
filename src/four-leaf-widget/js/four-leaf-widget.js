function FourLeafWidget(config) {
	FourLeafWidget.superclass.constructor.apply(this, arguments);
}


Y.FourLeafWidget = Y.extend(FourLeafWidget, Y.Widget, {
		// identifies the classname applied to the value field
		CANVAS_CLASS : Y.ClassNameManager.getClassName('fourLeafWidgetCanvas'),
		CANVAS_TEMPLATE : '<canvas width="300" height="200" class="' + Y.ClassNameManager.getClassName('fourLeafWidgetCanvas') + '">',
		INPUT_NODE_TEMPLATE : '<div class="' + Y.ClassNameManager.getClassName('joinedInputSlider') + '-group"',
		INPUT_CLASS : Y.ClassNameManager.getClassName('fourLeafWidgetDiv'),
        
		initializer: function(config) {
			var i, inp;
			this.treeName = config.treeName;
			this.leafNames = ['A', 'B', 'C', 'D']; //\todo should be in ATTRS
			this.treeIndex = config.treeIndex;
		
			this.leafUpLeftIndex = 0;
			if (this.treeIndex == 1) { // AC|BD
				this.leafUpRightIndex = 1;
				this.leafDownLeftIndex = 2;
				this.leafDownRightIndex = 3;
				this.color = "#FF5555";
			}
			else if (this.treeIndex == 2) {
				this.leafUpRightIndex = 1;
				this.leafDownLeftIndex = 3;
				this.leafDownRightIndex = 2;
				this.color = "#0000FF";
			}
			else {
				this.leafUpRightIndex = 2;
				this.leafDownLeftIndex = 1;
				this.leafDownRightIndex = 3;
				this.color = "#00DD00";
			}
			this.internalIndex = 4; // this is the same for all three trees

			this.X_ANGLE_MULTIPLIER = Math.sqrt(2);
			this.Y_ANGLE_MULTIPLIER = Math.sqrt(2);
			
			this.inputNode = null;
			this.inputArray = null;
			this.canvasDOMNd = null;
			this.canvasNd = null;
			this.canvasContex = null;
		},

		destructor : function() {
			//Y.log('in destructor');
			this._documentMouseUpHandle.detach();

			this.inputNode = null;
			this.inputArray = null;
			
			this.canvasContex = null;
			this.canvasDOMNd = null;
			this.canvasNd = null;
			
		},

		renderUI : function() {
			//Y.log('in renderUI');
			this._renderEdgeLengthSliders();
			this._renderCanvas();
			this._paint();
		},

		bindUI : function() {
			//Y.log('in bindUI');
			var i, inp;
			for (i = 0; i < this.inputArray.length; ++i) {
				inp = this.inputArray[i];
				inp.after("valueChange", Y.bind(this._afterEdgeLengthChanged, this, i));
			}
		},

		syncUI : function() {
			//Y.log('in syncUI');
			this._uiSetValue(this.get("value"));
		},

		_renderEdgeLengthSliders : function() {
			//Y.log('in _renderEdgeLengthSliders');
			var contentBox = this.get("contentBox"),
				inpNode = this.inputNode,
				v, i, inpgroupid;

			Y.log('creating inpNode');
			if (!inpNode) {
				NdEjs.logObject(contentBox, Y.log);
				inpgroupid =  this.treeName + '-input';
				contentBox.append(this.INPUT_NODE_TEMPLATE + ' id="' + inpgroupid + '">');
				inpNode = contentBox.one("#" + inpgroupid);
			}
			
			this.inputNode = inpNode;
			this.inputArray = this._createEdgeLengthSliders(this.inputNode, this.treeName);
			v = this.get('value');
			if (this._validateValue(v)) {
				this._uiSetValue(v);
			}
			else {
				v = [];
			}
		},

		_createEdgeLengthSliders : function(srcNode, treeName) {
			var jInpSlider, i, edgeNd, edgeNameArray, edgeValueWidgets, edgeName, eid;
			edgeNameArray = ['A', 'B', 'C', 'D', 'Internal'];
				edgeValueWidgets = [];
			try {
				for (i = 0; i < edgeNameArray.length; ++i) {
					edgeName = edgeNameArray[i];
					eid = treeName + 'edge' + edgeName;
					srcNode.append('<input type="text" id="' + eid + '" class="yui3-joinedInputSlider-loading" value="0.05" />');
				}
				for (i = 0; i < edgeNameArray.length; ++i) {
					edgeName = edgeNameArray[i];
					eid = treeName + 'edge' + edgeName;
					edgeNd = Y.one('#' + eid);
					NdEjs.logObject(edgeNd, Y.log);
					jInpSlider = new Y.JoinedInputSlider({
						srcNode : edgeNd,
						value : edgeNd.get("value"),
						max : 0.5,
						min : 0.0,
						minorStep : 0.0001,
						majorStep : 0.01
					});
					edgeValueWidgets[i] = jInpSlider;
				}
				for (i = 0; i < edgeValueWidgets.length; ++i) {
					edgeValueWidgets[i].render();
					edgeValueWidgets[i].focus();
				}
				return edgeValueWidgets;
			}
			catch (e) {
				NdEjs.logException(e, Y.log); 
				try {
					NdEjs.logException(e, Y.log);
				}
				catch (ee) {
					Y.log("EE = " + ee);
				}
				throw e;
			}
		},

		_renderCanvas : function() {
			//Y.log('in _renderCanvas');
			
			var contentBox = this.get("contentBox"),
				strings,
				inc,
				canvYuiNode = null;
			canvYuiNode = contentBox.one("." + this.CANVAS_CLASS)
			if (!canvYuiNode) {
				canvYuiNode = Y.Node.create(this.CANVAS_TEMPLATE);
				contentBox.prepend(canvYuiNode);
			}
			this.canvasNd = canvYuiNode;
			
			this.canvasDOMNd = Y.Node.getDOMNode(this.canvasNd);
			this.canvasContext = this.canvasDOMNd.getContext("2d");
			this.canvasContext.font = "bold 12pt fixed-width";
			this.canvasContext.strokeStyle = this.color;
			this.canvasContext.fillStyle = this.color;

		  },
		  
		_defaultCB : function() {
			return null;
		},

		  
		_afterEdgeLengthChanged : function (index, e) {
			this._paint();
		},
			  
		_paint : function () {
			this._updateEdgeLengthsFromInput();
			this._plot();
		},

		_updateEdgeLengthsFromInput : function() {
			var i, 
				v = new Array(5);
			for (i = 0; i < this.inputArray.length; ++i) {
				v[i] = +(this.inputArray[i].get('value'));
				//Y.log('_updateEdgeLengthsFromInput v[' + i + '] = ' + v[i]);
			}
			this.set('value', v);
		},
	
		_plot : function () {			
			this._calcCoordinates();
			this._repaintFromCoordinates();
		},

		_repaintFromCoordinates : function () {
			var dim, nextLabel;
			this.canvasContext.clearRect(0, 0, this.canvasDOMNd.width, this.canvasDOMNd.height);
			this.canvasContext.beginPath();
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
			v = this.get('value');

			if (NdEjs.isNone(v)) {
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
			//Y.log('in _afterValueChange');
			this._uiSetValue(e.newVal);
		},

		// Updates the input box and slider to reflect val
		_uiSetValue : function(val) {
			var i, inp;
			if (NdEjs.isNone(val)) {
				return;
			}
			for (i = 0; (i < val.length && i < 5) ; ++i ) {
				this.inputArray[i].set('value', val[i]);
			}
			this._paint();
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
	NAME :	"fourLeafWidget", // required for Widget classes and used as event prefix

	ATTRS : {
		min :	{ value : 0.0 }, // min branch length
		max :	{ value : Infinity}, // max branch length
		value : { value : null,
				  validator : function(val) {
						return this._validateValue(val);
					}
				}
		}
	
});
