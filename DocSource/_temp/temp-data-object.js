/*
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}


define(["./jsgui-lang-essentials", "./jsgui-data-structures", "./constraint", "./data-object-fields-collection"],
	function(jsgui, Data_Structures, Constraint, Fields_Collection) {

	*/
var jsgui = require('./jsgui-lang-essentials');
var Data_Structures = require('./jsgui-data-structures');
var Data_Value = require('./data-value');

var Constraint = require('./constraint');
var Fields_Collection = require('./data-object-fields-collection');
var Evented_Class = require('./evented-class');

	// Creates the Constraints data type... so a constraint specified with a string can be tested against
	//  also a cache of the constraints that have been made through the string - quick to get them again for reuse when testing.

	// Constraint objects can be saved and used in various places.
	//  They may not always be referred to directly, that would save on the amount of code needed.

	// They will help in making a model of what gets put into a database.
	//  A few constraints put in place in the domain model or similar will help with its translation to a database model.

	// These wide-ranging things should help a lot with creating a wide range of performant databases quickly.
	// It will also be a good tool in itself.

	// Change events
	// -------------

	// Want to have different levels of responding to change events.
	//  It gets a bit complicated with the same data represented in different places and also in transmission between them.
	//  Data will have various different statuses.
	//  Need to be able to recieve data from the server, and update the client data models, and announce it within the client app,
	//   without then telling the server that the data has been changed on the client, unless it makes it clear to the server that the client was
	//   making the change as the server requested. That change acknowledgement could be a useful feature on the client.
	//    Don't want that to be more than an acknowledgement though.
	//   Also need to deal with change initiation properly.
	//    The change could be initiated on the client, needs to be updated on the server, and then sent to the various different clients.
	//     Could have different levels of receipt validation there too, so that the client knows once the change has been recieved (and processed?) by
	//      the other clients. This could be useful for amber and green lights in a chat system, for example.
	///    Receipt of message validation would also be useful for data structures and making them transactional if possible.

	// So, we need a type of set that is for updating the data from an updated external source.

	// notify_change_from_external
	//  and when that has processed it could send a receipt of update message notification back to the server.
	//  That should probably be optional.














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
var get_item_sig = j.get_item_sig;
var get_a_sig = j.get_a_sig;
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



var is_js_native = function(obj) {
    var t = tof(obj);
    return t == 'number' || t == 'string' || t == 'boolean' || t == 'array';
}


