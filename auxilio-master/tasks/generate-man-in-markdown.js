'use strict';

var fs = require("fs");

module.exports = function(grunt) {
    grunt.registerMultiTask('generate-man-in-markdown', 'generate markdownfile', function() {
        
        var tmp = grunt.file.read(this.data.src, {}),
    	   content = '',
           self = this;

    	content = "var Absurd = (function(w) {\n";

        if(fs.existsSync(__dirname + "/../client-side/lib")) {
			var libs = fs.readdirSync(__dirname + "/../client-side/lib");
			for(var i=0; i<libs.length; i++) {
				var fileContent = fs.readFileSync(__dirname + "/../client-side/lib/" + libs[i], {encoding: 'utf8'});
				content += fileContent + "\n";
			}
		}

        content += tmp;
        content += ';\nreturn client();\n';
        content += '})(window);';

        getVersion(function(version) {
            grunt.file.write(self.data.dest, "/* version: "  + version +  " */\n" + content, {});
        });        

    });
};