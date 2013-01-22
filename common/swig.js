var helpers = require('swig/lib/helpers');

/*
 * {% spaceless %}
 * Removes all whitespace from source code output
 */ 
/*
exports.spaceless = function (indent, parser) {
	
	var _output = '';
	
	eval(parser.compile.call(this, indent));
	
	_output = _output.replace(/\n/g, "")
		.replace(/\s+/g, " ")
		.replace(/[\t ]+\</g, "<")
		.replace(/\>[\t ]+\</g, "><")
		.replace(/\>[\t ]+$/g, ">")
		.replace(/\"/g,'\\\"');
	
	return '_output += "'+_output+'";';
	
};

exports.spaceless.ends = true;
*/


/*
 * {{ path route params }}
 * Renders the path of a named route
 */ 
exports.path = function (indent, parser) {
	
	var myArg = parser.parseVariable(this.args[0]),
	    output = [];
	
    output.push(helpers.setVar('__myArg', myArg));

    output.push('_output += _ext.path.render(__myArg);');

    return output.join('');
	
};
