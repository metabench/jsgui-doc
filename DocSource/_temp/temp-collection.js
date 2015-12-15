

var jsgui = require('./jsgui-lang-essentials');
var Data_Structures = require('./jsgui-data-structures');
var Data_Value = require('./data-value');
var Data_Object = require('./data-object');
var Data_Object_Field_Collection = require('./data-object-fields-collection');
var Constraint = require('./constraint');
var Collection_Index = require('./collection-index');
//

var Collection_Index_System = Collection_Index.System;
var Sorted_Collection_Index = Collection_Index.Sorted;

var j = jsgui;
var Class = j.Class;
var each = j.each;
var eac = j.eac;
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

var constraint_from_obj = Constraint.from_obj;
var native_constructor_tof = jsgui.native_constructor_tof;

var dop = Data_Object.prototype;

var old_set_field = dop.set_field;

var new_set_field = fp(function(a, sig) {
    // some polymorphic cases which are not checked by the old one.
    if (sig == '[s,[f]]') {
        // It's a constraint / field that is a collection.
        //  The collection actually gets created, _.field_name set to be that collection.

        //console.log('new_set_field sig ' + sig);

        // then create the data type constraint...
        //  the data type for that field is a collection, and that collection has a given type that it accepts.
        var field_name = a[0];
        //console.log('field_name ' + field_name);
        var dt_constructor = a[1][0];

        //console.log('dt_constructor ' + dt_constructor);

        var coll = new Collection(dt_constructor);
        coll._data_type_constraint = new Constraint.Collection_Data_Type(dt_constructor);
        this.set(field_name, coll);

        //throw '12) new_set_field stop';
    } else {
        old_set_field.apply(this, a);
    }
});

dop.set_field = new_set_field;

var obj_matches_query_obj = function(obj, query) {
    //console.log('obj_matches_query_obj');
    //console.log('obj ' + stringify(obj));
    //console.log('query ' + stringify(query));

    var matches = true;
    each(query, function(fieldName, fieldDef) {
        var tfd = tof(fieldDef);
        //console.log('fieldName ' + fieldName);
        //console.log('tfd ' + tfd);

        if (tfd == 'string' || tfd == 'boolean' || tfd == 'number') {
            matches = matches && obj[fieldName] === fieldDef;
            //if (!matches) stop();
        } else {
            throw 'need more work on more complex queries for collection find, iterative search'
        }
    })
    return matches;
}



