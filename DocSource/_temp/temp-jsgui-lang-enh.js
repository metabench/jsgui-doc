
var jsgui = require('./jsgui-lang-util');
var Enhanced_Data_Object = require('./enhanced-data-object');
	
	var tof = jsgui.tof;
	var Collection = jsgui.Collection;
	var Data_Value = jsgui.Data_Value;

	jsgui.Enhanced_Data_Object = Enhanced_Data_Object;
	jsgui.Mini_Context = Enhanced_Data_Object.Mini_Context;


	var fromObject = function(value) {
		var tValue = tof(value);
		if (tValue == 'array') {
			var collRes = new Collection();

			for (var c = 0, l = value.length; c < l; c++) {
				collRes.push(fromObject(value[c]));
			}
			return collRes;

		}
		if (tValue == 'object') {
			var edoRes = new Enhanced_Data_Object();
			for (i in value) {
				edoRes.set(i, fromObject(value[i]));
			}
			return edoRes;
		}
		if (tValue == 'string') {
			var dvRes = new Data_Value({'value': value});
			return dvRes;
		}
		if (tValue == 'number') {
			var dvRes = new Data_Value({'value': value});
			return dvRes;
		}

	}

	jsgui.fromObject = fromObject;
	
    //Enhanced_Data_Object.prototype._get_input_processors = function() {
    //	return jsgui.input_processors;
    //}
    module.exports = jsgui;
	//return jsgui;

//});