YUI.add('grouped-histogram', function(Y) { //AUTOMATICALLY-PRUNE
function RescalingScatterplot(config) {
	RescalingScatterplot.superclass.constructor.apply(this, arguments);
}

Y.RescalingScatterplot = Y.extend(RescalingScatterplot, Y.Widget, {
		// identifies the classname applied to the value field
		CANVAS_CLASS : Y.ClassNameManager.getClassName('RescalingScatterplotCanvas'),
		CANVAS_TEMPLATE : '<canvas width="300" height="320" class="' + Y.ClassNameManager.getClassName('RescalingScatterplotCanvas') + '">',
		
		initializer: function(config) {
		    Y.log('RescalingScatterplot.initializer');
			var i = 0, g;
			this.elements = [];
			this.canvasContext = null;
			this.canvasDOMNd = null;
			this.canvasNd = null;
			this.maxX = null;
			this.minX = null;
			this.maxPossibleX = null;
			this.minPossibleX = null;
			this.maxY = null;
			this.minY = null;
			this.maxPossibleY = null;
			this.minPossibleY = null;
			this.xOffset = 0;
			this.xScaler = 1.0;
			this.yOffset = 0;
			this.yScaler = 0;
			this.canvasWidth = null;
			this.canvasHeight = null;
			if (config) {
			    this.maxPossibleX = config.maxX;
			    this.maxPossibleY = config.maxY;
			    this.minPossibleX = config.minX;
			    this.minPossibleY = config.minY;
			}
			
			this._recalcValueTemps();
		},

		destructor : function() {
			//Y.log('in destructor');
			var i;
			this.elements = null;
			this.canvasContext = null;
			this.canvasDOMNd = null;
			this.canvasNd = null;
			for (i = 0; i < this.toDetach.length; ++i) {
				if (this.toDetach[i]) {
					this.toDetach[i].detach();
				}
			}
			this.toDetach = null;
		},

		renderUI : function() {
			Y.log('in RescalingScatterplot.renderUI');
			var contentBox = this.get("contentBox"),
				canvYuiNode = null, i;
			if (!this.canvasNd) {
    			Y.log('in Going to create ' + this.CANVAS_TEMPLATE);
				canvYuiNode = Y.Node.create(this.CANVAS_TEMPLATE);
				contentBox.prepend(canvYuiNode);
			    this.canvasNd = canvYuiNode;
			}
    		Y.log('getting DOMNd for canvas');
			this.canvasDOMNd = Y.Node.getDOMNode(this.canvasNd);
    		Y.log('getting canvasContext for canvas');
			this.canvasContext = this.canvasDOMNd.getContext("2d");
    		Y.log('getting setting font for canvas');
			this.canvasContext.font = "bold 12pt fixed-width";
			this._recalcScalersFromCanvas();
			this._paint();
		},

		bindUI : function() {
			Y.log('in RescalingScatterplot.bindUI');
		    this.after('heightChange', Y.bind(this._canvasSizeChange, this));
		    this.after('widthChange', Y.bind(this._canvasSizeChange, this));
		},
		
		_canvasSizeChange : function() {
		    this.canvasDOMNd.width = this.get('width') || this.canvasDOMNd.width;
		    this.canvasDOMNd.height = this.get('height') || this.canvasDOMNd.height;
		    this._recalcScalersFromCanvas();
		},    

        // temporaries that don't depend on the canvas size (but can change when min/max values change
        _recalcValueTemps : function() {
		    Y.log('RescalingScatterplot._recalcValueTemps');
            this._effectiveMaxX = this.maxPossibleX || this.maxX || 1;
            this._effectiveMinX = this.minPossibleX || this.minX || 0;
            this._effectiveMaxY = this.maxPossibleY || this.maxY || 1;
            this._effectiveMinY = this.minPossibleY || this.minY || 0;
            this.valueXOffset = this._effectiveMinX;
            this.valueYOffset = this._effectiveMinY;
        },
        
        // temporaries used in drawing, but that change with the min/max of values
        //  or canvas size change.
		_recalcScalersFromCanvas : function() {
		    Y.log('RescalingScatterplot._recalcScalersFromCanvas');
		    this._recalcValueTemps();

		    this.canvasWidth = this.canvasDOMNd.width;
		    this.canvasHeight = this.canvasDOMNd.height;
            var xRange = this._effectiveMaxX - this._effectiveMinX;
            var yRange = this._effectiveMaxY - this._effectiveMinY;            
            this.xScaler = this.canvasWidth/xRange;
            this.yScaler = -this.canvasHeight/yRange;
			this.xOffset = 0;
			this.yOffset = this.canvasHeight;
            Y.log('leaving RescalingScatterplot._recalcScalersFromCanvas');
		},

		syncUI : function() {
			this._paint();
		},


		_defaultCB : function() {
			return null;
		},
  			  
		_paint : function () {
			var i, 
			    el,
			    x1,x2,y1,y2;
			Y.log('RescalingScatterplot._paint()');
			Y.log('this.canvasContext.clearRect(0, 0, ' + this.canvasWidth + ', ' + this.canvasHeight + ')');
			this.canvasDOMNd.width = this.canvasWidth; // clears the canvas
			//this.canvasContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
			
			// place the bars on the histogram...
			for (i = 0; i < this.elements.length; ++i) {
			    el = this.elements[i];
			    if (el) {
			        if (el.type == 'line') {
			            Y.log('line in values (' + el.valueX1 + ', ' + el.valueY1 + ') -> ('+ el.valueX2 + ', ' + el.valueX2 + ')')
			            x1 = this.xOffset + (el.valueX1 - this.valueXOffset)*this.xScaler;
			            y1 = this.yOffset + (el.valueY1 - this.valueYOffset)*this.yScaler;
			            x2 = this.xOffset + (el.valueX2 - this.valueXOffset)*this.xScaler;
			            y2 = this.yOffset + (el.valueY2 - this.valueYOffset)*this.yScaler;
			            Y.log('line on canvas (' + x1 + ', ' + y1 + ') -> ('+ x2 + ', ' + y2 + ')')
			            this.canvasContext.moveTo(x1, y1);
			            this.canvasContext.lineTo(x2, y2);
			            this.canvasContext.stroke();
			        }
			    }
			}

			// Add axis labels....
			//
		},
		
		// sets el.index.  Reads: type, valueX1, valueY1, valueX2, valueY2
		addElement : function(el, suppressPaint) {
		    var minx, 
		        maxX,
		        minY,
		        maxY,
		        needToRecalcTemps=false;
			Y.log('RescalingScatterplot.addElement()');
		    el.index = this.elements.length;
		    if (el.type == 'line') {
		        minX = Math.min(el.valueX1, el.valueX2);
		        if (this.minX === null || minX < this.minX) {
		            this.minX = minX;
		            if (minX < this._effectiveMinX) {
    		            needToRecalcTemps = true;
    		        }
		        }
		        maxX = Math.max(el.valueX1, el.valueX2);
		        if (this.maxX === null || minX > this.maxX) {
		            this.maxX = maxX;
		            if (maxX > this._effectiveMaxX) {
    		            needToRecalcTemps = true;
    		        }
		        }
		        minY = Math.min(el.valueY1, el.valueY2);
		        if (this.minY === null || minY < this.minY) {
		            this.minY = minY;
		            if (minY < this._effectiveMinY) {
    		            needToRecalcTemps = true;
    		        }
		        }
		        maxY = Math.max(el.valueY1, el.valueY2);
		        if (this.maxY === null || maxY > this.maxY) {
		            this.maxY = maxY;
		            if (maxY > this._effectiveMaxY) {
    		            needToRecalcTemps = true;
    		        }
		        }
		    }
		    else {
		        throw {name : 'PlotError', message : 'Unrecognized type(' + el.type + ')'};
		    }
		    
		    this.elements[this.elements.length] = el;
		    if (needToRecalcTemps) {
		        this._recalcScalersFromCanvas();
		    }
		    if (!suppressPaint) {
		        this._paint();
		    }
		    return el;
		}

	}, {
	NAME :	"rescalingScatterplot", // required for Widget classes and used as event prefix

	ATTRS : {
		height :	{ value : null },
		width :	{ value : null },
		}
	
});

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
			this.canvasContext = null;
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
			this.canvasContext = null;
			this.canvasDOMNd = null;
			this.canvasNd = null;
			for (i = 0; i < this.toDetach.length; ++i) {
				if (this.toDetach[i]) {
					this.toDetach[i].detach();
				}
			}
			this.toDetach = null;
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
				propGraph = 0.82;
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
				widthOffset = (this.groupsValueArray.length + 2)*this.barWidth/2.0;
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
