

var Data_Object = Evented_Class.extend({
    'init': function(spec) {

        if (!spec) spec = {};

        if (spec.abstract === true) {
            this._abstract = true;
            var tSpec = tof(spec);

            if (tSpec == 'function') {
                this._type_constructor = spec;
            }
            if (tSpec == 'object') {
                this._spec = spec;
            }
        } else {
            var that = this;
            this._initializing = true;

            var t_spec = tof(spec);

            if (!this.__type) {
                this.__type = 'data_object';
            }

            if (!this.hasOwnProperty('_')) {
                this._ = {};
            }

            if (t_spec == 'object') {
                if (spec.context) {
                    this._context = spec.context;
                }
                if (spec._id) {
                    this.__id = spec._id;
                }
            }
            if (t_spec == 'data_object') {
                if (spec._context) this._context = spec._context;

                var spec_keys = spec.keys();

                each(spec_keys, function(i, key) {
                    that.set(key, spec.get(key));
                });
            }


            if (!is_defined(this.__id) && jsgui.__data_id_method == 'init') {
                if (this._context) {
                    this.__id = this._context.new_id(this.__type_name || this.__type);
                } else {
                }
            }


            if (is_defined(this.__type_name)) {
                spec = {
                    'set': spec
                }
            };


            var chained_fields = get_chained_fields(this.constructor);
            var chained_fields_list = chained_fields_to_fields_list(chained_fields);

            if (chained_fields_list.length > 0) {
                this.fc = new Fields_Collection({});
                this.fc.set(chained_fields_list);

                var do_connect = this.using_fields_connection();
                if (do_connect) {
                    var arr_field_names = [], field_name;
                    each(chained_fields, function(i, field_info) {
                        field_name = field_info[1][0];
                        arr_field_names.push(field_name);
                    });
                    this.connect_fields(arr_field_names);
                }
            }

            var chained_field_name;

            if (t_spec == 'object') {
                each(spec, function(i, v) {
                    if (typeof that[i] == 'function') {
                        that[i](v);
                    } else {
                        if (chained_fields_list.length > 0) {
                            var tcf, chained_field;
                            for (var c = 0, l = chained_fields_list.length; c < l; c++) {
                                chained_field = chained_fields_list[c];
                                tcf = tof(chained_field);

                                if (tcf == 'string') {
                                    chained_field_name = chained_field;
                                } else if (tcf == 'array') {
                                    chained_field_name = chained_field[0];
                                }

                                if (chained_field_name == i) {
                                    that.set(i, v);
                                }
                            }
                        }
                    }
                });

                if (is_defined(spec.event_bindings)) {
                    throw '16) stop';
                    each(spec.event_bindings, function(event_name, v) {
                        if (tof(v) == 'array') {
                            each(v, function(event_name, fn_event) {
                                if (tof(fn_event) == 'function') {
                                    this.add_event_listener(event_name, fn_event);
                                }
                            });
                        } else if (tof(v) == 'function') {
                            this.add_event_listener(event_name, v);
                        }
                    });
                }

                var spec_reserved = ['parent', 'event_bindings', 'load_array'];
                var map_spec_reserved = get_truth_map_from_arr(spec_reserved);

                if (spec.constraint) that.constraint(spec.constraint);

                if (is_defined(spec.parent)) {
                    this.set('parent', spec.parent);
                }
            }

            if (this._context) {
                this.init_default_events();
            }

            this._initializing = false;
        }

        //console.log('end Data_Object init');
    },

    'init_default_events': function() {



    },

    'data_def': fp(function(a, sig) {
        if (sig == '[o]') {
            // create the new data_def constraint.


        }
    }),

    'keys': function() {
        if (Object.keys) {
            return Object.keys(this._);
        } else {
            var res = [];
            each(this._, function(i, v) {
                res.push(i);
            });
            return res;
        }
    },

    'stringify': function() {
        var res = [];
        res.push('Data_Object(' + stringify(this._) + ')');
        return res.join('');
    },

    'toObject': function() {
        // need to go through each of them...
        var res = {};

        //console.log('this._ ' + stringify(this._));

        each(this._, function(i, v) {
            if (v.toObject) {
                //console.log('tof v ' + tof(v));
                res[i] = v.toObject();
            } else {
                res[i] = v;
            }
        })

        return res;
        //return this._;
    },

    'using_fields_connection': function() {
        var res = false;
        iterate_ancestor_classes(this.constructor, function(a_class, stop) {
            if (is_defined(a_class._connect_fields)) {
                res = a_class._connect_fields;
                stop();
            }
        })
        return res;

    },

    'connect_fields': fp(function(a, sig) {
        var that = this;

        if (a.l == 1 && tof(a[0]) == 'array') {
            var arr_fields = a[0];
            each(a[0], function(i, v) {
                that.connect_fields(v);
            });
        }

        if (sig == '[s]') {
            this[a[0]] = function(a1) {

                if (typeof a1 == 'undefined') {
                    // 0 params
                    return that.get(a[0]);
                } else {
                    // 1 param

                    return that.set(a[0], a1);
                }
            };
        }

        if (sig == '[o]') {
            throw('16) stop');
        }
    }),

    'parent': function() {
	      var a = arguments;
	      a.l = arguments.length;
	      var sig = get_a_sig(arguments, 1);
        var obj, index;

        if (a.l == 0) {
            return this._parent;
        }
        if (a.l == 1) {
            obj = a[0];

            if (!this._context && obj._context) {
                this._context = obj._context;
            }

            var relate_by_id = function(that) {
                var obj_id = obj._id();
                that._relationships[obj_id] = true;
            }

            var relate_by_ref = function(that) {
                that._parent = obj;
            }
            relate_by_ref(this);
        }
        if (a.l == 2) {
            obj = a[0];
            index = a[1];

            if (!this._context && obj._context) {
                this._context = obj._context;
            }

            this._parent = obj;
            this._index = index;
        }

        if (is_defined(index)) {
        } else {
        }
    },

    '_fp_parent': fp(function(a, sig) {
        if (a.l == 0) {
            var arr_parents = [];
            var tri;
            each(this._relationships, function(relative_id, relationship_info) {
                tri = tof(relationship_info);
                if (tri == 'number') {
                    throw 'Relationships system needs more work here. Had been using the map of all many objects, which has been removed for web server performance reasons.';
                } else {
                    if (tri == 'data_object' || tri == 'collection') {
                        arr_parents.push(relationship_info);
                    }
                }
            });

            if (arr_parents.length == 1) {
                return arr_parents[0];
            } else if (arr_parents.length > 1) {
                return arr_parents;
            }
        } else {
            if (sig == '[D]') {
                var parent = a[0];
                if (parent._context) this._context = parent._context;

                var use_parent_id = function() {

                    var p_id = parent._id();

                    var tp = tof(parent);

                    if (tp == 'data_object') {
                        this._relationships = this._relationships || {};
                        this._relationships[p_id] = parent;
                    }

                    if (tp == 'collection') {
                        throw 'Required: position in array of item';
                    }
                }

                var use_parent_ref = function() {
                }
            }
            if (sig == '[D,n]') {
                var parent = a[0];
                var p_id = parent._id();
                var position_in_array = a[1];

                if (parent._context) this._context = parent._context;

                this._parents = this._parents || {};

                this._parents[p_id] = [parent, position_in_array];
            }
        }
    }),

    '_id': function() {
        if (this.__id) return this.__id;

        if (this._context) {
            this.__id = this._context.new_id(this.__type_name || this.__type);
        } else {
            if (this._abstract) {
                return undefined;
            } else if (!is_defined(this.__id)) {
                throw 'stop, currently unsupported.';
                this.__id = new_data_object_id();
                console.log('!!! no context __id ' + this.__id);
            }
        }
        return this.__id;
    },

    'fields': fp(function(a, sig) {

        var that = this;

        if (a.l == 0) {
            var fields_collection = this.fc;
            var res;
            if (fields_collection) {
                res = fields_collection.okvs.values();
            } else {
                res = [];
            }
            return res;
        }

        if (sig == '[s]') {
            var fc = this.fc;
            var res = fc.get(a[0]);
            return res;
        }

        if (sig == '[o]') {
            each(a[0], function(i, v) {
                that.set_field(i, v);
            }, that);
        }

    }),

    'constraints': fp(function(a, sig) {

        if (a.l == 0) {

        }

        if (sig == '[o]') {
            var field_constraints = a[0];
            this._field_constraints = field_constraints;
        }

        if (a.l == 2 && tof(a[0]) == 'string') {

        }

    }),

    'matches_field_constraint': fp(function(a, sig) {
        if (sig == '[s,s]') {
            var field_name = a[0];

            if (tof(a[1]) == 'string') {
                var str_constraint = a[1];

                var field_val = this.get(field_name);
                return obj_matches_constraint(field_val, str_constraint);
            }

            if (tof(a[1]) == 'array') {
                throw 'Multiple constraints not yet implemented here';
            }
        }
    }),

    'obj_matches_field_constraints': function(obj) {
        var that = this;
        var matches = true;
        each(this._field_constraints, function(i, v) {
            matches = matches && obj.matches_field_constraint(i, v)
        })
        return matches;
    },

    'read_only': arrayify(fp(function(a, sig) {
        var mro = this._map_read_only = this._map_read_only || {};

        var field_name = a[0];

        if (sig == '[s]') {
            // a field name to make read-only
            mro[field_name] = true;
        }
        if (sig == '[s,b]') {
            // a field name to make read-only, boolean value can be false

            var bool_is_read_only = a[1];
            if (bool_is_read_only) {
                return this.read_only(field_name);
            } else {
                //delete mro[field_name];
                mro[field_name] = null;
            }
        }
    })),

    'set_field': fp(function(a, sig) {

        this.fc = this.fc || new Fields_Collection();

        return this.fc.set.apply(this.fc, a);
    }),

    'set_field_data_type_constraint': function(field_name, data_type_constructor) {
        var fmc = this._map_field_constraints = this._map_field_constraints || {};
        var fmfc = fmc[field_name];
        if (fmfc) {
            var deletion_index;
            each(fmfc, function(i, v) {
                // if it is a Field_Data_Type_Constraint
                if (v instanceof Constraint.Field_Data_Type) {
                    //
                    if (v.data_type_constructor === data_type_constructor) {

                    } else {
                        // replace that one.
                        deletion_index = i;
                    }
                }
            })

            if (is_defined(deletion_index)) {
                fmfc.splice(deletion_index, 1);
            }
        }
    },

    'get_field_data_type_constraint': function(field_name) {
        var fmc = this._map_field_constraints;
        // field_constraints - they are constraints that apply to the fields. They are not the list of fields.
        var result = undefined;
        //
        if (fmc) {
            var fmfc = fmc[field_name];
            if (fmfc) {
                each(fmfc, function (i, v) {
                    // if it is a Field_Data_Type_Constraint
                    if (v instanceof Constraint.Field_Data_Type) {
                        result = v;
                        return v;
                    }
                });
            }
        }
        return result;
    },

    'ensure_field_constraint': fp(function(a, sig) {
        if (sig == '[s,o]') {
            var field_name = a[0];
            var field_info = a[1];

            this._map_field_constraints = this._map_field_constraints || {};
            this._map_field_constraints[field_name] = this._map_field_constraints[field_name] || [];

            var fc_item_arr = this._map_field_constraints[field_name];

            var dt_info = field_info.data_type;

            var new_dt_constraint = Constraint.from_obj(dt_info);

            if (!is_defined(new_dt_constraint)) {
                //throw '9) New constraint from_obj not profucing constraint';
            } else {

                var dt_constraint;
                if (fc_item_arr.length > 0) {

                    var dt_constraints = [];
                    each(fc_item_arr, function(i, constraint_item) {
                        if (constraint_item instanceof Constraint.Field_Data_Type) {
                            var constraint_info = constraint_item.to_info_obj();
                            var stack = new Error().stack
                            throw ('6) it is! stop, check to see if it is a Field_Data_Type_Constraint, use instanceOf')
                        }
                    })
                } else {
                    fc_item_arr.push(new_dt_constraint);
                }
            }
        }
    }),

    'matches_field_constraints': fp(function(a, sig) {
        if (a.l == 0) {
            return this.matches_field_constraints(this._field_constraints);
        }

        if (sig == '[D]') {
            var fcs = this._field_constraints;
            var obj = a[0];

            var all_match = true, obj_field_value, matches;

            each(fcs, function(field_name, constraint) {
                obj_field_value = obj.get(field_name);

                matches = obj_matches_constraint(obj_field_value, constraint);

                all_match = all_match && matches;
            });

            return all_match;
        }

        if (sig == '[o]') {
            return data_object_matches_field_constraints(this, a[0]);
        }
    }),

    '____requires': fp(function(a, spec) {
        if (a.l == 0) {
            return this._requirements;
        }
    }),

    '_____meets_requirements': fp(function(a, sig) {
        var requirements = this._requirements;
        if (!requirements) {
            return true;
        } else {
            if (sig == '[s]') {
                var property_name = a[0];
            }
        }

    }),

    'each': function(callback) {
        each(this._, callback);
    },

    'position_within': function(parent) {
        var p_id = parent._id();

        if (this._parents && is_defined(this._parents[p_id])) {
            var parent_rel_info = this._parents[p_id];
            var pos_within = parent_rel_info[1];
            return pos_within;
        }
    },

    'remove_from': function(parent) {
        var p_id = parent._id();

        if (this._parents && is_defined(this._parents[p_id])) {

            var parent = this._parents[p_id][0];
            var pos_within = this._parents[p_id][1];

            // is the position within accurate?
            var item = parent._arr[pos_within];
            //console.log('item ' + stringify(item));


            //console.log('');
            //console.log('pos_within ' + pos_within);
            // Then remove the item in the collection (or Data_Object?) ....
            // and the actual parent?

            // can get control / dataobject / collection by its ID of course.

            parent.remove(pos_within);

            // Remove it by index.

            delete this._parents[p_id];



        }

    },

    '_____check_requirements': fp(function(a, sig) {
        // tell it what to look for with that property.

        if (a.l == 0) {
            // then check all of the requirements
            // returns true if successful, otherwise details of where it fails.

            // could maybe lead to a truth(x) function that checks if x === true, rather than is an object that could be giving details of something being false.
        }

        if (sig == '[s]') {
            // then check that one property
            var property_name = a[0];
        }

        if (a.l == 1 && a[0] === true) {
            // that means it's recursive.
            //  we'll be checking the requirements of this, and of any required objects.



        }


    }),

    'load_from_spec': function(spec, arr_item_names) {
        var that = this;
        each(arr_item_names, function(i, v) {
            var spec_item = spec[v];
            if (is_defined(spec_item)) {
                that['set'](v, spec_item);
            }
        });
    },

    'mod_link': function() {
        return jsgui;
    },

    'value': function() {
        var res = {};
        this.each(function(i, v) {
            if (typeof v.value == 'function') {
                res[i] = v.value();
            } else {
                res[i] = v;
            }

        });
        return res;
    },

    'get': fp(function(a, sig) {
        if (is_defined(this.__type_name)) {
            if (a.l == 0) {
                var output_obj = jsgui.output_processors[this.__type_name](this._);
                return output_obj;
            } else {
                throw 'not yet implemented';
            }
        } else {
            if (sig == '[s,f]') {
                throw 'Asyncronous access not allowed on Data_Object get.'

                var res = this.get(a[0]);
                var callback = a[1];
                if (typeof res == 'function') {
                    res(callback);
                } else {
                    return res;
                }
            }

            if (sig == '[s]') {
                var fc = this.fc;
                var field_name = a[0];
                var field;
                if (fc) {
                    field = fc.get(a[0]);
                }

                if (field_name.indexOf('.') > -1) {
                    var arr_field_names = field_name.split('.');
                    var level = 0, l = arr_field_names.length;
                    var current_obj = this, new_obj, fname;
                    while(level < l) {
                        fname = arr_field_names[level];
                        if (!current_obj) {
                            return undefined;
                        }
                        new_obj = current_obj.get(fname);
                        level++;
                        current_obj = new_obj;
                    }
                    return current_obj;
                }

                if (field) {
                    if (!this._[field_name]) {
                        var sig_field = get_item_sig(field, 20);
                        if (sig_field == '[s,s,f]') {
                            var field_name = field[0];
                            var fieldStrType = field[1];
                            var fieldDef = field[2];

                            if (fieldDef == String) {
                                var dval = new Data_Value({
                                    'context': this._context
                                })
                                this._[field_name] = dval;
                                return this._[field_name];
                            } else if (fieldDef == Number) {
                                var dval = new Data_Value({
                                    'context': this._context
                                })
                                this._[field_name] = dval;
                                return this._[field_name];
                            } else if (fieldStrType == 'Class') {
                                var FieldConstructor = fieldDef;
                                var nObj = new FieldConstructor({
                                    'context': this._context
                                })
                                this._[field_name] = nObj;
                                return this._[field_name];
                            }
                        }

                        if (sig_field == '[s,[s,u]]') {
                            var stack = new Error().stack;
                            console.log(stack);
                        }

                        if (sig_field == '[s,s,o]') {
                            var field_name = field[0];
                            var field_type_name = field[1];
                            var field_info = field[2];
                            if (field_type_name == 'collection') {
                                this._[field_name] = new jsgui.Collection({
                                    'context': this._context
                                });
                                return this._[field_name];
                            } else {
                                if (field_type_name == 'data_object') {
                                    var dobj = new Data_Object({'context': this._context});
                                    this._[field_name] = dobj;
                                    dobj.parent(this);
                                    return this._[field_name];
                                }
                                if (field_type_name == 'ordered_string_list') {
                                    var osl = new Ordered_String_List();
                                    this._[field_name] = osl;
                                    return this._[field_name];
                                } else if (field_type_name == 'string') {
                                    var dv = new Data_Value({
                                        'context': this._context
                                    });
                                    this._[field_name] = dv;
                                    dv.parent(this);
                                    return this._[field_name];
                                } else {
                                    var dt = field_info.data_type;
                                    var dt_sig = get_item_sig(dt, 4);
                                    if (dt_sig == '[s,n]') {
                                        var data_type_name = dt[0];
                                        var data_type_length = dt[1];
                                        if (data_type_name == 'text') {
                                            var dVal = new Data_Value({
                                                'context': this._context
                                            });
                                            this._[field_name] = dVal;
                                            return this._[field_name];
                                        }
                                    } else if (dt_sig == 's') {
                                        var data_type_name = dt;
                                        if (data_type_name == 'int') {
                                            var dVal = new Data_Value({
                                                'context': this._context
                                            });
                                            this._[field_name] = dVal;
                                            return this._[field_name];
                                        }
                                    } else {
                                        var dtoc = this.mod_link().ensure_data_type_data_object_constructor(field_type_name);
                                        var field_val = new dtoc({'context': this._context});
                                        field_val.parent(this);
                                        this._[field_name] = field_val;
                                        return this._[field_name];
                                    }
                                }
                            }

                        } else if (sig_field == '[s,s]') {
                            var field_name = field[0];
                            var field_type_name = field[1];
                            if (field_type_name == 'collection') {
                                throw 'not supported here. should use code in enhanced-data-object.';
                                console.log('pre make coll');
                                var coll = new jsgui.Collection({
                                    'context': this._context
                                });
                                console.log('pre set coll parent');
                                coll.parent(this);
                                this._[field_name] = coll;
                                return this._[field_name];
                            } else if (field_type_name == 'data_object') {
                                var dobj = new jsgui.Data_Object({
                                    'context': this._context
                                })
                                dobj.parent(this);
                                this._[field_name] = dobj;
                                return this._[field_name];
                            } else {
                                var dtoc = jsgui.ensure_data_type_data_object_constructor(field_type_name);
                                var obj = new dtoc({'context': this._context});
                                obj.parent(this);
                                this._[field_name] = obj;
                                return this._[field_name];
                            }
                        } else if (sig_field == '[s,[s,s]]') {
                            var field_name = field[0];
                            var field_info = field[1];
                            if (field_info[0] == 'collection') {
                                var collection_type_name = field_info[1];
                            }
                        } else if (sig_field == '[s,[s,o]]') {
                            var field_name = field[0];
                            var field_info = field[1];
                            var data_type_name = field_info[0];
                            if (data_type_name == 'collection') {
                                var objDef = field_info[1];
                                throw 'not supported here. should use code in enhanced-data-object.';
                            }
                        }
                    } else {
                        return this._[field_name];
                    }
                } else {
                    var res = ll_get(this._, a[0]);
                    if (!res) {
                        if (field_name.indexOf('.') > -1) {
                            throw 'not yet handled';
                        } else {
                            res = this[a[0]];
                        }
                    }
                    return res;
                }
            } else if (a.l == 0) {
                return this._;
            }
        }
    }),

    '___get_fields_chain': function() {
        // is this the prototype / constructor.

        var my_fields = this._fields;

        // a bit difficult...


        console.log('my_fields ' + stringify(my_fields));

        var con = this.constructor;
        console.log('con ' + stringify(con));

    },

    '_get_input_processors': function() {
        //throw 'stop';
        return jsgui.input_processors;
    },

    'set': (function() {
      var a = arguments;
      a.l = arguments.length;
      var sig = get_a_sig(arguments, 1);
        if (this._abstract) return false;

        var that = this, res;

        var input_processors;
        if (this._module_jsgui) {
            input_processors = this._module_jsgui.input_processors;
        } else {
            input_processors = this._get_input_processors();
        }

        if (is_defined(this._data_type_name) && input_processors[this._data_type_name]) {
            throw 'stop';
            console.log('is_defined _data_type_name and input_processors[this._data_type_name]');
            var raw_input = a;
            var parsed_input_obj = input_processors[this._data_type_name](raw_input);
            this._ = parsed_input_obj;
            this.trigger('change');
        } else {
            if (a.l == 2 || a.l == 3) {

                var property_name = a[0], value = a[1];

                var ta2 = tof(a[2]);
                var silent = false;
                var source;

                if (ta2 == 'string' || ta2 == 'boolean') {
                    silent = a[2]
                }

                if (ta2 == 'control') {
                    source = a[2];
                }

                if (!this._initializing && this._map_read_only && this._map_read_only[property_name]) {
                    throw 'Property "' + property_name + '" is read-only.';
                } else {
                    var split_pn = property_name.split('.');
                    if (split_pn.length > 1 && property_name != '.') {
                        var spn_first = split_pn[0];
                        var spn_arr_next = split_pn.slice(1);

                        var data_object_next = this.get(spn_first);
                        if (data_object_next) {
                            var res = data_object_next.set(spn_arr_next.join('.'), value);
                            if (!silent) {
                                var e_change = {
                                    'name': property_name,
                                    'value': value,
                                    'bubbled': true
                                };
                                if (source) {
                                    e_change.source = source;
                                }
                                this.raise_event('change', e_change);
                            }
                            return res;
                        } else {
                            throw('No data object at this level.');
                        }
                        throw('10)stop');
                    } else {
                        var data_object_next = this.get(property_name);
                        if (!is_defined(data_object_next)) {
                            var tv = typeof value;
                            var dv;
                            if (tv == 'string' || tv == 'number' || tv == 'boolean' || tv == 'date') {
                                dv = new Data_Value({'value': value});
                            } else {
                                dv = value;
                            }
                            this._[property_name] = dv;
                            if (!silent) {
                                var e_change = {
                                    'name': property_name,
                                    'value': dv
                                }
                                if (source) {
                                    e_change.source = source;
                                }
                                this.raise_event('change', e_change);
                            }
                            return value;
                        } else {
                            if (is_js_native(data_object_next)) {
                                this._[property_name] = value;
                                res = value;
                            } else {
                                this._[property_name] = value;
                                res = value;
                            }
                            if (!silent) {
                                var e_change = {
                                    'name': property_name,
                                    'value': value
                                };
                                if (source) {
                                    e_change.source = source;
                                }
                                this.trigger('change', e_change);
                            }
                            return res;
                        }
                    }
                }
            } else {
                if (sig == '[D]') {
                    this._[property_name] = value;
                    this.raise_event('change', [property_name, value]);
					return value;
                }
                if (sig == '[o]') {
                    var that = this;
                    var res = {};
                    each(a[0], function(i, v) {
                        res[i] = that.set(i, v);
                    });
                    return res;
                }
                if (sig == '[c]') {
                    this._[property_name] = value;
                    this.raise_event('change', [property_name, value]);
					return value;
                }
            }
        }
    }),

    'has': function (property_name) {
        return is_defined(this.get(property_name));
    }
});


