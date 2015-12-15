
var jsgui = require('./jsgui-lang-essentials');
var Data_Structures = require('./jsgui-data-structures');
var Data_Object = require('./data-object');
var Constraint = require('./constraint');


	var j = jsgui;
	var Class = j.Class;
	var each = j.each;
	var is_array = j.is_array;
	var is_dom_node = j.is_dom_node;
	var is_ctrl = j.is_ctrl;
	var extend = j.extend;
	var clone = j.clone;
	var x_clones = j.x_clones;
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
	var get_item_sig = j.get_item_sig;
	var set_vals = j.set_vals;
	var truth = j.truth;
	var trim_sig_brackets = j.trim_sig_brackets;
	var iterate_ancestor_classes = j.iterate_ancestor_classes;
	var is_constructor_fn = j.is_constructor_fn;
	
	var is_arr_of_strs = j.is_arr_of_strs;
	var is_arr_of_arrs = j.is_arr_of_arrs;
	 
	var Sorted_KVS = Data_Structures.Sorted_KVS;
	var dobj = Data_Object.dobj;
	
	var input_processors = j.input_processors;
	var Data_Value = Data_Object.Data_Value;
	
	
	var constraint_from_obj = Constraint.from_obj;
	var native_constructor_tof = jsgui.native_constructor_tof;
	


	var index_key_separator = ',';

	var get_fields_key = function (fields) {
	    var tf = tof(fields);
	    if (tf == 'array') {
	        return fields.join(index_key_separator);
	    } else if (tf == 'string') {
	        return fields;
	    }
	}

	var get_obj_fields_key = function (obj, fields) {
	    var tFields = tof(fields);
	    if (tFields == 'string') {
	        fields = [fields];
	    }

	    var arr_res = [];
	    each(fields, function (i, field_definition) {
	        var tFieldDef = tof(field_definition);
	        if (tFieldDef == 'array') {

	            arr_res.push(stringify(field_definition));

	        } else if (tFieldDef == 'string') {
	            var field_val = obj.get(field_definition);

	            if (field_val) {
	                if (field_val.value) field_val = field_val.value();
	                arr_res.push(field_val);
	            }

	        } else if (tFieldDef == 'object') {

	            if (field_definition.attached) {
	                var attachedObjName;
	                var attachedObjFieldName;
	                var c = 0;
	                each(field_definition.attached, function (i, v) {
	                    attachedObjName = i;
	                    attachedObjFieldName = v;
	                    c++;
	                })
	                if (c != 1) {
	                    throw 'unexpected number of items in attached definition';
	                } else {
	                    var attachedObj = obj[attachedObjName];
	                    var res = attachedObj.get(attachedObjFieldName);
	                    arr_res.push(res);
	                }
	            }
	        }
	    })

	    var res = arr_res.join(index_key_separator);
	    return res;
	}



	var Collection_Index = Class.extend({

		'init' : function(spec) {
			if (is_defined(spec.fields)) {
				this.fields = spec.fields;
				
				if (tof(spec.fields) == 'array') {
					this.alphabetic_fields = clone(spec.fields).sort();
				}
			}
			
			this.__type = 'collection_index';		
		},

		'add_object' : function(obj) {
			var tobj = tof(obj);
			if (tobj == 'array') {
				var that = this;
				each(obj, function(i, v) {
					that.add_object(v);
				});
			} else if (tobj == 'data_object') {				
				this.unsafe_add_object(obj);
			}
		}

	});

	var BPD_Collection_Index = Collection_Index.extend({

		'init' : function(spec) {
		}

	})

	var Ordered_Collection_Index = Collection_Index.extend({

		'init': function(spec) {
			this._super(spec);
			this.index_type = 'ordered';

		}

	})
	
	var Sorted_Collection_Index = Collection_Index.extend({
		'init': function(spec) {
			this._super(spec);
			this.index_type = 'sorted';
			this.sorted_kvs = new Sorted_KVS(12);		
		},

		'each': function(callback) {
			return this.sorted_kvs.each(callback);
		},		
		
		'unsafe_add_object': function(obj) {
			var fields_key = get_obj_fields_key(obj, this.fields);
			this.sorted_kvs.put(fields_key, obj);
		},
		
		'get': fp(function(a, sig) {		
			if (sig == '[s]') {
				var search_term = a[0];
				var kvps = this.sorted_kvs.get(search_term);
				return kvps;
			}
			
			if (tof(a[0]) == 'array') {
				var search_term = a[0].join(',');
				var kvps = this.sorted_kvs.get(search_term);
				return kvps;
			}			
		}),

		'has': fp(function (a, sig) {
			if (sig == '[s]') {
				return (this.sorted_kvs.key_count() > 0);
			}
		}),

		'remove': function(obj) {
			var fields_key;
			if (tof(obj) == 'string') {
				fields_key = obj;
			} else {
				fields_key = get_obj_fields_key(obj, this.fields);
			}
			this.sorted_kvs.out(fields_key);
		}
		
	});
	
	var Dict_Collection_Index = Collection_Index.extend({
		'init': function(spec) {
			this._super(spec);
			this.index_type = 'dict';
			this.dict = {};
			this.unique_mode = true;
		},

		'can_add_object' : function(obj) {
		    var fields_key = get_obj_fields_key(obj, this.fields);

			var existing_obj = this.dict[fields_key];
			if (is_defined(existing_obj)) {
				if (this.unique_mode === true) {
					return false;
				}
			}
			return true;
		},

		'unsafe_add_object' : (function(obj) {
			var fields_key = get_obj_fields_key(obj, this.fields);
			this.dict[fields_key] = obj;
		}),

		'get': fp(function (a, sig) {
			if (a.l == 1 && tof(a[0]) == 'string') {
				return this.dict[a[0]];
			}
		})

	})

	var Collection_Index_System = Class.extend({
		
		'init' : function(spec) {
			this.collection = spec.collection;
			this.index_map = {};
		},

		'notify_insertion': function(pos) {
			return false;
		},	
		
		'clear' : function() {
			this.index_map = {};
		},

		'search_for_index_with_fields': fp(function(a, sig) {
			if (sig == '[s]') {
				return this.search_for_index_with_fields([a[0]]);
			}
			if (sig == '[a]') {
				var idx = this.get_index_starting(a[0]);
				return idx;
			}
			if (sig == '[o]') {
				var res;
				var matching_count = 0;
				this.iterate_indexes(function(index, stop) {
					var i_fields = index.fields;
					if (tof(i_fields) == 'string') i_fields = [i_fields];
					var ae = are_equal([a[0]], i_fields);
					if (ae) {
						res = index;
						matching_count ++;
					}
				});
				if (matching_count > 1) {
					throw 'unexpected matching_count > 1';
				} else {
					if (matching_count == 1) {
						return res;
					}
				}
			}
		}),
		
		'find': fp(function(a, sig) {
			if (sig == '[o]') {
				var objQuery = a[0];
				var indexes = this.indexes();
				var map_single_field_indexes_by_field = {};
				each(indexes, function(i, v) {
					if (v.fields.length == 1) {
						var field = v.fields[0];
						var tField = tof(field);
						if (tField == 'string') {
							map_single_field_indexes_by_field[field] = v;
						}
					}
				});
				var c = 0;
				var keys = [];
				each(objQuery, function(key, value) {
					c++;
					keys.push(key);
				});
				if (keys.length == 1) {
					var index = map_single_field_indexes_by_field[keys[0]];
					if (index) {
						var res = index.get(objQuery[keys[0]]);
						return res;
					} else {
						return false;
					}
				}
				throw 'stop';
				return false;
			}
            //
			if (sig == '[a]') {			
				var indexes = [];				
				this.iterate_indexes(function(finding_index) {
					indexes.push(finding_index);
				});
				var search_fields = [];
				var search_values = [];
				each(a[0], function(i, v) {
					search_fields.push(v[0]);
					search_values.push(v[1]);
				});
				
				var equal_indices = [];
				
				each(indexes, function(i, idx) {
					var idx_fields = idx.fields;				
					if (idx_fields.length >= search_fields.length) {
						var idx_fields_to_check;
						if (tof(idx_fields) == 'array') {
							idx_fields_to_check = idx_fields.slice(0, search_fields.length);
						} else {
							idx_fields_to_check = [idx_fields];
						}
						
						if (are_equal(idx_fields_to_check, search_fields)) {						
							equal_indices.push(idx);							
						}						
					}
				});
				
				if (equal_indices.length > 0) {
					var idx = equal_indices[0];
					var res_indices_get = equal_indices[0].get(search_values);
					return res_indices_get;
				}
			}
			
			if (sig == '[o,s]') {
				var fieldDef = a[0];
				var index = this.search_for_index_with_fields(fieldDef);
				if (index) {
					var res = index.get(a[1]);
				}
				return res;
			}

			// That looks like multiple fields specified.
			if (a.l == 2 && tof(a[0]) == 'array') {
				var index = this.search_for_index_with_fields([a[0]]);
				if (index) {
					var res = index.get(a[1]);
				}
				return res;
			}

			if (a.l == 2 && tof(a[0]) == 'string') {
				// it's a single name-value pair.
				var index = this.search_for_index_with_fields(a[0]);
				if (index) {
					var res = index.get(a[1]);
				}
				return res;
			}
		}),

		'get_index_starting': function(fields) {
			if (tof(fields) == 'string') {
				fields = [fields];
			}
			var matching_indexes = [];		
			this.iterate_indexes(function(index, stop) {
				var i_fields = index.fields;
				if (tof(i_fields) == 'string') i_fields = [i_fields];

				var ae = are_equal(fields, i_fields);				
				if (ae) {
					matching_indexes.push(index);
				}
			});
			
			if (matching_indexes.length > 1) {
				throw 'get_index_starting, more than 1 matching index found. Needs implementation';
			} else {
				return matching_indexes[0];
			}
		},
		
		'ensure_index': fp(function(a, sig) {
			if (a.l == 1 && is_arr_of_strs(a[0])) {
			    var new_index_spec = a[0];

				var sci = new Sorted_Collection_Index({
					'fields': new_index_spec
				});
				sci.add_object(this.collection._arr);
							
				var fields_key = get_fields_key(new_index_spec);
				
				this.index_map[fields_key] = this.index_map[fields_key] || {};
				this.index_map[fields_key]['indexes_by_type'] = this.index_map[fields_key]['indexes_by_type'] || {};
				this.index_map[fields_key]['indexes_by_type']['sorted'] = sci;
				
				return sci;
			}
			
			if (a.l == 2) {
				if (tof(a[1]) == 'string') {
					var index_type = a[1];
					if (tof(a[0]) == 'array') {
						var fields = a[0];
						
						return this.ensure_index[a[0]];					
					}
					
					if (tof(a[0]) == 'string') {
						var field_name = a[0];

						var e_idx = this.get_index_by_type_by_fields([ field_name ], index_type);
						if (!is_defined(e_idx)) {

							var idx = new Dict_Collection_Index({
								'fields' : [ field_name ]
							});

							this.index_map[field_name] = this.index_map[field_name] || {};
							this.index_map[field_name]['indexes_by_type'] = this.index_map[field_name]['indexes_by_type'] || {};
							this.index_map[field_name]['indexes_by_type'][index_type] = idx;
							
							idx.add_object(this.collection._arr);
						}
					}
				}
			}
		}),

		'set_index_by_type_by_fields': function(index, arr_fields, index_type) {
			var c = 0, l = arr_fields.length;
			var i = this;
			
			while (c < l) {
				var field = arr_fields[c];

				var tField = tof(field);
				if (tField == 'string') {
					if (!i.index_map[field]) {
						i.index_map[field] = {};
					};
					i = i.index_map[field];
				} else {
					if (tField == 'object') {
						var fieldStr = stringify(field);
						if (!i.index_map[fieldStr]) {
							i.index_map[fieldStr] = {};
						};
						i = i.index_map[fieldStr];
					}

					if (tField == 'array') {
						var fieldStr = stringify(field);
						if (!i.index_map[fieldStr]) {
							i.index_map[fieldStr] = {};
						};
						i = i.index_map[fieldStr];
					}
				}
				c++;
			}
			i['indexes_by_type'] = i['indexes_by_type'] || {};
			i['indexes_by_type'][index_type] = index;
		},
		
		'set_index' : function(index) {
			this.set_index_by_type_by_fields(index, index.fields, index.index_type);
		},

		'get_index_by_type_by_fields': function(arr_fields, index_type) {
			var c = 0, l = arr_fields.length;
			var i = this;
			while (c < l) {
				i = i.index_map[arr_fields[c]];
				c++;
			}

			if (i) {
				var index = i['indexes_by_type'][index_type];
			}

			return index;
		},
		
		'indexes': fp(function(a, sig) {
			if (a.l == 0) {
				var res = [];
				this.iterate_indexes(function(index) {
					res.push(index);
				});
				return res;
			} else {
				throw 'Setting indexes not supported here (yet)';
			}
		}),

		'iterate_indexes': function(index_callback) {
			
			var iterate_level = function(level) {
				each(level, function(i, v, stop1) {
					var ibt = v['indexes_by_type'];
					if (ibt) {
						each(ibt, function(i2, v2, stop2) {
							var full_stop = function() {
								stop2();
								stop1();
							}
							index_callback(v2, full_stop);
						});
					}
				})
			}

			iterate_level(this.index_map);
		},

		'_____can_add_object': function(obj) {
			var tobj = tof(obj);
			if (tobj == 'data_object') {
			    var can_add = true;

				this.iterate_indexes(function(index) {
					var index_can_add = index.can_add_object(obj);
					if (!index_can_add) {
						can_add = false;
					}
				});

				return can_add;
			} else {
				return false;			
			}
		},

		'add_object': function(obj) {
			return this.unsafe_add_object(obj);
		},

		'unsafe_add_object': function(obj) {
			this.iterate_indexes(function(index) {
				index.unsafe_add_object(obj);
			});
		},
		
		'remove': function(obj) {
			this.iterate_indexes(function(index) {
				index.remove(obj);			
			});
		},

		'accepts': fp(function(a, sig) {
			if (sig == '[D]') {
				this._accepts = a[0];
			}
			if (sig == '[o]') {
				throw 'Map object as acceptance criteria not yet supported in Collection';			
			}
		})
		
	});

	var Collection_Index = {
		'System': Collection_Index_System,
		'Sorted': Sorted_Collection_Index
	}

module.exports = Collection_Index;
