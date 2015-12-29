/*

 if (typeof define !== 'function') {
 var define = require('amdefine')(module);
 }

 define(["./jsgui-lang-util", "./data-object-fields-collection"], function(jsgui, Fields_Collection) {
 */

var jsgui = require('./jsgui-lang-util');
var Data_Value = require('./data-value');
var Data_Object = require('./data-object');
var Fields_Collection = require('./data-object-fields-collection');

var Data_Object = jsgui.Data_Object;
var Collection = jsgui.Collection;
var get_a_sig = jsgui.get_a_sig;
var fp = jsgui.fp;
var stringify = jsgui.stringify;
// Using actual JavaScript objects like String should be quite good.
//  JavaScript Primitive Contructors.

var is_defined = jsgui.is_defined, ll_get = jsgui.ll_get, get_item_sig = jsgui.get_item_sig;
var tof = jsgui.tof;

// Having a Collection of strings here...
//  May need to choose the right collection context.
//  Don't want to have to deal with these contexts all the time though.
//   Or make it very fast to do so.

// A function to ensure the latest data types?

// Module level functions to register / syncronise things...
//  That makes a lot of sense.

var map_data_type_data_object_constructors = jsgui.map_data_type_data_object_constructors;

var register_data_type = function(data_type_name, def) {
    jsgui.data_types_info[data_type_name] = def;
}

var ensure_data_type_data_object_constructor = function(data_type_name) {

    // Want to use Data_Value objects for a variety of fields.



    //console.log('ENH ensure_data_type_data_object_constructor');
    //console.log('data_type_name ' + data_type_name);

    if (!jsgui.map_data_type_data_object_constructors[data_type_name]) {

        // Can we get it from the most up-to-date module?
        //  Or even make use of a global variable?
        //  JSGUI?




        var dto = jsgui.data_types_info[data_type_name];
        //console.log('dto ' + stringify(dto));

        // Do we need to be accessing the latest data here?
        //  Can we patch the required component backwards?



        var dtc = Enhanced_Data_Object.extend({
            'fields': dto
        })
        jsgui.map_data_type_data_object_constructors[data_type_name] = dtc;
    }
    return jsgui.map_data_type_data_object_constructors[data_type_name];
}
// Maybe the Enhanced_Data_Object will have access to Collection?
var dop = Data_Object.prototype;
var do_init = dop.init;
var do_get = dop.get;