var get_fields_chain = function(data_object_class) {
    var res = [];
    var inner = function(data_object_class) {
        var fields = data_object_class._fields;
        if (fields) {
            res.push(fields);
        }
        var sc = data_object_class._superclass;
        if (sc) {
            inner(sc);
        }
    };
    inner(data_object_class);
    return res;
}

var get_chained_fields = function(data_object_class) {
    var fc = get_fields_chain(data_object_class);
    var i = fc.length; //or 10
    var res = [];
    while(i--)
    {
        var item = fc[i];
        var c = 0;
        each(item, function(i2, field_info) {
            if (tof(i2) == 'string') {
                c = c + 1;
                res.push([c, [i2, field_info]]);
            } else {
                res.push([i2, field_info]);
                c = i2;
            }
        });
    }
    return res;
}

var chained_fields_to_fields_list = function(chained_fields) {
    var l = chained_fields.length;
    var res = new Array(l);
    for (var c = 0; c < l; c++) {
        res[c] = chained_fields[c][1];
    };
    return res;
};

jsgui.map_classes = {};


var initializing = false, fnTest = /xyz/.test(function () {
    xyz;
}) ? /\b_super\b/ : /.*/;


Data_Object.extend = function(prop, post_init) {
    var _super = this.prototype;
    initializing = true;
    var prototype = new this();

    var for_class = {};

    initializing = false;

    if (typeof prop === 'string') {
        var data_type_name = prop;
        var dtis = jsgui.data_types_info;
        var data_type_info = dtis[data_type_name];
        for_class[data_type_name] = data_type_name;
        for_class[data_type_info] = data_type_info;
        prototype['__type_name'] = data_type_name;
        prototype['__data_type_info'] = data_type_info;
        prop = {};
    }
    var prop_item, t_prop_item, tmp, name, res;

    var keys = Object.keys(prop);
    for (var c = 0, l = keys.length; c < l; c++) {
      name = keys[c];
      prop_item = prop[name];

      if (name.charAt(0) === '#') {
          // direct copy with '#'... not been using that.
          prototype[name.substring(1)] = prototype[prop_item];
      } else {
          t_prop_item = typeof prop_item;
          if (t_prop_item === 'function') {
              prototype[name] = typeof _super[name] === 'function' && fnTest.test(prop_item) ?
              (function(name, fn) {
                  return function() {
                      tmp = this._super;
                      this._super = _super[name];
                      res = fn.apply(this, arguments);
                      this._super = tmp;
                      return res;
                  };
              })(name, prop[name]) : prop[name];
          } else if (t_prop_item === 'object' || t_prop_item === 'boolean') {
              if (name == 'class_name') {
                  for_class['_class_name'] = prop_item;
              } else if (name == 'fields') {
                  for_class._fields = prop_item;
              } else if (name == 'connect_fields') {
                  for_class._connect_fields = prop_item;
              } else {
                  prototype[name] = prop[name];
              }
          }  else {
              prototype[name] = prop[name];
          }
      };
    }

    var Class = function() {
        if (!initializing) {
            if (this.init) {
                this.init.apply(this, arguments);
                if (this.post_init) {
                    this.post_init.apply(this, arguments);
                }
            } else {
                var spec = arguments[0] || {};
                spec.abstract = true;
                return new Class(spec);
            }
        }
    };
    Class.prototype = prototype;
    Class.prototype.constructor = Class;
    Class.extend = arguments.callee;
    for (i in for_class) {
        Class[i] = for_class[i];
    }

    if (Class['class_name']) {
        jsgui.map_classes[Class['class_name']] = Class;
    }

    Class._superclass = this;

    return Class;
};


