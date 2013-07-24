YUI.add('four-leaf-tree-calculator', function(Y) { //AUTOMATICALLY-PRUNE



function FourLeafTreeCalculator(config) {
	FourLeafTreeCalculator.superclass.constructor.apply(this, arguments);
}

Y.FourLeafTreeCalculator = Y.extend(FourLeafTreeCalculator, Y.Base, {

	initializer : function(config) {
		Y.log('FourLeafTreeCalculator.initializer ');
		this.topoIndex = config.topoIndex;
		this.name = config.name;
	
		this.leafUpLeftIndex = 0;
		if (this.topoIndex == 1) { // AC|BD
			this.leafUpRightIndex = 1;
			this.leafDownLeftIndex = 2;
			this.leafDownRightIndex = 3;
			this._calcIndexToStd = [0, 1, 4, 5, 2, 3, 6, 7];
		}
		else if (this.topoIndex == 2) {	 // AD| BC
			this.leafUpRightIndex = 1;
			this.leafDownLeftIndex = 3;
			this.leafDownRightIndex = 2;
			this._calcIndexToStd = [0, 4, 1, 5, 2, 6, 3, 7];
		}
		else {	// AB | CD, which is the order that we do the pattern calculations in
			this.leafUpRightIndex = 2;
			this.leafDownLeftIndex = 1;
			this.leafDownRightIndex = 3;
			this._calcIndexToStd = [0, 1, 2, 3, 4, 5, 6, 7];
		}
		this.internalIndex = 4; // this is the same for all three trees
		this._calculatedValues = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
		this._standardForm = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
		this.wait = null;
		this.edgeLenContainer = config.edgeLenContainer;
		this.edgeLenContainer.after("valueChange", Y.bind(this._afterEdgeChange, this));
		this._afterEdgeChange({newVal : this.edgeLenContainer.get('value')});
	},
	
	_afterEdgeChange : function (e) {
		var edgeLenArray;
		edgeLenArray = e.newVal;
		if (!Y.Lang.isArray(edgeLenArray)) {
			Y.log('_afterEdgeChange for ' + edgeLenArray);
			return;
		}
		Y.log('_afterEdgeChange for ' + this.name + ' edgeLenArray = [' + edgeLenArray[0] + ', '+ edgeLenArray[1] + ', '+ edgeLenArray[2] + ', '+ edgeLenArray[3] + ', '+ edgeLenArray[4] + ']');
		if (this.wait) {
			this.wait.cancel();
			this.wait = null;
		}
		
		this.wait = Y.later( 10, this, function () {
				this.wait = null;
				this._calculatePatternProbabilities(edgeLenArray);
			});
	},

	_calculatePatternProbabilities : function (edgeLenArray) {
		var probChangeArray,
			p0, p1,
			p00, p01, p10, p11,
			t0p0, t0p1, t1p0, t1p1,
			t00p0, t00p1, t10p0, t10p1, t01p0, t01p1, t11p0, t11p1,
			pn, pc, i;
	
		probChangeArray = edgeLenArray;
		//prob at "left" internal
		p1 = probChangeArray[this.leafUpLeftIndex]; 
		p0 = 1 - p1;
		//probs at "right" internal
		p01 = p0*probChangeArray[this.internalIndex];
		p00 = p0 - p01;
		p10 = p1*probChangeArray[this.internalIndex];
		p11 = p1 - p10;
		// tip left down and the right intern
		pc = probChangeArray[this.leafDownLeftIndex];
		pn = 1 - pc;
		t0p1 = pc*p11 + pn*p01;
		t0p0 = pc*p10 + pn*p00;
		t1p1 = pn*p11 + pc*p01;
		t1p0 = pn*p10 + pc*p00;
		// tip left down, right up, and right internal
		pc = probChangeArray[this.leafUpRightIndex];
		pn = 1 - pc;
		t00p1 = t0p1*pc;
		t01p1 = t0p1*pn;
		t10p1 = t1p1*pc;
		t11p1 = t1p1*pn;
		t00p0 = t0p0*pn;
		t01p0 = t0p0*pc;
		t10p0 = t1p0*pn;
		t11p0 = t1p0*pc;
		// add right down last....
		pc = probChangeArray[this.leafDownRightIndex];
		pn = 1 - pc;
		this._calculatedValues[0] = t00p1*pc + t00p0*pn;
		this._calculatedValues[1] = t00p0*pc + t00p1*pn;
		this._calculatedValues[2] = t01p1*pc + t01p0*pn;
		this._calculatedValues[3] = t01p0*pc + t01p1*pn;
		this._calculatedValues[4] = t10p1*pc + t10p0*pn;
		this._calculatedValues[5] = t10p0*pc + t10p1*pn;
		this._calculatedValues[6] = t11p1*pc + t11p0*pn;
		this._calculatedValues[7] = t11p0*pc + t11p1*pn;
		for (i = 0; i < 8; ++i) {
			this._standardForm[i] = this._calculatedValues[this._calcIndexToStd[i]];
		}
		//Y.log('probs =  [' + this._standardForm[0] + ', '+ this._standardForm[1] + ', '+ this._standardForm[2] + ', '+ this._standardForm[3] + ', ...');
		//Y.log('	' + this._standardForm[4] + ', '+ this._standardForm[5] + ', '+ this._standardForm[6] + ', '+ this._standardForm[7] + ']');
		
		this.set('value', this._standardForm);
	},

	_validateValue: function(val) {
		var min = 0.0,
			s = 0,
			i,v;
		//Y.log("_validateValue val=" + val);
		if (!Y.Lang.isArray(val) || val.length < 5) {
			//Y.log("_validateValue returning false");
			return false;
		}
		for (i = 0; i < 8; i++) {
			v = val[i];
			//Y.log("_validateValue val[" + i + "]" + v);
			if (!(Y.Lang.isNumber(+v)&& (+v >= +min))) {
				//Y.log("_validateValue returning false");
				return false;
			}
			s += v;
		}
		return (Math.abs(1.0 - s) < 1e-6);
  } 
}, {
	NAME :	"fourLeafTreeCalculator", // required for Widget classes and used as event prefix
	ATTRS : {
		value : { value : null,
				  validator : function (val) {
						return this._validateValue(val);
					}
			}
		}	
});




}, '@VERSION@' ,{requires:['event-key', 'base', 'console', 'slider', 'node']}); //AUTOMATICALLY-PRUNE
