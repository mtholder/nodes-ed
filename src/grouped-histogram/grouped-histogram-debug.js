YUI.add('grouped-histogram', function(Y) { //AUTOMATICALLY-PRUNE
function GroupedHistogram(config) {
	GroupedHistogram.superclass.constructor.apply(this, arguments);
}


Y.GroupedHistogram = Y.extend(GroupedHistogram, Y.Widget, {
		// identifies the classname applied to the value field
		CANVAS_CLASS : Y.ClassNameManager.getClassName('GroupedHistogramCanvas'),
		CANVAS_TEMPLATE : '<canvas width="300" height="320" class="' + Y.ClassNameManager.getClassName('groupedHistogramCanvas') + '">',
		
		initializer: function(config) {
			var i = 0, g;
			this.groupsArray = config.groups;
			this.canvasContex = null;
			this.canvasDOMNd = null;
			this.canvasNd = null;
			this.toDetach = [];
			this.maxValPlottable = 1.0; // \todo this should not be hard coded
			this.maxValObs = null;
			this.minValObs = null;
			this.barLengthScaler = 1.0;
			this.barWidth = 5;
			this.numCategories = 0;
			this.groupColors = [];
			this.rescaled = [];
			this.groupsValueArray = [];
			this.minMaxPerRow = [];
			this.showGroup = []
			for (i = 0; i < this.groupsArray.length; ++i) {
				this.groupColors[i] = '#000';
				try {
					this.groupColors[i] = config.colorArray[i];
				}
				catch (e) {
				}
				g = this.groupsArray[i].get('value');
				if (g) {
					this.groupsValueArray[i] = g.slice(0);
					this._updateExtremaOnGroup(i);
				}
				else {
					this.groupsValueArray[i] = [];
				}
				this.showGroup[i] = true;
			}
			
			this.canvasWidth = null;
			this.canvasHeight = null;
		},

		destructor : function() {
			//Y.log('in destructor');
			var i;
			this.groupsArray = null;
			this.canvasContex = null;
			this.canvasDOMNd = null;
			this.canvasNd = null;
			for (i = 0; i < this.toDetach.length; ++i) {
				if (this.toDetach[i]) {
					this.toDetach[i].detach();
				}
			}
		},

		renderUI : function() {
			//Y.log('in renderUI');
			this._renderCanvas();
			this._paint();
		},

		bindUI : function() {
			//Y.log('in bindUI');
			var i, gr;
			for (i = 0; i < this.groupsArray.length; ++i) {
				gr = this.groupsArray[i];
				if (this.toDetach[i]) {
					this.toDetach[i].detach();
				}
				Y.log('binding to valueChange for groupsArray element ' + i);

				this.toDetach[i] = gr.after("valueChange", Y.bind(this._afterGroupValueChanged, this, i));
			}
		},

		syncUI : function() {
			//Y.log('in syncUI');
			this._uiSetValue();
		},


		_renderCanvas : function() {
			//Y.log('in _renderCanvas');
			
			var contentBox = this.get("contentBox"),
				canvYuiNode = null, i;
			canvYuiNode = contentBox.one("." + this.CANVAS_CLASS);
			if (!canvYuiNode) {
				canvYuiNode = Y.Node.create(this.CANVAS_TEMPLATE);
				contentBox.prepend(canvYuiNode);
			}
			this.canvasNd = canvYuiNode;
			
			this.canvasDOMNd = Y.Node.getDOMNode(this.canvasNd);
			this.canvasContext = this.canvasDOMNd.getContext("2d");
			this.canvasContext.font = "bold 12pt fixed-width";
			for (i = 0; i < this.groupsArray.length; ++i) {
				this._afterGroupValueChanged(i, {newVal : this.groupsArray[i].get('value')});
			}
			this.canvasContext.font = "bold 12pt fixed-width";
		  },
		  
		_defaultCB : function() {
			return null;
		},


		_updateExtremaOnGroup: function(i) {
			var g, nc, irv, maxV, minV, j, v;
			g = this.groupsValueArray[i];
			if (!g) {
				return;
			}
			nc = 0;
			irv = [];
			try {
				nc = (nc > g.length ? nc : g.length);
				this.groupColors[i] = g.get('color');
				maxV = null;
				minV = null;
				for (j = 0; j < g.length; ++j) {
					v = g[j];
					irv[j] = this.barLengthScaler * v;
					if (this.maxValObs === null || v > this.maxValObs) {
						this.maxValObs = v;
					}
					if (this.minValObs === null || v < this.minValObs) {
						this.minValObs = v;
					}
					if (maxV === null || v > maxV) {
						maxV = v;
					}
					if (minV === null || v < minV) {
						minV = v;
					}
				}
				this.maxMinPerRow[i] = [minV, maxV];
			}
			catch (e) {
			}
			this.rescaled[i]  = irv;

			if (nc > this.numCategories) {
				this.numCategories = nc;
				this._calcBarWidths();
			}
		},
		
		_calcBarWidths : function () {
			if (this.canvasWidth === null) {
				return;
			}
			var numSlots = (this.numCategories + 1)*this.groupsValueArray.length;
			this.barWidth = this.canvasWidth/numSlots;
			Y.log('barWidth = ' + this.barWidth + ' this.canvasWidth = ' + this.canvasWidth + ' numSlots = ' + numSlots);
		},
		  
		_afterGroupValueChanged : function (index, e) {
			if (NdEjs.isNone(e.newVal)) {
				Y.log('_afterGroupValueChanged for index ' + index + 'e.nv is NONE');
				return;
			}
			Y.log('_afterGroupValueChanged for index ' + index + 'e.nv.length = ' + e.newVal.length);
			try {
				this.groupsValueArray[index] = e.newVal.slice(0);
			}
			catch (err) {
				return;
			}
			this._updateExtremaOnGroup(index);
			this._paint();
		},
			  
		_paint : function () {
			var drawableHeight, 
				drawableWidth,
				g, i,
				j,currWidthOffset, widthOffset, heightOffset, 
				groupWidthOffset, c, categoryLabels, dim, label,
				propGraph = 0.88;
			Y.log('GroupedHistogram._paint()');
			this.canvasContext.clearRect(0, 0, this.canvasDOMNd.width, this.canvasDOMNd.height);
			
			drawableHeight = propGraph*this.canvasDOMNd.width;
			drawableWidth = 0.95*this.canvasDOMNd.height;
			if (true || drawableHeight != this.canvasWidth) {
				this.canvasWidth = drawableHeight;
				this._calcBarWidths();
			}
			if (true || drawableWidth != this.canvasHeight) {
				this.canvasHeight = drawableWidth;
				this.barLengthScaler = drawableHeight/this.maxValPlottable;
			}
			
			// place the bars on the histogram...
			widthOffset = this.barWidth/2.0;
			heightOffset = this.canvasDOMNd.width - drawableHeight;
			groupWidthOffset = (this.groupsValueArray.length + 1)*this.barWidth;
			for (i = 0; i < this.groupsValueArray.length; ++i) {
				g = this.groupsValueArray[i];
				if (g) {
					c = this.groupColors[i];
					Y.log('this.groupColors[i] = ' + c);
					if (!NdEjs.isNone(c)) {
						this.canvasContext.fillStyle = c;
					}
					currWidthOffset = widthOffset;
					for (j = 0; j < g.length; ++j) {
						if (this.showGroup[i]) {
						    Y.log('this.canvasContext.fillRect(g[j] = ' + g[j] +  ');');
    						this.canvasContext.fillRect(heightOffset, currWidthOffset, g[j]*this.barLengthScaler, this.barWidth);
    					}
	    				currWidthOffset += groupWidthOffset;
					}
				}
				widthOffset += this.barWidth;
			}
			
			// Add axis labels....
			categoryLabels = this.get('categoryLabels');
			
			if ((!NdEjs.isNone(categoryLabels)) && categoryLabels.length > 0) {
				widthOffset = (this.groupsValueArray.length + 1.5)*this.barWidth/2.0;
				heightOffset = 0.0;
				this.canvasContext.fillStyle = "#000000";
				for (i = 0; i < this.numCategories; ++i) {
					label = categoryLabels[i];
					dim = this.canvasContext.measureText(label);
					this.canvasContext.fillText(label, heightOffset, widthOffset);
					widthOffset += (this.groupsValueArray.length + 1)*this.barWidth;
				}
			}
			
		},

		// Updates the input box and slider to reflect val
		_uiSetValue : function(val) {
			this._paint();
		}

	}, {
	NAME :	"groupedHistogram", // required for Widget classes and used as event prefix

	ATTRS : {
		yUpperLimit :	{ value : -Infinity },
		yLowerLimit :	{ value : Infinity },
		categoryLabels : { value : null }
		}
	
});


}, '@VERSION@' ,{requires:['widget', 'node']}); //AUTOMATICALLY-PRUNE