// And making it a collection will give it good enough indexing anyway.
var Enhanced_Data_Object = Data_Object.extend({
    // Can we define a Collection like that?

    // the flags is a collection of strings... but we want to connect the flags.

    // But we can choose the context for the object.
    //  Will need to do that.

    // But maybe object could only have flags if they are used?
    //  Dormant fields?

    // Collection(String) being in the general context?
    //  It could be a special case, for abstract collections.
    //  Also, not using the 'new' keyword.

    'fields': [['flags', Collection(String)]],

    // Collection(String) may be hard to understand... Collection is a Class and is normally called with a constructor.
    //  It has not normally been declared with a native data type inside (or any data type) but it could be done and is convenient
    //   syntax. I think without the constructor, but with the object inside, it could be an abstract or representative object,
    //   and used so that we know Collection(String) is a collection of strings (probably implemented using Data_Value objects).

    // so will this flags field start up OK?
    //  that should be enough to get the flags field there.

    //'init': function(spec) {
    //	this._super(spec);
    //},

    /*

     'init': function(spec) {
     //this._super(spec);
     do_init.call(this, spec);
     // need to respond to flag fields being added and removed.
     //  when a flag gets added, there needs to be the flag's connected function.

     //.flags().selected?
     //.flags('selected');

     // .selected(true); .selected(1);

     // can leave the flags unconnected for the moment, and return to the flags connection so there is
     //  easier syntax and probably faster code.

     // but want it so we know when flags have changed (the collection of flags)?

     // also when any flags' value has changed.

     // can quite simply add and remove flags from an object.
     //  also may pay some attention to a restricted list of flags, where if the flags are not set then we know
     //  the values are false.

     // want to make it easy to deal with flags that correspond to css as well.

     },
     */
    // or an enhanced version of the set function that deals with more input processors?
    //  Or have the supercalssed set function send mack the input processors in parameters.
    //   I think that is the best option.

    '_get_input_processors': function() {
        //throw 'stop';
        return jsgui.input_processors;
    },
    'add_flag': function(flag_name) {
        var flags = this.get('flags');
        //console.log('flags ' + stringify(flags));
        var fields = this.fields();
        //console.log('fields ' + stringify(fields));
        // unfortunate that no fields are found???
        //  should probably be a few.
        if (!flags.has(flag_name)) {
            flags.add(flag_name);
        }
    },
    'remove_flag': function(flag_name) {
        var flags = this.get('flags');
        //console.log('flags ' + stringify(flags));
        //throw 'stop';
        var has_flag = flags.has(flag_name);
        //console.log('has_flag ' + has_flag);

        if (has_flag) {
            flags.remove(flag_name);
            console.log('flags ' + stringify(flags));

            flags = this.get('flags');
            console.log('flags ' + stringify(flags));
            //throw 'stop';
        }

    },
    'has_flag': function(flag_name) {
        var flags = this.get('flags');
        return flags.has(flag_name);
    },

    // copied from Data_Object because Data_Object was not able to deal with collections within itself.
    //  code works, but should make this call data_object code where possible.
    //

    // Candidate for optimization



    //'get': fp(function(a, sig) {
    'get': (function() {
        var a = arguments;
        a.l = arguments.length;
        var sig = get_a_sig(arguments, 1);

        if (sig === '[s]') {

            if (!this.fc) this.fc = new Fields_Collection({});
            var fc = this.fc;

            var field_name = a[0];

            var field = fc.get(field_name);

            var obj_fields = this.field();
            var obj_field = this.field(field_name);

            if (field_name.indexOf('.') > -1) {
                var arr_field_names = field_name.split('.');
                var level = 0, l = arr_field_names.length;
                var current_obj = this, new_obj, fname;
                while (level < l) {
                    fname = arr_field_names[level];
                    new_obj = current_obj.get(fname);
                    level++;
                    current_obj = new_obj;
                }
                return current_obj;
            } else if (field) {

                if (!this._[field_name]) {
                    var sig_field = get_item_sig(field, 20);

                    if (sig_field == '[s,[s,u]]') {
                        var stack = new Error().stack;
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
                            if (field_type_name == 'ordered_string_list') {
                                throw 'stop';
                                var osl = new Ordered_String_List();
                                return this._[field_name] = osl;
                            } else if (field_type_name == 'string') {
                                var dv = new Data_Value({
                                    'context': this._context
                                });
                                if (field_info.default) {
                                    dv.set(field_info.default);
                                }
                                dv.parent(this);
                                return this._[field_name] = dv;
                            } else {
                                var default_value = field_info.default;
                                var dtoc = ensure_data_type_data_object_constructor(field_type_name);
                                var context = this.context;
                                if (context) {
                                    var field_val = new dtoc({'context': this._context});
                                } else {
                                    var field_val = new dtoc();
                                }
                                field_val.__type_name = field_val.__type_name || field_type_name;
                                if (is_defined(default_value)) {
                                    field_val.set(default_value);
                                }
                                field_val.parent(this);
                                this._[field_name] = field_val;
                                return this._[field_name];
                            }
                        }
                    } else if (sig_field == '[s,s]') {
                        var field_name = field[0];
                        var field_type_name = field[1];
                        if (field_type_name === 'collection') {
                            var coll = new jsgui.Collection({
                                'context': this._context
                            });
                            coll.parent(this);
                            this._[field_name] = coll;
                            return this._[field_name];

                        } else if (field_type_name === 'control') {
                            return undefined;
                        } else if (field_type_name === 'string') {
                            var dv = new Data_Value();
                            dv.parent(this);
                            this._[field_name] = dv;
                        } else if (field_type_name === 'array') {
                            var dv = new Data_Value();
                            dv.parent(this);
                            this._[field_name] = dv;
                        } else {
                            var input_processors;
                            var data_type_info;
                            var module_jsgui = this._module_jsgui;
                            if (module_jsgui) {
                                input_processors = module_jsgui.input_processors;
                                data_types_info = module_jsgui.data_types_info;
                                object_constructor = module_jsgui.map_data_type_data_object_constructors[field_type_name];
                                if (object_constructor) {
                                    var obj = new object_constructor({'context': this._context});
                                    obj.parent(this);
                                    this._[field_name] = obj;
                                    return obj;
                                }
                            };
                        }
                        return this._[field_name];
                    } else if (sig_field === '[s,[s,s]]') {
                        var field_name = field[0];
                        var field_info = field[1];
                        if (field_info[0] === 'collection') {
                            var collection_type_name = field_info[1];
                            var ncoll = new jsgui.Collection({'context': this._context});
                            ncoll.parent(this);
                            this._[field_name] = ncoll;
                            return this._[field_name];
                        }
                    } else if (sig_field === '[s,[s,o]]') {
                        var field_name = field[0];
                        var field_info = field[1];
                        var data_type_name = field_info[0];
                        if (data_type_name === 'collection') {
                            var objDef = field_info[1];
                            var ncoll = new jsgui.Collection({'context': this._context});
                            ncoll.field(objDef);
                            if (this._context) ncoll._context = this._context;
                            ncoll.parent(this);
                            this._[field_name] = ncoll;
                            return this._[field_name];
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
                    }
                }
                return res;
            }
        } else if (a.l === 0) {
            return this._;
        }
    })


});

// Data_Object.extend = function(prop, namespcExtension, propsToMerge) {

Enhanced_Data_Object.extend = function(prop, namespcExtension, propsToMerge) {
    //var res = Data_Object.extend(prop, namespcExtension, propsToMerge);
    var res = Data_Object.extend.call(this, prop, namespcExtension, propsToMerge);
    // but the fields are not going in properly.???
    // quite possibly need to set up the fields (_fields on the Enhanced_Data_Object object.
    // but need to merge the properties from this...
    // but also need to look out for the flags.
    // if in the prop or map_props there is something called 'flags' we need to pay attention.
    //  That will then get put in the prototype (or constructor?)
    /*
     for (var name in prop) {

     }
     */
    if (prop.flags) {
        //res[
        res._flags = prop.flags;
    }
    return res;
}


jsgui.ensure_data_type_data_object_constructor = ensure_data_type_data_object_constructor;

Enhanced_Data_Object.map_data_type_data_object_constructors = Data_Object.map_data_type_data_object_constructors;
Enhanced_Data_Object.Mini_Context = Data_Object.Mini_Context;

Data_Object.set_Enhanced_Data_Object(Enhanced_Data_Object);

Enhanced_Data_Object.register_data_type = register_data_type;

module.exports = Enhanced_Data_Object;

//return Enhanced_Data_Object;
//});