var Collection = Data_Object.extend({

    'init': function(spec, arr_values) {
        spec = spec || {};
        this.__type = 'collection';
        if (spec.abstract === true) {
            var tspec = tof(spec);
            if (tspec === 'function') {
                this.constraint(spec);
            }
        } else {
            this._relationships = this._relationships || {};
            this._arr_idx = 0;
            this._arr = [];

            this.index_system = new Collection_Index_System({
                'collection' : this
            });

            var spec = spec || {};

            if (tof(spec) == 'array') {
                spec = {
                    'load_array': spec
                };
            } else {
                if (tof(spec) == 'function') {
                    if (spec.abstract === true) {
                        this._abstract = true; // seems never called because of the very first "if" branch
                    } else {

                        if (is_constructor_fn(spec)) {

                            var chained_fields = Data_Object.get_chained_fields(spec);

                            var chained_fields_list = Data_Object.chained_fields_to_fields_list(chained_fields);

                            var index_field_names = [], field_name, field_text;
                            each(chained_fields_list, function(i, v) {
                                field_name = v[0];
                                field_text = v[1];

                                var isIndexed = field_text.indexOf('indexed') > -1;
                                var isUnique = field_text.indexOf('unique') > -1

                                if (isIndexed || isUnique) {
                                    index_field_names.push([field_name]);
                                }
                            });

                            // So, that does it :)
                            var old_spec = spec;
                            spec = {
                                'constraint': spec
                            };

                            if (old_spec == String) {
                                spec.index_by = 'value';
                            }

                            if (index_field_names.length > 0) {
                                spec.index_by = index_field_names;
                            }

                        }

                    }

                } else if (tof(spec) == 'string') {
                    // May be like with the constraint above.
                    // still need to set up the constructor function.

                    var map_native_constructors = {
                        'array': Array,
                        'boolean': Boolean,
                        'number': Number,
                        'string': String,
                        'object': Object
                    }

                    var nc = map_native_constructors[spec];

                    if (nc) {
                        spec = {
                            'constraint': nc
                        };
                        if (nc == String) {
                            spec.index_by = 'value';
                        }
                    }
                }
            }

            if (is_defined(spec.items)) {
                spec.load_array = spec.load_array || spec.items;
            }
            if (arr_values) {
                //console.log('load arr_values ------------');
                spec.load_array = arr_values;
            }

            // this._accepts not used
            if (is_defined(spec.accepts)) {
                this._accepts = spec.accepts;
            }

            // this._context is undefined, Data_Object code will work instead
            if (jsgui.__data_id_method == 'init') {
                // but maybe there will always be a context. May save download size on client too.
                if (this._context) {
                    this.__id = this._context.new_id(this.__type_name || this.__type);
                    this._context.map_objects[this.__id] = this;
                } else {
                }

            }

            if (!this.__type) {
            }
        }


        this._super(spec);
    },

    'set': function(value) {
        var tval = tof(value);
        var that = this;
        if (tval == 'data_object') {
            this.clear();
            return this.push(value);
        } else if (tval == 'array') {
            this.clear();
            each(value, function(i, v) {
                that.push(v);
            });
        } else {
            if (tval == 'collection') {
                // need to reindex - though could have optimization that checks to see if the indexes are the same...
                throw 'stop';
                this.clear();
                value.each(function(i, v) {
                    that.push(v);
                })
            } else {
                return this._super(value);
            }
        }
    },

    'clear': function() {
        this._arr_idx = 0;
        this._arr = [];

        this.index_system = new Collection_Index_System({
            // The collection index system could have different default ways of indexing items.
            //  Each item that gets indexed could get indexed in a different way.
            'collection' : this
        });

        this.trigger('change', {
            'type': 'clear'
        })
    },

    'stringify': function() {
        var res = [];
        if (this._abstract) {
            // then we can hopefully get the datatype name

            // if it's abstract we detect it, otherwise it should be in there.
            var ncto = native_constructor_tof(this._type_constructor);

            res.push('~Collection(')
            if (ncto) {
                res.push(ncto);
            } else {

            }
            res.push(')');

        } else {
            res.push('Collection(');
            //console.log('obj._arr ' + stringify(obj._arr));

            var first = true;
            this.each(function(i, v) {
                if (!first) {
                    res.push(', ');
                } else {
                    first = false;
                }
                res.push(stringify(v));

            })

            res.push(')');
        }
        return res.join('');
    },

    'toString': function() {
        return stringify(this._arr);

    },

    'toObject': function() {
        var res = [];
        this.each(function(i, v) {
            res.push(v.toObject());
        });
        return res;
    },

    'each': fp(function (a, sig) {
        // was callback, context
        // ever given the context?

        if (sig == '[f]') {
            return each(this._arr, a[0]);
        } else {

            if (sig == '[X,f]') {
                // X for index

                // we use the order of the index.
                //  possibly we can iterate using the index itself, maybe with that same callback.

                var index = a[0];
                var callback = a[1];
                return index.each(callback);

            } else {
                if (a.l == 2) {
                    return each(this._arr, a[0], a[1]);
                }
            }
        }
    }),

    'eac' : fp(function(a, sig) {
        // was callback, context
        // ever given the context?

        if (sig == '[f]') {
            return eac(this._arr, a[0]);
        } else {

            if (sig == '[X,f]') {
                // X for index

                // we use the order of the index.
                //  possibly we can iterate using the index itself, maybe with that same callback.

                var index = a[0];
                var callback = a[1];
                return index.eac(callback);

            } else {
                if (a.l == 2) {
                    return eac(this._arr, a[0], a[1]);
                }
            }
        }
    }),

    '_id' : function() {
        if (this._context) {
            this.__id = this._context.new_id(this.__type_name || this.__type);
        } else {
            if (!is_defined(this.__id)) {
            }
        }
        return this.__id;
    },

    'length': function() {
        return this._arr.length;
    },

    'find': fp(function(a, sig) {
        if (a.l == 1) {
            var index_system_find_res = this.index_system.find(a[0]);
            if (index_system_find_res === false) {
                var foundItems = [];
                each(this, function(index, item) {
                    throw 'stop';
                })
            } else {
                return index_system_find_res;
            }
        }
        //
        if (sig == '[o,s]') {
            return this.index_system.find(a[0], a[1]);
        }
        //
        // and if looking for more than one thing...
        if (sig == '[s,s]') {
            return this.index_system.find(a[0], a[1]);
        }
        if (sig == '[a,s]') {
            return this.index_system.find(a[0], a[1]);
        }
        if (sig == '[s,o]') {
            var propertyName = a[0];
            var query = a[1];
            var foundItems = [];
            each(this, function(index, item) {
                var itemProperty = item.get(propertyName);
                var tip = tof(itemProperty);
                if (tip == 'array') {
                    each(itemProperty, function(i, v) {
                        var matches = obj_matches_query_obj(v, query);
                        if (matches) {
                            foundItems.push(v);
                        }
                    })
                }
            })
            return new Collection(foundItems);
        }
    }),

    'get' : fp(function(a, sig, _super) {
        // integer... return the item from the collection.
        if (sig == '[n]' || sig == '[i]') {
            return this._arr[a[0]];
        }

        // getting by it's unique index?
        //  this may again refer to getting a property.

        if (sig == '[s]') {
            var ix_sys = this.index_system;
            var res;
            if (ix_sys) {
                var pui = ix_sys._primary_unique_index;
                res = pui.get(a[0])[0];
            }
            if (res) {
                return res;
            }

            // Works differently when getting from an indexed collection.
            //  Need to look into the index_system
            //  there may be a primary_unique_index

            return Data_Object.prototype.get.apply(this, a);

        }
        // may take multiple params, specifying the fields in the
        // unique index.
    }),

    'insert': function(item, pos) {
        // use array splice...
        //  then modify the index somehow.
        //  perhaps add 1 to each item's position past that point.
        //  may mean n operations on the index.
        //   some kind of offset tree could be useful for fast changes and keeping accurate lookups.

        this._arr.splice(pos, 0, item);

        // index system notify_insertion
        //  so the index system can make the adjustments to the other items.

        // then call the change event.
        //  and have event details saying an item i has been inserted at position p.
        //   for controls, that should be enough to render that control and put it onto the screen
        //   if the context is active.

        this.index_system.notify_insertion(pos);

        this.trigger('change', {
            'name': 'insert',
            'item': item,
            'pos': pos
        });
    },

    'remove': fp(function(a, sig) {
        var that = this;
        if (sig == '[n]') {
            var own_id = this._id();
            // remove the item at that position.
            var pos = a[0];
            var item = this._arr[pos];

            var o_item = item;

            var spliced_pos = pos;
            this._arr.splice(pos, 1);
            this._arr_idx--;
            var length = this._arr.length;
            while (pos < length) {
                // reassign the stored position of the item
                var item = this._arr[pos];
                item.relationships[own_id] = [that, pos];
                pos++;
            }
            // need to remove that item from the index system as well.
            this.index_system.remove(o_item);
            //
            var e = {
                'target': this,
                'item': item,
                'position': spliced_pos
            }
            this.raise_event(that, 'remove', e);
        }

        // and if we are removing by a string key...

        if (sig == '[s]') {
            var key = a[0];

            // get the object...

            var obj = this.index_system.find([['value', key]]);

            // and get the position within the parent.

            var my_id = this.__id;

            var item_pos_within_this = obj[0]._relationships[my_id];

            this.index_system.remove(key);
            this._arr.splice(item_pos_within_this, 1);

            // then adjust the positions downwards for each item afterwards.

            for (var c = item_pos_within_this, l = this._arr.length; c < l; c++) {
                var item = this._arr[c];
                item._relationships[my_id]--;
            }

            var e = {
                'target': this,
                'item': obj[0],
                'position': item_pos_within_this
            }
            this.raise_event(that, 'remove', e);
        }
    }),

    'has': function(obj_key) {
        // will operate differently depending on how the collection is being used.
        //console.log('this._data_type_constraint ' + stringify(this._data_type_constraint));
        if (this._data_type_constraint) {
            //console.log('this._data_type_constraint.data_type_constructor ' + stringify(this._data_type_constraint.data_type_constructor));
            if (this._data_type_constraint.data_type_constructor) {
                if(this._data_type_constraint.data_type_constructor === String) {
                    // collection of strings - does it have that string?
                    //console.log('this.index_system ' + stringify(this.index_system));
                    var found = this.index_system.find('value', obj_key);
                    //console.log('found ' + stringify(found));
                    //throw 'stop';
                    //return !!found;
                    return found.length > 0;
                }
            }
        }
    },

    'get_index': fp(function(a, sig) {
        if (sig == '[s]') {
            return this.index_system.search(a[0]);
        }

    }),

    'find_unique_constraint': function(field) {
        var item = null;
        if (tof(field) == 'array') {

        } else if (tof(field) == 'string'){
            // it's just one string.
            each(this._unique_constraints, function(i, v, stop) {
                // does it match the field?
                if (v.fields === field) {
                    item = v;
                    stop();
                }
            })
        }
        return item;
    },

    'fields': fp(function(a, sig) {
        var that = this;
        if (sig == '[o]') {
            // use a field definition constraint
            //  (a different way of doing the constraint, using json-like object, not using a Data_Object constructor.

            each(a[0], function(i, v) {
                that.set_field(i, v);
            });

            // set the constraints

            that.constraint(a[0]);

        } else {
            if (!this._data_object_constraint) {
                this._data_object_constraint = Constraint.from_obj(new Data_Object());
            }
            var doc = this._data_object_constraint;

            if (a.l == 0) {
                return doc.data_object.fc.get();
            }
            // if given an array, set the fields.

            //console.log('a.l ' + a.l);

            if (a.l == 1 && tof(a[0] == 'array')) {
                //console.log('array 1');
                return doc.data_object.fc.set(a[0]);
            }
        }
    }),

    'set_field': fp(function (a, sig) {
        var that = this;
        var doc = that._data_object_constraint = that._data_object_constraint || Constraint.from_obj(new Data_Object());
        if (a.l == 2 && tof(a[0]) == 'string') {
            doc.data_object.fc = doc.data_object.fc || new Data_Object_Field_Collection();
            return doc.data_object.fc.set(a[0], a[1]);
        }
    }),

    'remove_field': fp(function(a, sig) {
        var doc = this._data_object_constraint;
        if (doc) {
            if (sig == '[s]') {
                return doc.data_object.fc.out(a[0]);
            }
        }
    }),

    'get_data_type_constraint': function() {
        // there may just be one ._data_type_constraint.
        //  not having all the constraints listed together.

        return this._data_type_constraint;


    },

    'constraint': fp(function(a, sig) {
        if (sig == '[]') {
            // Get all of the constraints.

            // if no constraints, return null.
            var res = null;

            if (this._data_type_constraint) {
                res = {
                    'data_type': this._data_type_constraint
                }
            }
            if (this._data_object_constraint) {
                res = res || {};
                res.data_object = this._data_object_constraint;
            }
            if (this._data_def_constraint) {
                res = res || {};
                res.data_def = this._data_def_constraint;
            }
            return res;
        }

        if (sig == '[o]') {
            this._data_def_constraint = new Constraint.Collection_Data_Def(a[0]);
        }

        if (sig == '[f]') {
            if (a[0] === Number) {
                //var cdtc = new Constraint.Collection_Data_Type(a[0]);
                this._data_type_constraint = new Constraint.Collection_Data_Type(a[0]);
                return this._data_type_constraint;
            }
            if (a[0] === String) {
                //var cdtc = new Constraint.Collection_Data_Type(String);
                this._data_type_constraint = new Constraint.Collection_Data_Type(a[0]);
                //console.log('this._data_type_constraint ' + this._data_type_constraint);
                return this._data_type_constraint;
            } else if (is_constructor_fn(a[0])) {

                //console.log('is_constructor_fn ');
                var data_type_constructor = a[0];
                // set up the data type constraint.
                //  can have a Type_Constraint on a collection... each object in the collection must satisfy that type.
                //   different to having it satisfy a particular data_object's constraints.
                var dtc = this._data_type_constraint;
                if (dtc) {
                    var cdtc = this._data_type_constraint.data_type_constructor;
                    if (cdtc && cdtc === data_type_constructor) {
                        //console.log('returning dtc');
                        return dtc;
                    }
                }
                this._data_type_constraint = new Constraint.Collection_Data_Type(data_type_constructor);
                //console.log('this._data_type_constraint ' + this._data_type_constraint);
                return this._data_type_constraint;
                // have a look at the existing data_type_constraint

            }
        }
        // ['unique', 'isbn-13']
        // ['unique', ['school_id', 'school_assigned_student_id']]

        // will need to ensure there is an index for that set of fields.

        // is it an array?
        //  could be an array of different constraints

        if (sig == '[D]') {
            var constraint = constraint_from_obj(a[0]);
            this._data_object_constraint = constraint;
        }

        if (sig == '[[s,s]]') {
            // A single constraint, with one string parameter (probably its field)

            var constraint_def = a[0];
            var constraint = constraint_from_obj(constraint_def);

            var c_type = constraint._constraint_type;

            if (c_type == 'unique') {
                this._unique_constraints = this._unique_constraints || [];
                var field_name = constraint_def[1];
                var existing_unique_constraint = this.find_unique_constraint(field_name);
                if (existing_unique_constraint) {
                    return existing_unique_constraint;
                } else {
                }
            }
        }
    }),

    'get_unique_constraint': function(fields) {
        if (tof(fields) == 'string') fields = [fields];
        each(this._unique_constraints, function(i, unique_constraint) {
            var uc_fields = unique_constraint.fields;
            //console.log('uc_fields ' + stringify(uc_fields));

            if (are_equal(uc_fields, fields)) return unique_constraint;
        });
    },

    'unique': fp(function(a, sig) {
        var that = this;
        if (sig == '[s]') {
            return this.unique([a[0]]);
        }
        if (tof(a[0]) == 'array') {
            if (is_arr_of_arrs(a[0])) {
                //console.log('is_arr_of_arrs');
            }
            if (is_arr_of_strs(a[0])) {
                var existing_uc = this.get_unique_constraint(a[0]);
                if (existing_uc) return existing_uc;
                var new_uc = new Constraint.Unique({
                    'fields': a[0]
                });
                this._unique_constraints = this._unique_constraints || [];
                this._unique_constraints.push(new_uc);
                var idx = this.index(a[0]);
            }
        }
    }),

    'indexes': fp(function(a, sig) {
        if (a.l == 0) {
            // get all indexes.
            // will look at the index system, and get the indexes from that.
            var index_system = this.index_system;
            //console.log('index_system ' + index_system);
            var indexes = index_system.indexes();
            return indexes;
        }
    }),

    'index_by': fp(function(a, sig) {
        var that = this;
        if (sig == '[a]') {
            if (is_arr_of_strs(a[0])) {
                // then it's a single index.
                var relevant_index = this.index_system.get_index_starting(a[0]);
                if (relevant_index) {
                    return relevant_index;
                } else {
                    var index_spec = a[0];
                    var new_index = this.index_system.ensure_index(index_spec);
                    return new_index;
                }
            }
            // If it's an array of arrays... it's an array of indexes.
            if (is_arr_of_arrs(a[0])) {
                // deal with each of them in turn.
                each(a[0], function(i, specified_index) {
                    that.index(specified_index);
                });
            }
        }

        // otherwise, we'll be taking a map of what to index and what type of index to use there.

        // get the index, based on that name?
        if (sig == '[s]') {
            // Tell the index to sort itself based on that value.
            return that.index({
                'sorted': [[a[0]]]
            });
        }

        if (sig == '[o]') {
            var index_map = a[0];
            each(index_map, function(index_type, index_definition) {
                if (index_type == 'sorted') {
                    // set up the individual index of the specified type.
                    if (tof(index_definition) == 'array') {
                        // is it an array of strings? then it is the fields?
                        // is it an array of arrays?
                        if (is_arr_of_arrs(index_definition)) {
                            // each index, each field in the index
                            var indexes = [];
                            each(index_definition, function(i, individual_index_fields) {
                                var index = new Sorted_Collection_Index({
                                    'fields' : individual_index_fields
                                });
                                that.index_system.set_index(index);
                                indexes.push(index);
                            });
                            that.index_system._primary_unique_index = indexes[0];
                            return indexes[0];
                        }
                        if (is_arr_of_strs(index_definition)) {
                            // one index, with fields
                        }
                    }
                }
            })
        }
    }),

    'index': fp(function(a, sig) {

        if (a.l == 1) {
            return this.index_by(a[0]);
        }


    }),

    'test_object_against_constraints': function(obj) {
        // will do the test for the various constraints
        if (this._type_constructor) {
            if (!obj instanceof this._type_constructor) return false;
        }
        if (this._data_object_constraint) {
            if (!this._data_object_constraint.match(obj)) return false;
        }
        if (this._data_type_constraint) {
            if (!this._data_type_constraint.match(obj)) return false;
        }
        //
        var that = this;
        var res = true;
        each(this._unique_constraints, function(i, unique_constraint) {
            var uc_fields = unique_constraint.fields;
            var find_params = [];
            each(uc_fields, function(i, field_name) {
                var field_value = obj.get(field_name);
                find_params.push([field_name, field_value]);

            });
            var found = that.find(find_params);
            if (found && found.length > 0) {
                res = false;
            }
        });
        return res;
    },

    'push': function(value) {
        var tv = tof(value);
        if (tv == 'object') {
            var dtc = this._data_type_constraint;
            if (dtc) {
                var dtcon = dtc.data_type_constructor;
                value = new dtcon(value);
            } else {
                var ddc = this._data_def_constraint;
                var match = true;
                if (ddc) match = ddc.match(value);
                if (!match) {
                    throw 'Does not match data_def constraint';
                } else {
                    if (ddc) {
                        value = dobj(value, ddc.data_def);
                    } else {
                        value = dobj(value);
                    }
                    value.constraints(ddc);
                }
            }
            tv = tof(value);
        }
        //
        if (tv == 'collection') {
            var constraints_test_res = this.test_object_against_constraints(value);
            if (constraints_test_res) {
                this.index_system.unsafe_add_object(value);
                var pos = this._arr.length;
                this._arr.push(value);
                value.parent(this, pos);
                //
                var e = {
                    'target': this,
                    'item': value,
                    'position': pos,
                    'type': 'insert'
                }
                this.raise_event('change', e);
                //
                this._arr_idx++;
            } else {
                var stack = new Error().stack
                throw('Collection constraint(s) not satisfied');
            }
        }
        //
        if (tv == 'data_object' || tv == 'control') {
            var constraints_test_res = this.test_object_against_constraints(value);
            if (constraints_test_res) {
                this.index_system.unsafe_add_object(value);
                var pos = this._arr.length;
                this._arr.push(value);
                var e = {
                    'target': this,
                    'item': value,
                    'position': pos,
                    'type': 'insert'
                }
                value.parent(this, pos);
                this.raise_event('change', e);
                this._arr_idx++;
            } else {
                var stack = new Error().stack
                throw('Collection constraint(s) not satisfied');
            }
        }
        //
        if (tv == 'array') {
            return this.push(new Collection(value));
        }
        //
        if (tv == 'string' || tv == 'number') {
            var constraints_test_res = this.test_object_against_constraints(value);
            if (constraints_test_res) {
                var dv = new Data_Value({'value': value});
                var pos = this._arr.length;
                this._arr.push(dv);
                var e = {
                    'target': this,
                    'item': dv,
                    'position': pos,
                    'type': 'insert'
                }
                this.raise_event('change', e);
                if (tv == 'string') {
                    // indexing the value
                    this.index_system.unsafe_add_object(dv);
                }
            } else {
                console.trace();
                throw('wrong data type');
            }
        }
        //this._arr_idx++;
        return value;
    },

    'load_array': function(arr) {
        var that = this;
        var dtc = this._data_type_constraint;
        if (dtc) {
            // is a Collection_Data_Type_Constraint
            var data_type_constructor = dtc.data_type_constructor;
            for (var c = 0, l = arr.length; c < l; c++) {
                that.push(arr[c]);
            }
        } else {
            for (var c = 0, l = arr.length; c < l; c++) {
                that.push(arr[c]);
            }
        }
        this.raise_event('load');
    },

    'values': fp(function(a, sig) {
        if (a.l == 0) {
            return this._arr;
        } else {
            var stack = new Error().stack;
            //console.log(stack);
            //console.log('');
            //console.log('sig ' + sig);
            // should be setting the values.
            throw 'not yet implemented';
        }
    }),

    'value': function() {
        var res = [];
        this.each(function(i, v) {
            if (typeof v.value == 'function') {
                //res[i] = v.value();
                res.push(v.value());
            } else {
                res.push(v);
            }

        });
        return res;
    }

});

var p = Collection.prototype;
p.add = p.push;


Collection.extend = function() {
    var a = arguments;
    var args = [a[0]];
    // call Data_Object.extend with another function for post-initialization?

    if (a[0].data_object) {
        //console.log('extending a Collection with .data_object');
        args.push(function() {
            // post-init function to get called after the init function.

            this.constraint(a[0].data_object);
        })
        //throw 'stop';
    }
    // execute a post-init function in order to set the constraint in some circumstances?
    //var args = [a[0]]


    var res = Data_Object.extend.apply(this, args);


    return res;

}

module.exports = Collection;