var Data_Object = Evented_Class.extend({
    'init': function(spec) {
        if (!spec) spec = {};

        if (spec.abstract === true) {
            this._abstract = true;
            var tSpec = tof(spec);

            if (tSpec == 'function') {
                this._type_constructor = spec;
            }
            // Abstract controls won't be dealing with events for the moment.
            if (tSpec == 'object') {
                this._spec = spec;
                // could possibly
                // but maybe want to keep this json-friendly.

                // the type constructor could be used in a collection.
                //  could be more leightweight than other things? specific constraint objects.
            }

        } else {
            var that = this;
            this._initializing = true;

            var t_spec = tof(spec);
            //console.log('t_spec', t_spec);

            if (!this.__type) {
                this.__type = 'data_object';

            }

            if (!this.hasOwnProperty('_')) {
                this._ = {};
            }

            if (t_spec == 'object') {
                // Normal initialization

                if (spec.context) {
                    //console.log('spec has context');

                    this._context = spec.context;
                }

                if (spec._id) {
                    this.__id = spec._id;
                }

                // want to see if we are using any of the spec items as fields.


            }
            if (t_spec == 'data_object') {
                // Initialization by Data_Object value (for the moment)

                // Not so sure about copying the id of another object.

                if (spec._context) this._context = spec._context;

                // then copy the values over from spec.

                var spec_keys = spec.keys();
                console.log('spec_keys', spec_keys);

                each(spec_keys, function(i, key) {


                    //that.set(key, spec.get(key));
                    that.set(key, spec.get(key));
                });


            }


            if (!is_defined(this.__id) && jsgui.__data_id_method == 'init') {

                // It should have the context...
                //  But maybe there can be a default / application / initialization context (not serving a particular page).
                //   Things to do with processing jsgui would be in that context.

                if (this._context) {
                    //console.log('this._context ' + this._context);
                    //console.log('sfy this._context ' + stringify(this._context));
                    this.__id = this._context.new_id(this.__type_name || this.__type);
                    //console.log('DataObject new ID from context: ' + this.__id);

                    //this._context.map_objects[this.__id] = this;
                    // Not keeping a map of objects by id in the context.

                } else {

                    // Use the default context.
                    // possibly make a new_data_object_id function?

                    // Maybe don't need to give all data objects ids.

                    //var create_id = function()
                    /*
                    var new_data_object_id = function() {
                        var res = '_tid_' + t_id_num;
                        t_id_num++;
                        console.log('new temp id ' + res);
                        return res;
                    }

                    console.log('no context found - creating new temp id. should have context');

                    this.__id = new_data_object_id();

                    */
                    // don't think we keep a map of all IDs, or we will do within a Page_Context.
                    //map_jsgui_ids[this.__id] = this;
                    // and make sure it is within the index / map of jsgui objects with ids.
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
                this.fc = new Fields_Collection({
                });

                // but the field object itself may be created on get.
                //  need to make sure at that time it has its parent.

                // need to check how this is getting set now.
                //  This is only really dealing with setting up some info for the fields, the fields will likely be empty until they are needed,
                //   using lazy loading to save memory.
                //console.log('');
                //console.log('');
                //console.log('*** chained_fields_list ' + stringify(chained_fields_list));

                //this.fc.set(chained_fields);
                this.fc.set(chained_fields_list);

                // the fields collection... that needs to handle fields that are given
                //  as constructor functions.
                //   maybe assume a function is a constructor function?
                //    then a 'products' field that is given by a constructor function
                //     would then have a connected field that sets that value.


                var do_connect = this.using_fields_connection();
                if (do_connect) {

                    var arr_field_names = [], field_name;
                    each(chained_fields, function(i, field_info) {
                        //console.log('field_info ' + stringify(field_info));

                        field_name = field_info[1][0];
                        //console.log('field_name ' + field_name);
                        arr_field_names.push(field_name);
                    });

                    // just an array of fields.
                    //console.log('arr_field_names ' + stringify(arr_field_names));
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
                                    console.log('*** chained_field_name ' + chained_field_name);
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

    },

    'init_default_events': function() {

        /*
        var that = this;
        this.add_event_listener('add', function(e) {

            if (tof(e) == 'collection') {
                var stack = new Error().stack;
                console.log(stack);
                throw 'The event object should not be a collection.';
            }

            var parent = that.parent();
            if (parent) {
                parent.raise_event('add', e);
                //throw 'stop';
            }

        });

        this.add_event_listener('remove', function(e) {
            var change_e = {};
            each(e, function(i, v) {
                change_e[i] = v;
            });
            change_e.event_name = 'remove';
            that.raise_event('change', change_e);

            var parent = that.parent();
            if (parent) {
                parent.raise_event('remove', e);
                //throw 'stop';
            }
        })
        */


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
        //console.log('parent sig', sig);

				// And _parent should be set automatically when the controls are put in place.

        if (a.l == 0) {
					//console.log('this._parent', this._parent);
            return this._parent;
        }
        if (a.l == 1) {
            obj = a[0];

            if (!this._context && obj._context) {
                this._context = obj._context;
            }

            // IDs will only work within the context.



            // Another way of expressing this?

            // Can have a single parent, or multiple parents.
            //  May want something to be the only parent. Could have a different mode for multiple parents.

            //  this._parent = obj?


            //console.log('parent obj_id ' + obj_id);
            //throw 'stop'
            //console.log('obj ' + stringify(obj));
            // should maybe rename or subdivide _relationships.
            //  it will also be useful for databases.
            //  however, would need to work with the constraint system.
            //   likely that they would be syncronised through code.

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
            // I think we just set the __index property.
            //  I think a __parent property and a __index property would do the job here.
            //  Suits DOM heirachy.
            // A __relationships property could make sense for wider things, however, it would be easy (for the moment?)
            // to just have .__parent and .__index
            //


            // Not sure all Data_Objects will need contexts.
            //  It's mainly useful for Controls so far




        } else {
            // get the object's id...

            // setting the parent... the parent may have a context.





        }
    },

    '_fp_parent': fp(function(a, sig) {

        // Maybe detect if it's a Data_Object or Control relatively quickly here.
        //  Then perhaps call ._parent_Data_Object
        //   there would likely be some more optimized functions.

        // ._parent_get



        //console.log('parent sig ' + sig);
        //throw 'stop';
        if (a.l == 0) {
            // there could be just a single parent...
            //  if there is more they will be returned as an array.

            var arr_parents = [];

            // look at the _relationships.

            // _relationships will be used instead of .parent or ._parent
            //console.log('this._relationships ' + stringify(this._relationships));
            //console.log('this._parents ' + stringify(this._parents));

            //console.log('this ' + stringify(this));

            //var stack = new Error().stack
            //console.log(stack);
            //throw 'stop';

            // and each relationship record may indicate a parent
            //  does so with an integer, which is the index within that parent.
            //   will make for more efficient algorithms than jQuery's .index().
            var tri;
            each(this._relationships, function(relative_id, relationship_info) {
                tri = tof(relationship_info);

                console.log('relative_id ' + relative_id);

                if (tri == 'number') {
                    // Relationships will be changed and tested.

                    // it indicates a parent.
                    // perhaps we should also return the position within the parent?

                    // This needs changing / fixing.

                    throw 'Relationships system needs more work here. Had been using the map of all many objects, which has been removed for web server performance reasons.';

                    /*
                    var id_map = map_jsgui_ids;

                    if (this._context) {
                        id_map = this._context.map_objects;
                    }

                    arr_parents.push(id_map[relative_id]);
                    */


                } else {
                    //console.log('tri ' + tri);

                    if (tri == 'data_object' || tri == 'collection') {
                        arr_parents.push(relationship_info);
                    }
                    //console.log('relative_id ' + relative_id);
                    //console.log('map_jsgui_ids[relative_id] ' + map_jsgui_ids[relative_id]);
                    //throw 'stop';
                }

            });

            /*


            each(this._parents, function(i, v) {
                arr_parents.push(v);
            });
            */
            if (arr_parents.length == 1) {
                return arr_parents[0];
            } else if (arr_parents.length > 1) {
                return arr_parents;
            }

        } else {
            //if (sig == '')
            //throw '2) stop';
            // otherwise, may have been given a parent control.
            //  May make a test suite to test types and signatures.

            // the parent should be a Data_Object (which includes Control), as well as other things.
            //  I think that there will be a lot of power and flexibility in controls when they get used again using the Data_Object underpinnings.
            // It will also be possible to make much more condensed versions of the framework.
            //

            // Parents needs a significant amount more work...
            //  But needs to store the positions within parents.

            // set the parent - but may also need to know the position of the child.

            if (sig == '[D]') {
                var parent = a[0];

                //console.log('[D] parent io Data_Object ' + (parent instanceof Data_Object));
                //console.log('[D] parent io Collection ' + (parent instanceof Collection));

                if (parent._context) this._context = parent._context;

                // maybe better to just use ._parent.

                var use_parent_id = function() {


                    var p_id = parent._id();

                    // This could return the position within that parent?

                    // It may not have its position set - because if the parent is a Data_Object, then it does not have positions as such.
                    var tp = tof(parent);

                    if (tp == 'data_object') {
                        //this._parents = this._parents || {};
                        // but it's position may effectively be the field name...
                        //  may be worth having that.


                        //this._parents[p_id] = parent;

                        this._relationships = this._relationships || {};

                        this._relationships[p_id] = parent;

                    }

                    if (tp == 'collection') {
                        throw 'Required: position in array of item';
                    }

                }

                // an array of parents?
                //  or just set the parent? Multiple parents would help (in theory).
                var use_parent_ref = function() {
                    // will work on parent later on.


                }





            }

            // could be a collection and a number...

            if (sig == '[D,n]') {
                var parent = a[0];
                var p_id = parent._id();
                var position_in_array = a[1];

                if (parent._context) this._context = parent._context;

                // it's the child saying it's got the attribution to the parent here

                // child knows what poisition it is within parent.

                this._parents = this._parents || {};

                this._parents[p_id] = [parent, position_in_array];

                // parent keeps a list of all children?
                // parent can have children in different places, in different other collections.

                //console.log('position_in_array ' + position_in_array);

                //parent.children.


            }

            /*

            if (a.l == 1) {

                //console.log('sig ' + sig);
                //throw 'stop';

                // the signature could be D, a Data_Object.




                console.log('p_id ' + p_id);

                // parents dict of objects... not sure about using an actual collection here.
                //  could get too complicated unnecessarily.
                // Could try it later when data structures are more finished.

                this._parents = this._parents || {};

                this._parents[p_id] = parent;


            }
            */

        }
    }),

    '_id': function() {
        // gets the id.
        //console.log('Data_Object _id this._context ' + this._context);

        // Should get the context at an early stage if possible.
        //  Need to have it as the item is added, I think.
        if (this.__id) return this.__id;

        if (this._context) {
            //console.log('this.__type ' + this.__type);

            // __type will be control?
            // __data_type as control.
            //  that's the overriding type, there are a few of them
            // __type could be the more specific type such as radio_button.

            //console.log('this._context.new_id ' + this._context.new_id);

            this.__id = this._context.new_id(this.__type_name || this.__type);

            //console.log('__id ' + this.__id);
            //throw '!stop';
        } else {
            if (this._abstract) {
                return undefined;
            } else if (!is_defined(this.__id)) {

                // What does not have the abstract?

                //var stack = new Error().stack;
                //console.log(stack);

                // no such function... but there should be something declared in many situations.

                throw 'stop, currently unsupported.';
                this.__id = new_data_object_id();

                console.log('!!! no context __id ' + this.__id);
            }
        }
        return this.__id;
    },

    'field': fp(function(a, sig) {

        //.fields() may be better suited to getting info about the fields, rather than all of the fields' info.
        //  Making the APIs return relatively simple data is a step to take.
        //  Keeping the functionality but simplifying the APIs.
        //   Sometimes more complicated API calles will be made, but they will take more parameters that shows the coder expects to get
        //   more complicated results back.




        // field names
        // field names and values
        // field names and types
        // field names, types and values

        // I think field names and types is a neat amount of data that will help with debugging.
        //  Can it return an object which has a .values() function?

        //  Check in the fields collection, for the fields' metadata, or could check the fields definition?
        //  Want to be able to tell what Control Fields a Control has, for example.
        // It would be good to have simply named functions return data that's not all that complicated and can be debugged easily, where possible.

        // Can have a different mechanism for getting all fields' values.

        // Also, getting the field objects themselves, they have associated constraints.








        // an easier interface to the fields than fields and constraints.
        //  this may be immutable when it is held in a collection - not sure.
        //  may not want to keep creating new copies of field sets and constraints for use in individual Data_Objects.

        // The individual Data_Objects will need to have their own constraints, to begin with.

        // we may have been given the chained fields here.
        //


        //console.log('***** fields sig ' + sig);

        // Should have had fields set already.
        //  The Data_Object constructor should find out what fields are part of it.
        //  Not sure how easy that is to do from that level... there needs to be a way.

        //

        var that = this;

        if (a.l == 0) {

            // Will be keeping track of the fields internally.
            //  They get stored in an array, so that the order gets maintained.

            /*

            //console.log('fields this._map_field_constraints ' + stringify(this._map_field_constraints));

            var res = [];

            each(this._map_field_constraints, function(field_name, v) {
                //console.log('field_name ' + field_name);
                //console.log('v ' + stringify(v));

                // then for each constraint, get an info object from it.
                // v.to_obj_info
                // v.to_info_obj

                each(v, function(i2, constraint_for_field) {

                    // May also be saying it's a primary key field
                    //  Need more work on setting fields


                    if (constraint_for_field instanceof Constraint.Field_Data_Type) {
                        var field_constraint_info_obj = constraint_for_field.to_info_obj();
                        //console.log('field_constraint_info_obj ' + stringify(field_constraint_info_obj));

                        // find out if the field is read-only.

                        var flags = [];
                        if (that._map_read_only && that._map_read_only[field_name]) {
                            flags.push('read_only');
                        }
                        if (flags.length == 0) {
                            res.push([field_name, field_constraint_info_obj]);
                        } else {
                            res.push([field_name, field_constraint_info_obj, flags]);
                        }
                    }
                });
            });

            return res;
            */

            // an index of the position of a field within the array? Would that be useful?
            //  means some encapsulation may be worthwhile here

            // have a look at the fc (fields_collection)

            var fields_collection = this.fc;
            //console.log('fields_collection ' + fields_collection);

            // not just the field values.
            var res;


            if (fields_collection) {
                res = fields_collection.okvs.values();
            } else {
                res = [];
            }

            return res;


            //return this._arr_fields || [];
            // can get a position map relatively quickly from the array of fields.
            //  can be done after any adjustment on the fields is done.
            // this._field_positions_by_name
            //  or a linked list of fields? That could work for preserving order, iterating, insertion, deletion,


        }

        if (sig == '[s]') {
            // get a single field.

            // get the field from the field_collection.
            var fc = this.fc = this.fc || new Fields_Collection();


            //var fc = this.fc || this.fc = new Fields_Collection();
            //console.log('** fc ' + fc);


            var res = fc.get(a[0]);
            //console.log('res ' + stringify(res));
            return res;

        }

        //var that = this;
        if (sig == '[o]') {
            // when giving it the chained fields, need to process them right.
            //  may be best to clone them.

            //console.log('a[0] ' + stringify(a[0]));

            // better to ensure the fields in order...

            //  can set each field individually.

            // Setting a field with a value...
            //  The field type could be a bit more complex.
            //  Need to be careful about using JSON or JS object input to set a field - it may need to be instantiated from that input.





            each(a[0], function(i, v) {
                //console.log('i ' + stringify(i));
                //console.log('v ' + stringify(v));

                // it's using the new set_field in Collection.
                that.set_field(i, v);
                // for setting an existing field...
                //  see if the field exists (search the fields object or other lookup)
                //   if it exists, modify the existing one - complicated when other things depend on this.
                //    the constraints and indexes will also depend on the fields, so a modification in a field can result in the removal of a constraint or index.
                //     removal of a field could necessitate the removal of a constraint or index.
                //      remove_constraints_for_field
                //      remove_indexes_for_field

                // Don't want to remove multi-field constraints when replacing one field - but do want that when properly removing a field.
                //  I guess this will just take a bit more coding and testing to get the desired behaviors.
                // Really want to be using fields as a convenitent interface for constraints.
                //  They will encompass a few things involving them.
            }, that);
        }

    }),

    'constraints': fp(function(a, sig) {
        if (a.l == 0) {
        }
        if (sig == '[o]') {
            // setting the field constraints.

            // May have a closer look at those objects.

            // overwrite existing ones.
            var field_constraints = a[0];
            this._field_constraints = field_constraints;


            // does it match the current field constraints?
            //  if not, throw an error.



        }


        if (a.l == 2 && tof(a[0]) == 'string') {




        }



        // may be returning the field constraints



    }),

    'matches_field_constraint': fp(function(a, sig) {
        // there may be more than one constraint for that field.

        //console.log('matches_field_constraint sig ' + sig);
        //console.log('matches_field_constraint a ' + stringify(a));


        if (sig == '[s,s]') {
            var field_name = a[0];

            // the constraint as just one item.
            //  there could be multiple fields constraints for that item.

            if (tof(a[1]) == 'string') {
                var str_constraint = a[1];

                // then use the constraint module to test these.

                var field_val = this.get(field_name);
                return obj_matches_constraint(field_val, str_constraint);
            }

            if (tof(a[1]) == 'array') {
                throw 'Multiple constraints not yet implemented here';
            }



        }

        //throw('stop')

        // given as string


        //


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
        // array... process them?
        //  could arrayify the whole function.
    })),

    'set_field': fp(function(a, sig) {

        // This will be overhauled...
        //   It will need to efficiently see if an existing field is there.

        // If it is there, it will update the field. That may then mean that constraints need to get updated as well..
        //  would mean removing some existing ones perhaps?
        // But it would check what constraints are then needed for that field and remove the extraneous ones.
        //  Same with single-field indexes.

        // When adding the field, would also need to update the constraints.
        //  Could have the constraint system respond to field changes, maybe be the first listener.
        //   using this.ensure_field_constraint(field_name, field_info);?


        this.fc = this.fc || new Fields_Collection();

        return this.fc.set.apply(this.fc, a);

        // although it has been added, we need to set the parent...
        //  maybe fc can do this?

        //console.log('set_field sig ' + sig);
        //console.log('set_field a ' + stringify(a));

        // [s,[f]]
        //  data type is defined by a constructor within an array
        //   means a collection of that type.

        // sets a data type constraint on that field
        /*
        if (sig == '[s,[f]]') {

            throw '10) Stop';
        }
        */
        // Collection has something that overrides this.
        /*
        if (sig == '[s,s]') {
            // will need to interpret the second part
            var field_name = a[0];
            var field_text = a[1];

            //console.log('field_text ' + field_text);
            // parse the fiex text. it may have some things to do with constraints that apply to the collection, if it is in a collection.
            //  not so sure about saving these here. They could be saved so that they get put into a collection fine with other unique fields...
            // but then we'll be taking more care specifying things in the collection if necessary.

            var field_info = input_processors['field_text'](field_text);

            //console.log('field_info ' + stringify(field_info));

            // then ensure the constraint(s) corresponding to the field, where possible.
            //  not able to put uniqueness constraint in place here, yet. It's really dealt with and enforced by the Collection class.

            // I think the library core is getting pretty big now, it could still do with more for HTML, CSS processing.
            //  The database side of things will be expanded, it will be good to have code using very nice syntax provided by the library.

            this.ensure_field_constraint(field_name, field_info);

            if (field_info.read_only) {
                this.read_only(field_name);
            }

            // Just need to do quite a lot more...
            //  Quite a bit more needed for the objects to work like they should, then I'll be using those objects for the HTML components, and also for the
            //  database layer.

            // Persisting to that DB layer seems like a really useful stage, not sure about open-sourcing that code.
            //  May be best to... may be better that my ORM is used. I'd still have the powerful web app too?
            //   Could have different licensing for that component... commercial deployments cost money?
            //    But then want to have things distributed nice and easily. Perhaps could have different options for this. With the website running out-of-the-box,
            //     could directly go to the Mongo layer.
            // Would be very nice to have open-source code producing everything that's needed. Could get quite a lot of interest.
            //  Maybe will keep that on my server for the moment, or in the client-side applications people use.
            // Will be fine without OSing all the ORM, but a relatively simple Mongo layer would work fine.
            //  It may be more what people want, and would get developer interest. The ORM would be useful for accessing legacy systems? SQL can be very useful in its
            //   own right, but could be harder to use effectively in this case.


            // does it have the not_null constraint?
            //  each field can have more than one constraint.
            //  not sure about a collection of constraints though.
            //   perhaps a simpler collection would be very useful in implementing some of the more advanced things.
            //  array of constraints for each field will do for the moment.

            // can be both a Not_Null constraint and a data type constrint.
            // easy then to create the field with this information.

            //  find out if there is an existing field (constraint).
            //  find out about existing indexes for that field, create one if needed
            //  find out about existing constraints, such as not_null
            //   perhaps not_null can be a value constraint - but it's something that translates readily into the database system.

            // this will be for setting single field indexes.

            // Other indexes could be defined with multiple fields.

            // Will be useful for iterating through a collection, getting the values that match two given values.

        }
        */

    }),

    'set_field_data_type_constraint': function(field_name, data_type_constructor) {
        // these dtcs are separate to the fields themselves.

        // May be better using the Field_Collection here.

        var fmc = this._map_field_constraints = this._map_field_constraints || {};
        var fmfc = fmc[field_name];
        if (fmfc) {
            var deletion_index;
            each(fmfc, function(i, v) {
                // if it is a Field_Data_Type_Constraint
                if (v instanceof Constraint.Field_Data_Type) {
                    //return v;
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

                // create the new constraint object.
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

        // this would also have to interact with the field object if necessary, keeping things in sync.

        // will have different field_constraint maps.
        // or a map of the fields to the constriaint types.
        //


        // (fc_map[field_name]['unique'])
        // fc_map[field_name]['data_type']
        // fc_map[field_name]['not_null']



        //  ensures a single constraint?
        // [s,s] can parse the field text

        if (sig == '[s,o]') {
            var field_name = a[0];
            var field_info = a[1];

            // Different constraints that can apply to the field... but likely to be a data_type constraint really.



            // can ensure not null and data type

            // OK... looks like the field_constraints will need to be organized somehow.
            //  They are another thing that perhaps a simple indexing system would help with.
            // Will be organizing them using the native JavaScript objects.

            // Having an array of field_constraints makes sense, so that the order is maintained.

            // array of field constraints.
            // map of field constraints.

            //this._arr_field_constraints = this._arr_field_constraints || [];

            //  not so sure about this array of constraints again.
            //  perhaps only keeping them in the map is enough.

            // field constraints_by_field
            // _map_field_constraints... this will hold the constraints by field.
            //  there may not be more than one constraint for a particular field, there may be a map of such constraints.

            // so it's organized by field here... easier to get the existing field constraints, overwrite them, or create a new one,
            //  or to look it up.

            //console.log('field_info ' + stringify(field_info));
            //console.log('a ' + stringify(a));

            // Will _map_field_constraints be in the Field_Collection?

            this._map_field_constraints = this._map_field_constraints || {};
            this._map_field_constraints[field_name] = this._map_field_constraints[field_name] || [];
            // don't want an array of constraints there...
            //  there are not many constraints that can be there, such as data_type, not_null

            // The constraints only apply to fields individually
            //  There can be collection constraints that apply, they can be specified, and they get applied to the relevant collection.




            var fc_item_arr = this._map_field_constraints[field_name];
            // Have the fields referencing their constraints.
            //  Also have a map / sorted KVS of constraints by the fields they are for, different ways they need to be looked up
            //   alhabetically sorted list of unique fields kept in a KVS
            //    no such thing as a unique index - only unique constraint.
            //   a single field can be unique (have a unique constraint)
            //   a unique constraint can apply to multiple fields.

            // map of fields objects by name
            //  as well as array of fields
            //   the Fields object - perhaps it should be defined as its own class.
            //    It would make sense.
            // A unique constraint does not really apply to the field, but more to the collection, with reference to the field.
            //  It's still information that should get stored alongside the field.


            // looking for an existing constraint already.
            //  the whole sytem can be improved.
            // I think having an actual ._fields object would help.
            //  It would be an array (or simpler collection?)
            //   A simple collection could be quite nice if it has B+ indexing capability.
            //    But the whole thing has got a bit complicated anyway with Data_Object.
            // Just an array would do fine for the moment.
            //  Want to be sure of maintaining the order.
            //   _map_fields goes to the field by name.

            // The field will reference both indexes and constraints.
            //  Indexes and constraints will refer to particular fields, often by name.

            // Don't want complicated data types to do with fields.
            //  There is a _fields object.
            //  _arr_fields
            //  kvs_fields? it stores the fields by name in a kvs. also for multi-field constraints and indexes?

            // Doing the individual fields, and also the multiple fields when they are applied together.





            // That is a fairly major change for the data_object.
            //  Will not have the constraint map just as it is.
            //  There will be the index for multi-field constraints, but just a simple array for the fields.
            //  _map_field_constraints[field1_name][field2_name][array of constraints applying to that field combination]

            // I think the B+ KVS will be better for storing the constraints by their fields.
            //



            var dt_info = field_info.data_type;

            var new_dt_constraint = Constraint.from_obj(dt_info);
            //console.log('new_dt_constraint ' + stringify(new_dt_constraint));

            if (!is_defined(new_dt_constraint)) {
                //throw '9) New constraint from_obj not profucing constraint';
            } else {



                var dt_constraint;
                //console.log('fc_item_arr ' + stringify(fc_item_arr));
                if (fc_item_arr.length > 0) {
                    // go through the array updating relevant constraints.
                    // really looking for the data_type constraint.

                    var dt_constraints = [];
                    //console.log('fc_item_arr ' + stringify(fc_item_arr));
                    // should only be one in there at maximum
                    each(fc_item_arr, function(i, constraint_item) {
                        //console.log('constraint_item ' + stringify(constraint_item));

                        if (constraint_item instanceof Constraint.Field_Data_Type) {
                            //console.log('constraint_item ' + stringify(constraint_item));

                            var constraint_info = constraint_item.to_info_obj();
                            //console.log('constraint_info ' + stringify(constraint_info));
                            //console.log('field_info ' + stringify(field_info));

                            var stack = new Error().stack
                            //console.log( stack )

                            throw ('6) it is! stop, check to see if it is a Field_Data_Type_Constraint, use instanceOf')


                        }



                        // I think delete any existing dt constraints?
                        //  Do nothing if the constraints match...
                        //  Will likely have events to do with adding and removing constraints.




                    })

                    // check existing constraint against values given. possibly change it, possibly replace it.




                } else {

                    fc_item_arr.push(new_dt_constraint);
                }



            }

            //throw('7) stop');



            // if there is nothing there, create it.

            // if it's there, overwrite any constraints with the relevant one from the field info we were given.



            //console.log('this._arr_field_constraints ' + stringify(this._arr_field_constraints));
            //throw('5 stop');
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

            // Will be faster to break out of each loop.

            return all_match;
        }



        if (sig == '[o]') {
            return data_object_matches_field_constraints(this, a[0]);

        }


    }),

    '____requires': fp(function(a, spec) {

        // Leaving this for the moment, developing field constraints.


        // sets items in this object's schema
        //  this could set items in an item-level rather than class-level schema.
        //   there could be two schemas - the one it starts with, and those that override the default schema.
        //   That avoids copying lots of the default schema items, making controls start more quickly and will use less memory.
        //    Less reduntant information being stored.

        // base_schema (this could be set by a string name, referring to jsgui.schemas).
        // overrides_schema (object_schema may be a better name).

        // 'requires' would be setting something on the overrides_schema (or object_schema)

        // object_schema
        // object_type_schema
        // object_base_schema
        // object_schema_additions

        // base_schema
        // schema_additions
        // additional_schema
        // object_schema

        // base_schema
        // object_schema

        // types will be namespaced more
        //  there is the type system of the JavaScript code here
        //  there is an internal type system for arbitrary namespaced objects... they will follow the names of objects here.

        //



        // schemas applied to properties
        //  done so that the checking stage can see that requirments are met.

        // It may be worth putting this in a 'schema' for the object, rather than at this stage.

        // Setting schemas for sub-objects, and setting schemas for the objects themselves makes a lot of sense.
        //  Perhaps the schemas for the sub-objects should be set through the schema for the object itself.

        // this, I think, will be setting a particular item on the object_schema.
        // the object_schema could simple be a data_type_name.
        //  this will tie into jsgui.data_type_name
        // Likely to make the nested system clearer and more compact, and incorporate it into the main part.
        //  I think I'll get things running in a fairly compact way that would enable things to run really well on a mobile device.
        //   Could have significantly advanced programming around the 12KB mark, would have things really optimized, but it needs to get a bit complicated in
        //   order to implement such functionality. A lot can be done in that relatively small size, and more still can be done using that code for the mobile application.

        // Putting the requirement information into the object_schema makes sense
        //  May be similar to using a data_type_name?
        //   or schema_name?

        // schema_name may make more sense.
        // possibly also have a group / collection of schemas.
        //  not sure about collection because these schemas will be used for implementing things to do with the collection.
        //  could have an application-wide dictionary of schemas.
        //  some of these will have to do with HTML, for example.

        // It makes sense to use a schema system in various places where it is appropriate, and call it a schema.
        //  Should be compatable where possible with the object definitions and access, such as indexed_array
        //  Called the jsgui-schema standard I think.
        // I may make some separate components that work using this standard. They could be reference implementations of some things.
        //  Checking that an object's properties conform to the schema
        //   Should make it possible to easily get the schema tester to know how the object's properties are done, such as on Data_Object using get and set
        //   functions.

        // Will also be able to say something requires an object with a particular interface.
        //  Data_Objects will have an 'interfaces' property (private property)
        //   this will help them tell whether the object that is connected has the right interface(s)

        // Objects can have more than one interface.
        //  This is akin to c#. In this case, we don't care about how inheritance is done on the object (it can be done in different ways to c#), but we are saying that the object
        //  conforms to a particulat interface, ie has various properities.
        //   In some cases those properties must be set.

        // Will also be able to specify functions in interfaces (and object_schemas I think), so that it can be run through tests.

        // Interfaces: an interface is a named conformance to either a specified or named schema.

        // jsgui.data_types -> jsgui.schemas

        // These schemas will be usable in form validation, creating HTML forms, processing them, and dealing with objects in databases, perhaps with generated CRUD.
        //  They will be simple to specify.
        //  There will sometime be a GUI tool for specifying schemas.
        //   They won't be too complicated - but they could be used for describing some real-work objects.



        // tell it what to look for with that property.

        // There may be some more complicated cases.
        //  Could be referring to multiple required objects for one property name.
        //  They could be in a collection, or an array.

        // can add an object to the requirements.
        //  checks that the item is there?

        // checks that the item conforms.
        //  possibly to an object_schema.
        // the object_schema system could be used for data types elsewhere - not sure about this. It sounds OK though.

        // elsewhere, whe check if an object conforms to a set type.

        // maybe object_schema should be the same system, or the other system could change over to using an object_schema, to make things clearer.
        //  I think the object_schema abstraction would help a bit.

        // will be making use of jsgui.data_types_info

        // string and an object
        //  the string is the name of the property within this object
        //  the object is the schema for that property.



        // Requirements will be sealt with through the constraints system.
        //  Perhaps it is an assumption that it is required the constraints are satisfied.

        //  A requirements system may operate for resources... not so sure about having requirements in the Data_Object as that seems like it can be
        //   handled by fields and constraints.


        if (a.l == 0) {
            // return the requirements.

            return this._requirements;

        }



    }),

    '_____meets_requirements': fp(function(a, sig) {

        // Possibly check field constraints, but these would have probably been checked on input or on setting the constraints.

        var requirements = this._requirements;
        if (!requirements) {
            return true;
        } else {
            if (sig == '[s]') {
                var property_name = a[0];

                // does it meet that one requirement?

                // not sure exactly how requirements are expressed right now.
                //  I think many of those things should be written up in documentation on the system and published.

                // 'name': ['regex', rx]

                // could check for different data types as well
                //  could check that something has a particular status, either function result or its own object.


                // How much of this is in 'nested'?
                //  How much of nested should be brought to the core?

            }
        }

    }),

    'each': function(callback) {
        // could use for i in...


        /*
        each(this._, function(i, v) {
            callback(i, v);
        });
        */

        // Could have inline code here for speed?
        each(this._, callback);


    },

    'position_within': function(parent) {
        var p_id = parent._id();
        //console.log('p_id ' + p_id);
        //console.log('this._parents ' + stringify(this._parents));

        if (this._parents && is_defined(this._parents[p_id])) {
            var parent_rel_info = this._parents[p_id];
            //console.log('parent_rel_info ' + stringify(parent_rel_info));

            //var parents = this._parents;
            //if (parents) {
            //
            //}
            var pos_within = parent_rel_info[1];

            // It is indexed by position in parent through the parent.

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
                            // it looks like it has gone wrong.
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
                                    console.log('Ordered_String_List field_name', field_name);
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
                                            //dVal.parent(this);
                                            //value.set(field_val);
                                            this._[field_name] = dVal;
                                            return this._[field_name];
                                        }
                                        //if (data_type_name == '')
                                    } else {
                                        var dtoc = this.mod_link().ensure_data_type_data_object_constructor(field_type_name);
                                        //console.log('dtoc ' + dtoc);
                                        // then use this to construct the empty field.

                                        //throw '!!stop';

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
                                //console.log('dtoc ' + dtoc);
                                //throw '!stop';
                                // then use this to construct the empty field.
                                //  without the new constructor it was trying to make an abstract version!!!
                                var obj = new dtoc({'context': this._context});
                                //if (this._context) obj._context = this._context;
                                obj.parent(this);

                                this._[field_name] = obj;
                                //console.log('this._ ' + stringify(this._));

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

        //this._super();

        /*

        var sc = this._superclass;
        console.log('sc ' + sc);



        console.log('this._fields ' + stringify(this._fields));

        if (con) {
            var con_fields = con._fields;
            console.log('con_fields ' + stringify(con_fields));

            var con_super = con._superclass;
            console.log('con_super ' + stringify(con_super));

            var con_pro = con.prototype;
            console.log('con_pro ' + stringify(con_pro));

            var con_pro_super = con.prototype._superclass;
            console.log('con_pro_super ' + stringify(con_pro_super));

            var con_pro_fields = con_pro._fields;
            console.log('con_pro_fields ' + stringify(con_pro_fields));


        }


        var pro = this.prototype;
        console.log('pro ' + pro);

        if (pro) {
            var pro_fields = pro._fields;
            //var con_pro = con.prototype;
            console.log('pro_fields ' + stringify(pro_fields));


            var pro_super = pro._super;
            console.log('pro_super ' + stringify(pro_super));


        }
        */
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
                    if (data_object_next) {
                        var field = this.field(property_name);
                        if (field) {
                            data_object_next.__type_name = field[1];
                        }
                        data_object_next.set(value);
                    }

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
                        var next_is_js_native = is_js_native(data_object_next);

                        if (next_is_js_native) {
                            this._[property_name] = value;
                            res = value;
                        } else {
                            res = data_object_next
                            this._[property_name] = data_object_next;
                        }

                        if (!silent) {
                            var e_change = {
                                'name': property_name,
                                'value': data_object_next.value()
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
            var value = a[0];

            var input_processor = input_processors[this.__type_name];

            if (input_processor) {

                var processed_input = input_processor(value);
                value = processed_input;
                this._[property_name] = value;
                this.raise_event('change', {
                    'value': value
                });
                return value;
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

    'has' : function(property_name) {
        return is_defined(this.get(property_name));
    }
});

var initializing = false, fnTest = /xyz/.test(function() {
    xyz;
}) ? /\b_super\b/ : /.*/;


var get_fields_chain = function(data_object_class) {
    var res = [];
    var inner = function(data_object_class) {
        // _fields... fields will be given as an array by default, to preserve the order.

        var fields = data_object_class._fields;


        //console.log('get_fields_chain fields ' + stringify(fields));
        if (fields) {
            res.push(fields);
        }
        // Could be pushing an array containing an array that represents one field.

        var sc = data_object_class._superclass;
        //console.log('sc ' + sc);
        //if (sc) console.log('sc.constructor._fields ' + stringify(sc.constructor._fields));
        if (sc) {
            inner(sc);
        }
    };
    inner(data_object_class);
    //console.log('get_fields_chain res ' + stringify(res));
    return res;
}

var get_chained_fields = function(data_object_class) {
    // would be nice to do this in a way that preserves the order.
    //  an array of fields may be better.

    // The fields chain... need to make sure that is getting the separate fields.
    var fc = get_fields_chain(data_object_class);



    var i = fc.length; //or 10

    //var res = {};
    var res = [];

    // Not so sure about doing this... is it breaking up a field into more than one field when it should not be?


    while(i--)
    {
      //...
        var item = fc[i];

        // the item can be an object... or an array. Array is better.

        //each(item, function(i2, v) {
        //	res[i2] = v;
        //});

        // [field_name, field_info]

        // Not so sure about including the number?
        //  Is it necessary?
        // Maybe it can be ignored at a later stage.
        //  However, do want it to properly interpret the fields at a later stage.

        var c = 0;

        //console.log('item', item);
        // item is either an object or an array.

        each(item, function(i2, field_info) {

            //console.log('');
            //console.log('i2 ' + i2);

            if (tof(i2) == 'string') {
                c = c + 1;
                res.push([c, [i2, field_info]]);
            } else {
                res.push([i2, field_info]);
                c = i2;
            }

            //console.log('field_info ' + stringify(field_info));

            //res[i2] = v;
            // field_info could just be the field_name and some text. that should be fine.

        });

    }
    // not sure that all fields will have simple types.
    //  some will be constructors even.
    // Fields should have been set correctly, not like get_chained_fields res [[0, "indexed_array"], [1, [["red", "number"], ["green", "number"], ["blue", "number"]]]]
    //console.log('get_chained_fields res ' + stringify(res));
    return res;
}

var chained_fields_to_fields_list = function(chained_fields) {


    /*
    var res = [];
    each(chained_fields, function(i, v) {
        var field_number = v[0];
        var field = v[1];
        res.push(field);
    });
    */

    //console.log('chained_fields ' + stringify(chained_fields));

    var l = chained_fields.length;
    //console.log('l ' + l);
    var res = new Array(l);
    //var res_push = res.push;
    for (var c = 0; c < l; c++) {
        //res_push.call(res, chained_fields[c][1]);
        //res.push(chained_fields[c][1]);
        res[c] = chained_fields[c][1];
    };


    return res;
};

jsgui.map_classes = {};

Data_Object.extend = function(prop, post_init) {
    var _super = this.prototype;
    initializing = true;
    var prototype = new this();

    // copying accross some old things?
    //  keeping some things in the prototype chain?
    var for_class = {};

    initializing = false;

    if (typeof prop === 'string') {
        // giving it a data_type from the jsgui.data_types_info
        var data_type_name = prop;
        var dtis = jsgui.data_types_info;
        //console.log('dtis ' + stringify(dtis));
        //return dtis;
        var data_type_info = dtis[data_type_name];
        //console.log('data_type_name ' + stringify(data_type_name));
        //console.log('data_type_info ' + stringify(data_type_info));
        for_class[data_type_name] = data_type_name;
        for_class[data_type_info] = data_type_info;
        // then it will be read from the class object itself.
        //  will be able to get the constructor object, I think.
        // maybe not best to do this through the prototype?
        //  having difficulty getting the constructor, within the constructor function.
        prototype['__type_name'] = data_type_name;
        prototype['__data_type_info'] = data_type_info;

        prop = {};

        // then this effectively sets its fields.
        //  create the fields, in order, and have a numeric index saying which field is which.
        //  will have an _operating_mode.
        //  the data_object will be able to operate as an indexed_array... but not sure about making a collection and giving it named items?
        //   collection already takes named items.

        // Will also need to deal with collections of objects here.
        //  Will be very nice when the HTML code is very declarative.

        // Data_Type_Instance? Or the constructor to the relevant Data_Object functions as its instance?
        //  It's not exactly an instance, it's a constructor, but constructors can have their own methods too.

        // Then this is the data_type_instance, effectively.

        // so it will hold the data type info within the constructor?
        //  or named reference to it is fine.

        //throw('*1 stop');
    }
    var prop_item, t_prop_item, tmp, name, res;

    var keys = Object.keys(prop);
    //var key;
    for (var c = 0, l = keys.length; c < l; c++) {
      name = keys[c];
      prop_item = prop[name];

      if (name.charAt(0) === '#') {

          // direct copy with '#'... not been using that.

          prototype[name.substring(1)] = prototype[prop_item];
      } else {
          // if it's a function, then do the following.

          // if it's an object, then it may be something specific to the DataObject type.
          //  such as setting / extending fields of an object.

          // some specific non-object things will be set to the prototype.
          //  it will be possible to look at this info, the fields chain in the object, will take a bit of trial, error and design.

          t_prop_item = typeof prop_item;
          //console.log('prop_item' + prop_item);
          if (t_prop_item === 'function') {

              prototype[name] = typeof _super[name] === 'function' && fnTest.test(prop_item) ?
              // had some difficulty using fp() with 'init' functions. could
              // it have to do with function names?

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

    //for (name in prop) {


    //};

    // Looks like this needs to be changed just to be local...

    var Class = function() {

        //console.log('Data_Object initializing ' + initializing);
        //console.log('Data_Object !!this.init ' + !!this.init);

        if (!initializing) {
            if (this.init) {
                this.init.apply(this, arguments);
                if (this.post_init) {
                    //this.post_init();
                    this.post_init.apply(this, arguments);
                }

                //if (post_init) {
                //    post_init.call(this);
                //}
                // Check to see if there are further functions to call...
                //  things that have got put into the extend function?



            } else {
                var spec = arguments[0] || {};
                spec.abstract = true;
                //var newClass = new Class(spec);

                //return newClass;
                return new Class(spec);
            }
        }

    };
    Class.prototype = prototype;
    //Class.constructor = Class;
    Class.prototype.constructor = Class;
    // but constructor loses info. not sure how to get back at the constructor from an object?
    //  what is the original constructor even?

    Class.extend = arguments.callee;

    /*
    if (for_class) {
        for (var c = 0, l = for_class.length; c < l; c++) {
            Class[i] = for_class[v];
        }
    }
    */
    //console.log('for_class', for_class);
    for (i in for_class) {
        Class[i] = for_class[i];
    }


    //each(for_class, function(i, v) {
    //	Class[i] = v;
    //});

    // jsgui.map_classes[]

    if (Class['class_name']) {
        jsgui.map_classes[Class['class_name']] = Class;
    }

    //console.log('_superprototype ' + _super.prototype);

    //Class.prototype._superclass = _super;

    Class._superclass = this;

    //Class._superprototype = _super;


    // * if (namespcExtension) { each(namespcExtension, function(i, n) {
    // * Class[i] = n; }); }; if (propsToMerge) { each(propsToMerge,
    // * function(i, n) { if (typeof Class.prototype[i] === 'undefined') {
    // * Class.prototype[i] = n; } else { $.extend(true, Class.prototype[i],
    /// * n); }; }); }


    return Class;
};


// Will have actual Constraint programming objects.
//  They may translate to the database level as well.
//  In many cases the constraints will be expressed as strings such as 'text(32)'.
//   Would then be translated to varchar(32) on a different level.



var data_object_matches_field_constraints = function(data_object, field_constraints) {
    // Field constraints given as a normal object.

    // returns true or false
    //  though could return failure information as well if asked for it.
    //  making it into another polymorphic function.

    each(field_constraints, function(fc_name, fc_value) {
        //console.log('fc_name ' + fc_name);
        //console.log('fc_value ' + fc_value);

    });
};
// That data object will be indexable.

var Enhanced_Data_Object = null;

var set_Enhanced_Data_Object = function (EDO) {
    Enhanced_Data_Object = EDO;
};

var get_Enhanced_Data_Object = function () {
    return Enhanced_Data_Object;
};


// seems like an overlap with the new jsgui.fromObject function.
//  That will initially go in the Enhanced_Data_Object module, or jsgui-enh

var dobj = function(obj, data_def) {
    // could take a data_def?
    // Could use the enhanced data object if we patch backwards?
    //  So Enhanced_Data_Object could hopefully patch backwards in the code?

    //var tdd = tof(data_def);

    var cstr = Data_Object;
    if (Enhanced_Data_Object) cstr = Enhanced_Data_Object;
    //console.log('Enhanced_Data_Object ' + Enhanced_Data_Object);

    var res;
    if (data_def) {
        res = new cstr({'data_def': data_def});
    } else {
        res = new cstr({});
    }

    var tobj = tof(obj);

    //console.log('obj ' + stringify(obj));
    if (tobj == 'object') {
        var res_set = res.set;
        each(obj, function(i, v) {
            //res.set(i, v);
            res_set.call(res, i, v);
        });
    }

    return res;
};


// This code could be done using other means in other parts of the system.
//  The framework code will provide more to do with data type definitions and interpreting input data.

// this seems like part of an input processor.
//  changes from text to the JavaScript objects that get understood.


// parsing a data type
// similar to parsing a JavaScript function call, but only one ting in the brackets, and there may not be brackets anyway


var parse_field_text = Fields_Collection.parse_field_text;
var parse_data_type = Fields_Collection.parse_data_type;
// We can't extend this further down while using requirejs
//  Not sure how to achieve this now, requirejs was meant to be for convenience.

// Can have some sort of function chaining.
//  And having a function within the right module called...
//  That could be a 'linking function.'
// mod_link.

// A new constructor for these?
//  Curried functions?
//  Or Boolean_DV... Would have tests possibly.

jsgui.map_data_type_data_object_constructors = jsgui.map_data_type_data_object_constructors || {};
jsgui.map_data_type_data_object_constructors['boolean'] = Data_Value;




// Could do something like pass the ensure_data_type_data_object_constructor function around?
//  Or the HTML module will have its own way of making object constructors.

// I think only having object constructor functions going down the module loading heirachy will work.
//  May have a map of various loading functions that get made in each module.

// They are basically constructor functions.

// But this could have access or need access to more information about how to construct objects.
//  Want to get this working for 'color'.
var ensure_data_type_data_object_constructor = function(data_type_name) {

    //console.log('');
    //console.log('');
    //console.log('jsgui.map_data_type_data_object_constructors[data_type_name] ' + stringify(jsgui.map_data_type_data_object_constructors[data_type_name]));
    //console.log('');
    //console.log('');

    // Hardet to bring that map through all dependencies and back.
    //  However, need to have access to that map variable.

    //console.log('jsgui.map_data_type_data_object_constructors ' + jsgui.map_data_type_data_object_constructors);

    if (!jsgui.map_data_type_data_object_constructors[data_type_name]) {
        //console.log('creating new Data_Object constructor for data_type: ' + data_type_name)

        // Need to get the variable back through the modules...
        //  Missing global variables?
        //  Move this function somewhere else?
        //  Maybe we could have some storage available in jsgui-lang-essentials through a closure.
        //  That way the code could be sent back... but do we still have different instances running?

        // Could just be different execution contexts... co can't feed back this information about other objects.
        //  But can feed functionality forards.

        // May need to have things more independant.
        //

        //var dti = jsgui.get('dti');
        //console.log('dti ' + dti);
        //throw 'stop';

        var dto = jsgui.data_types_info[data_type_name];

        //console.log('dto ' + stringify(dto));

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

// Maybe do without the following.
//  Have different, simpler, flatter namespacing. Put lots of things in jsgui.
//  Then when the files get built together they get turned into local variables.

//Data_Object.Data_Value = Data_Value;



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

//return Data_Object;
module.exports = Data_Object;
//})
