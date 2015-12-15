
var jsgui = require('./jsgui-lang-essentials');
var Data_Structures = require('./jsgui-data-structures');
var Constraint = require('./constraint');

	var j = jsgui;
	var Class = j.Class;
	var each = j.each;
	var is_array = j.is_array;
	var is_dom_node = j.is_dom_node;
	var is_ctrl = j.is_ctrl;
	var extend = j.extend;
	var get_truth_map_from_arr = j.get_truth_map_from_arr;
	var get_map_from_arr = j.get_map_from_arr;
	var arr_like_to_arr = j.arr_like_to_arr;
	var tof = j.tof;
	var is_defined = j.is_defined;
	var stringify = j.stringify;
	var functional_polymorphism = j.functional_polymorphism;
	var fp = j.fp;
	var arrayify = j.arrayify;
	var mapify = j.mapify;
	var are_equal = j.are_equal;
	var get_a_sig = j.get_a_sig;
	var get_item_sig = j.get_item_sig;
	var set_vals = j.set_vals;
	var truth = j.truth;
	var trim_sig_brackets = j.trim_sig_brackets;
	var ll_set = j.ll_set;
	var ll_get = j.ll_get;
	var input_processors = j.input_processors;
	var iterate_ancestor_classes = j.iterate_ancestor_classes;
	var is_arr_of_arrs = j.is_arr_of_arrs;
	var is_arr_of_strs = j.is_arr_of_strs;
	var is_arr_of_t = j.is_arr_of_t;
	var clone = jsgui.clone;

	var data_value_index = 0;
	var data_value_abbreviation = 'val';

	// do data objects get an ID when they are initialized.
	jsgui.__data_id_method = 'init';

	var obj_matches_constraint = Constraint.obj_matches_constraint;
	var native_constructor_tof = jsgui.native_constructor_tof;

	var value_as_field_constraint = Constraint.value_as_field_constraint;

	var Ordered_String_List = Data_Structures.Ordered_String_List;

	var parse_field_text = function(field_text) {
		field_text = field_text.replace(/not null/g, 'not_null');
		var is_unique = false;
		var is_indexed = false;
		var is_not_null = false;
		var is_read_only = false, is_pk = false;
		var field_words = field_text.split(' ');
		var flag_words = [];
		var str_data_type;
		var word;
		for (var c = 0, l = field_words.length; c < l; c++) {
			word = field_words[c];
			if (c < l - 1) {
				flag_words.push(word);
			} else {
				str_data_type = word;
			}
		}
		each(flag_words, function(i, v) {
			if (v == 'unique') {
				is_unique = true;
			}
			if (v == 'pk') {
				is_pk = true;
			}
			if (v == 'indexed') {
				is_indexed = true;
			}
			if (v == 'not_null') {
				is_not_null = true;
			}
			if (v == 'readonly' || v == 'read_only' || v == 'read-only') {
				is_read_only = true;
			}
		});
		var data_type = parse_data_type(str_data_type);
		var res = {
			//'is_unique': is_unique,
			//'is_indexed': is_indexed,
			//'is_not_null': is_not_null,
			'data_type': data_type
		}
		if (is_read_only) {
			res.read_only = is_read_only;
		}
		if (is_pk) {
			res.pk = is_pk;
		}
		if (is_unique) {
			res.unique = is_unique;
		}
		if (is_not_null) {
			res.not_null = is_not_null;
		}
		if (is_indexed) {
			res.indexed = is_indexed;
		}
		return res;
	}


	var parse_data_type = function(data_type_text) {

		//console.log('data_type_text ' + data_type_text);
		// will return the data type info as an object / array

		// could just return a string
		// could return [dt_name, length]

		// should not begin with a number

		//var rx_dt = /^(([a-z]|[A-Z]|_)\w*)(\([a-z]|[A-Z]|_\w+\))?$/;
		var rx_dt = /^(([a-z]|[A-Z]|_)\w*)(\((\d+)\))?/;

		// then check to see the match.

		var match = data_type_text.match(rx_dt);


		//console.log('match ' + stringify(match));

		if (match) {
			var dt_name = match[1];
			var dt_length = parseInt(match[4]);

			if (is_defined(dt_length) &! isNaN(dt_length)) {
				return [dt_name, dt_length];
			} else {
				return dt_name;
			}
		}

		//throw('parse_data_type stop');
	}


	var field_obj_to_text = function(field_obj) {
		//var res = [];

		var words = [];
		if (field_obj.unique) {
			words.push('unique');
		}
		if (field_obj.pk) {
			words.push('pk');
		}
		if (field_obj.indexed) {
			words.push('indexed');
		}
		if (field_obj.not_null) {
			words.push('not_null');
		}
		if (field_obj.read_only) {
			words.push('read_only');
		}


		/*

		if (is_defined(field_obj.length)) {
			words.push(field_obj.data_type);
			words.push('(');
			words.push(field_obj.length);
			words.push(')');
		} else {
			words.push(field_obj.data_type);
		}
		*/

		if (tof(field_obj))

		return words.join(' ');
	}


	var Fields_Collection = Class.extend({

	    'init': function (spec) {
			this.okvs = new Data_Structures.Ordered_KVS();
		},

		'_get_field_index': function(field_name) {
		},

		'set': (function() {
            var a = arguments;
	        a.l = arguments.length;
	        var sig = get_a_sig(arguments, 1);
			var that = this;

			if (sig == '[a]') {

				var item_or_arr = a[0];
				var ioa_sig = get_item_sig(item_or_arr, 2);

				if (ioa_sig == '[s,s]') {
					// string name with string field representation
					var field_name = item_or_arr[0];
					var field_str_def = item_or_arr[1];

					//console.log('field_name ' + field_name);

					//console.log('*** *** field_str_def ' + field_str_def);

					var field_obj = parse_field_text(field_str_def);
					//console.log('field_obj ' + stringify(field_obj));


					var field_arr = [field_name, field_str_def, field_obj];

					//console.log('setting with field_arr ' + stringify(field_arr));

					this.set(field_arr);

					//field_obj.parent(containing_object);

				} else if (ioa_sig == '[s,f]') {
					// the function is a constructor function (should be one, maybe test this?)

					// A Class field.

					var field_name = item_or_arr[0];
					var field_str_def = 'Class';
					var field_obj = item_or_arr[1];

					var field_arr = [field_name, field_str_def, field_obj];

					// then actually do the set.

					//  find the index of the item
					//console.log('putting in okvs field_name: ' + field_name);
					//console.log('putting in okvs field_name: ' + field_name);
					this.okvs.put(field_name, field_arr);

					//throw 'ioa stop';

				} else if (ioa_sig == '[s,s,o]') {
					// string name with string field representation
					var field_name = item_or_arr[0];
					var field_str_def = item_or_arr[1];
					var field_obj = item_or_arr[2];
				    //var field_arr = [field_name, field_str_def, field_obj];
					//this.set(field_arr);



					var field_arr = [field_name, field_str_def, field_obj];

					// then actually do the set.

					//  find the index of the item
					//console.log('putting in okvs field_name: ' + field_name);
					//console.log('putting in okvs field_name: ' + field_name);
					this.okvs.put(field_name, field_arr);
					//field_obj.parent(containing_object);

				} else {
					//console.log('other array, check for arr_of_arrs');
					//var ioa_sig = get_item_sig(item_or_arr);

					//console.log('ioa_sig ' + ioa_sig);

					// But there could be a collection - perhaps an abstract collection.
					//  I think indicate type as ~Collection.
					//  and ~C



					// n,s,s,? - the item in the ? is the defailt_value.

					// will use regex \d matching.

					var rx_test_sig_default_value = /\[n,\[s,s,\w\]\]/;


					// Ordinal position of fields...
					//  May need to be careful about that.


					if (ioa_sig == '[n,[s,s]]') {
						// a number, the index in array / sequence, then name, then data_type_name

						//console.log('item_or_arr ' + stringify(item_or_arr));

						var field_def = item_or_arr[1];
						var field_name = field_def[0];
						var field_type_name = field_def[1];

						//console.log('field_name ' + field_name);
						//console.log('field_type_name ' + field_type_name);

						if (field_type_name == 'collection') {
							// should be a collection of that type.

							//var field_arr = [field_name, field_type_name, field_item_type_name];#
							if (field_item_type_name) {
								var field_arr = [field_name, [field_type_name, field_item_type_name]];
							} else {
								var field_arr = [field_name, field_type_name];
							}

							// then actually do the set.
							//  find the index of the item
							//console.log('putting in okvs field_name: ' + field_name);
							this.okvs.put(field_name, field_arr);


						} else {

							// I think the field collection here is really just for storing info about the fields.
							//  It is when the objects represented by fields are get and set that the field functionality really comes into play.

							// can be the same as with collection!
							//  may do some more checks?

							var field_arr = [field_name, field_type_name];

							//console.log('field_arr ' + stringify(field_arr));

							// then actually do the set.
							//  find the index of the item
							//console.log('putting in okvs field_name: ' + field_name);
							this.okvs.put(field_name, field_arr);
							//console.log('done okvs put');

							//throw('7)stop');
						}
					} else if (ioa_sig.match(rx_test_sig_default_value)) {
						//console.log('matches regex, has default value.')
						//console.log('ioa_sig ' + ioa_sig);
						//throw 'stop';
						var field_def = item_or_arr[1];
						//console.log('item_or_arr ' + stringify(item_or_arr));
						var field_name = field_def[0];
						var field_type_name = field_def[1];
						var field_default_value = field_def[2];


						if (field_type_name == 'collection') {
							// should be a collection of that type.
							throw 'Default values for Collection not supported';
							//var field_arr = [field_name, field_type_name, field_item_type_name];#
							if (field_item_type_name) {
								var field_arr = [field_name, [field_type_name, field_item_type_name]];
							} else {
								var field_arr = [field_name, field_type_name];
							}

							// then actually do the set.
							//  find the index of the item
							//console.log('putting in okvs field_name: ' + field_name);
							this.okvs.put(field_name, field_arr);


						} else {

							// I think the field collection here is really just for storing info about the fields.
							//  It is when the objects represented by fields are get and set that the field functionality really comes into play.

							// can be the same as with collection!
							//  may do some more checks?

							var field_arr = [field_name, field_type_name, field_default_value];

							//console.log('field_arr ' + stringify(field_arr));

							// then actually do the set.
							//  find the index of the item
							//console.log('putting in okvs field_name: ' + field_name);
							this.okvs.put(field_name, field_arr);
							//console.log('done okvs put');

							//throw('7)stop');
						}

					}

					// if it's a string and an object


					if (ioa_sig == '[s,[s,s]]') {
						var field_name = item_or_arr[0];
						var field_def = item_or_arr[1];
						var field_type_name = field_def[0];
						var field_item_type_name = field_def[1];

						if (field_type_name == 'collection') {
							// should be a collection of that type.

							//var field_arr = [field_name, field_type_name, field_item_type_name];
							var field_arr = [field_name, [field_type_name, field_item_type_name]];
							// then actually do the set.
							//  find the index of the item
							//console.log('putting in okvs field_name: ' + field_name);
							this.okvs.put(field_name, field_arr);
						}
					} else {
						//console.log('* item_or_arr ' + stringify(item_or_arr));
						//console.log('ioa_sig ' + ioa_sig);
						//console.log('a ' + stringify(a));

						// Have changed the way that signatures work... now it's a for array.


						if (ioa_sig == '[]') {


						} if (ioa_sig == '[o]') {
							//console.log('ioa sig is an object ');
							//console.log('item_or_arr ' + stringify(item_or_arr));
							throw 'stop';
						} else {
							//console.log('pre stop');
							//throw ('6)stop');



							// Should have a more complete picture of the fields... where do these come from?

							// [s,o] object being a more complex definition.
							//  possibly a compound object.

							// An object with more field definitions declared within it.
							//  Will opt for lazy loading in various cases where possible.
							//   But some default values will need to be loaded at times.
							//    May also need to get loaded upon stringify.

							//



							/*
							["object", "dom_attributes", "string"]
							ioa_sig [s,s,s]
							*/

							/*
							'node': 'object',
							'attributes': 'dom_attributes',
							'tagName': 'string'
							*/

							// Maybe do more testing of Data_Object or Data_Object fields.
							//  Will try a single field of a Data_Object with a particular type.

							if (ioa_sig == '[s,o]') {
								// it's a compound definition.
								// will need to create the next level down, ie create the new Data_Object, and set its
								//  fields.

								// An object indicates it's a Data_Object.
								//  It's a field that gets declared with a particular data_type.
								//   That goes into the fields and constraints for that object.
								var fieldName = item_or_arr[0];
								var fieldDef = item_or_arr[1];

								// So there is a data type name? ie field name, and its data inside?
								// anyway, need to make a Data_Object with those fields.

								// Need to be able to make a Data_Object using fields that are supplied as an object
								//  rather than an array of arrays.



								//console.log('fieldDef ' + stringify(fieldDef));

								var field_arr = [fieldName, ['data_object', fieldDef]];
								this.okvs.put(fieldName, field_arr);

								// can we put this in relatively easily?
								//  the complicated part is interpreting the field.

								//throw 'stop';

							}

							//console.log('ioa_sig ' + ioa_sig);
							//console.log('item_or_arr ' + stringify(item_or_arr));
							//console.log('OTHER CASE!!!!');

							// [s,[o]]
							//  means a named array/collection of objects/dataobjects.
							//   in that case, we create a collection, and give it the type defined inside.

							if (ioa_sig == '[s,[o]]') {
								var fieldName = item_or_arr[0];
								var fieldItemDef = item_or_arr[1][0];

								// needs to make a collection field.

								// var field_arr = [field_name, [field_type_name, field_item_type_name]];

								// But won't go making nested data types?
								//  needs to ensure the types specified inside match OK,
								//  so need to (recursively) go into the definition.

								//console.log('fieldItemDef ' + stringify(fieldItemDef));

								// include more data in the info about the fields?
								//  do that to make it work in a more deeply nested way?
								//   or think some more about nested fields.

								// The field needs to be defined as being a collection of that type.
								//var field_arr = [fieldName, ['collection', field_item_type_name]];
								var field_arr = [fieldName, ['collection', fieldItemDef]];
								this.okvs.put(fieldName, field_arr);


								//throw 'stop';

							}



							if (ioa_sig == '[s,~C]') {
								// string, abstract collection

								// Items in an array...

								// need to set the field to hold an abstract collection....

								// Setting a field to an abstract collection of strings.
								//  We have supplied the abstract collection but we want there to be a collection instance.

								// Need to create the field of that actual type within the field collection.

								var t_abstract = native_constructor_tof(item_or_arr[1]._type_constructor);
								//console.log('t_abstract ' + t_abstract);
								//console.log('item_or_arr[1] ' + stringify(item_or_arr[1]));


								if (t_abstract) {
									var field_name = item_or_arr[0];
									var field_arr = [field_name, ['collection', t_abstract.toLowerCase()]];
									//console.log('field_name ' + field_name);
									//console.log('field_arr ', field_arr);
									this.okvs.put(field_name, field_arr);
								} else {
									var field_name = item_or_arr[0];
									var field_arr = [field_name, 'collection'];
									//console.log('field_name ' + field_name);
									//console.log('field_arr ', field_arr);
									this.okvs.put(field_name, field_arr);
								}

								// we can make a new field without the abstract condition of the constructor.
								//  will then eventually get these tags, and css-matched tags operating.
								// Then will be able to set up behaviours relatively easily.

								// Typed collections as data types is another thing to consider, as well as the syntax for declaring
								//  the abstract typed collections.
								// This hopefully will not introduce too much code bloat, it will be very good to get this system
								//  compressed right down for use in client apps. Could have things reduced down to a few KB (maybe 12?)
								//   and this would also allow for various application items to be working nicely.



								//throw 'stop';

							}
						}


					}
					// [[s,[s,s]]]
					// eg ['content', ['collection', 'control']]
					// [items]
					// [[str_name, str_type]]

					// could be a collection of something.

					var aoa = is_arr_of_arrs(item_or_arr);
					//console.log('aoa ' + aoa);

					if (aoa) {
						var c = 0, l = item_or_arr.length;
						for (c = 0; c < l; c++) {
							this.set(item_or_arr[c]);
						}

					}

					//if (aoa) {
					//	each(item_or_arr, function(i, v) {
					//	    that.set(v);
					//	});
					//}
					/*
					if (aoa) {
						//var this_set_call = this.set.call;
						var this_set = this.set;
						for (var c = 0, l = item_or_arr.length; c < l; c++) {
							this_set(item_or_arr[c]);
						}
					}
					*/
				}
			};

			if (sig == '[o]') {
				// add each one
				//var that = this;
				var a0 = a[0];

				if (Object.keys) {
				    // object.keys will hopefully be faster.
				    var a0_keys = Object.keys(a0);
                    //
				    var c = 0, l = a0_keys.length;
				    for (c = 0; c < l; c++) {
				        var a0_key = a0_keys[c];
				        this.set([a0_key, a0[a0_key]]);
				    }
				} else {
				    // Older JS code
                    for (i in a0) {
                        this.set.call(this, [i, a0[i]]);   
                    }
				}
			}

			if (a.l > 1) {
			    this.set(arr_like_to_arr(a));
            }

		}),

		'get': function(a0) {
			//console.log('Fields_Collection get sig: ' + sig);
			var ta0 = typeof a0;
			if (ta0 == 'undefined') {
				// get them all
				// just the objects though?
				return this.okvs.values();
			} else if (ta0 == 'string') {
				return this.okvs.get(a0);
			}
			/*
			if (sig == '[s]') {
				// get a single field.
				//console.log('fc get ' + a[0]);


				//console.log('this.okvs.length() ' + this.okvs.length());
				// does it have anything with that key?

				var res = this.okvs.get(a[0]);

				//console.log('a[0] ' + a[0]);
				//console.log('this.okvs.keys() ' + this.okvs.keys());

				//console.log('Fields_Collection get ** res ' + stringify(res));
				return res;
			}
			*/
		},
		/*
		'_get': fp(function(a, sig) {
			//console.log('Fields_Collection get sig: ' + sig);

			if (sig == '[]') {
				// get them all
				// just the objects though?
				return this.okvs.values();
			}
			if (sig == '[s]') {
				// get a single field.
				//console.log('fc get ' + a[0]);


				//console.log('this.okvs.length() ' + this.okvs.length());
				// does it have anything with that key?

				var res = this.okvs.get(a[0]);

				//console.log('a[0] ' + a[0]);
				//console.log('this.okvs.keys() ' + this.okvs.keys());

				//console.log('Fields_Collection get ** res ' + stringify(res));
				return res;
			}
		}),
		*/
		'fields': function() {
			return this.get.apply(this, arguments);
		},
		/*
		'_fields': fp(function(a, sig) {
			return this.get.apply(this, a);
		}),
		*/

		'out': function(key) {
			this.okvs.out(key);
		},
		'clear': function() {

		}
	})



	Fields_Collection.parse_field_text = parse_field_text;
	Fields_Collection.parse_data_type = parse_data_type;

	//return Fields_Collection;
    module.exports = Fields_Collection;

//})
