"use strict";

// Global variables, categorized by place of definition.
var globals =
    // Third-party libraries
      ' $ jQuery Spinner Handlebars XDate'

    // index.html
    + ' initial_pointer email class_list people_list have_initial_messages'

    // compose.js
    + ' show_compose hide_compose toggle_compose compose_button'
    + ' compose_class_name validate_message'
    + ' status_classes'

    // dom_access.js
    + ' get_first_visible get_last_visible get_next_visible get_prev_visible'
    + ' get_id get_zephyr_row'

    // hotkey.js
    + ' set_keydown_in_input'

    // narrow.js
    + ' narrowed show_all_messages'
    + ' narrow_all_personals narrow_by_recipient narrow_instance'

    // setup.js
    + ' loading_spinner templates'

    // subscribe.js
    + ' fetch_subs sub_from_home'

    // ui.js
    + ' register_huddle_onclick register_onclick hide_email show_email'
    + ' report_error clicking mouse_moved'
    + ' update_autocomplete autocomplete_needs_update'

    // zephyr.js
    + ' zephyr_array zephyr_dict'
    + ' status_classes clear_table add_to_table instance_list'
    + ' keep_pointer_in_view prepare_huddle respond_to_zephyr'
    + ' select_zephyr select_zephyr_by_id'
    + ' scroll_to_selected select_and_show_by_id'
    + ' selected_zephyr selected_zephyr_id'

    ;


var jslint_options = {
    browser:  true,  // Assume browser environment
    vars:     true,  // Allow multiple 'var' per function
    sloppy:   true,  // Don't require "use strict"
    white:    true,  // Lenient whitespace rules
    plusplus: true,  // Allow increment/decrement operators
    regexp:   true,  // Allow . and [^...] in regular expressions
    todo:     true,  // Allow "TODO" comments.

    predef: globals.split(/\s+/)
};


// For each error.raw message, we can return 'true' to ignore
// the error.
var exceptions = {
    "Expected '{a}' and instead saw '{b}'." : function (error) {
        // We allow single-statement 'if' with no brace.
        // This exception might be overly broad but oh well.
        return (error.a === '{');
    },

    "Unexpected 'else' after 'return'." : function () {
        return true;
    }
};


var fs     = require('fs');
var path   = require('path');
var JSLINT = require(path.join(__dirname, 'jslint')).JSLINT;

var cwd    = process.cwd();
var js_dir = fs.realpathSync(path.join(__dirname, '../../zephyr/static/js'));

var exit_code = 0;

fs.readdirSync(js_dir).forEach(function (filename) {
    if (filename.slice('-3') !== '.js')
        return;

    var filepath = path.join(js_dir, filename);
    var contents = fs.readFileSync(filepath, 'utf8');
    var messages = [];

    if (!JSLINT(contents, jslint_options)) {
        JSLINT.errors.forEach(function (error) {
            if (error === null) {
                // JSLint stopping error
                messages.push('          (JSLint giving up)');
                return;
            }

            var exn = exceptions[error.raw];
            if (exn && exn(error)) {
                // Ignore this error.
                return;
            }

            // NB: this will break on a 10,000 line file
            var line = ('    ' + error.line).slice(-4);

            messages.push('    ' + line + '  ' + error.reason);
        });

        if (messages.length > 0) {
            exit_code = 1;

            console.log(path.relative(cwd, filepath));

            // Something very wacky happens if we do
            // .forEach(console.log) directly.
            messages.forEach(function (msg) {
                console.log(msg);
            });

            console.log('');
        }
    }
});

process.exit(exit_code);