var data_object_matches_field_constraints = function(data_object, field_constraints) {
    each(field_constraints, function(fc_name, fc_value) {
    });
};

var Enhanced_Data_Object = null;

var set_Enhanced_Data_Object = function (EDO) {
    Enhanced_Data_Object = EDO;
};

var get_Enhanced_Data_Object = function () {
    return Enhanced_Data_Object;
};


var dobj = function(obj, data_def) {
    var cstr = Data_Object;
    if (Enhanced_Data_Object) cstr = Enhanced_Data_Object;
    var res;
    if (data_def) {
        res = new cstr({'data_def': data_def});
    } else {
        res = new cstr({});
    }
    var tobj = tof(obj);
    if (tobj == 'object') {
        var res_set = res.set;
        each(obj, function(i, v) {
            res_set.call(res, i, v);
        });
    }
    return res;
};


var parse_field_text = Fields_Collection.parse_field_text;
var parse_data_type = Fields_Collection.parse_data_type;

jsgui.map_data_type_data_object_constructors = jsgui.map_data_type_data_object_constructors || {};
jsgui.map_data_type_data_object_constructors['boolean'] = Data_Value;

var ensure_data_type_data_object_constructor = function(data_type_name) {
    if (!jsgui.map_data_type_data_object_constructors[data_type_name]) {
        var dto = jsgui.data_types_info[data_type_name];
        var dtc = Data_Object.extend({
            'fields': dto
        })
        jsgui.map_data_type_data_object_constructors[data_type_name] = dtc;
    }
    return jsgui.map_data_type_data_object_constructors[data_type_name];
}

jsgui.ensure_data_type_data_object_constructor = ensure_data_type_data_object_constructor;

input_processors.field_text = parse_field_text;
input_processors.data_type = parse_data_type;



Data_Object.Fields_Collection = Fields_Collection;
Data_Object.dobj = dobj;
Data_Object.matches_field_constraints = data_object_matches_field_constraints;
Data_Object.parse_field_text = parse_field_text;
Data_Object.get_chained_fields = get_chained_fields;
Data_Object.chained_fields_to_fields_list = chained_fields_to_fields_list;
Data_Object.map_data_type_data_object_constructors = jsgui.map_data_type_data_object_constructors;
Data_Object.Mini_Context = Mini_Context;
Data_Object.set_Enhanced_Data_Object = set_Enhanced_Data_Object;
Data_Object.get_Enhanced_Data_Object = get_Enhanced_Data_Object;
Data_Object.ensure_data_type_data_object_constructor = ensure_data_type_data_object_constructor;

module.exports = Data_Object;

