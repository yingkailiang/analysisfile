var ParserNode = function(){
	this.op;
	this.left;
	this.right;
}

var Parser = function(){
	
}

Parser.prototype.parse = function(str, print){
	return this._parse(str, 1, print)[0];
}
Parser.prototype._parse = function(str, depth, print){
	depth = depth || 1;
	var node = new ParserNode();
	var value = undefined;
	var ret = false;
	var newStr;
	var spacing = this._getTabs(depth);

	for(var i =0; i < str.length ; i++){
		var c = str.charAt(i);
		if(c == '('){
			newStr = str.substring(i + 1 , str.length);
			var val = this._parse(newStr, depth + 1);
			value = dojo.clone(val[0]);
			str = val[1];
			i = -1;
		} else if(c == ')' || i == str.length - 1){
			if(c != ")" && value && !(value instanceof Node)){
				value += c;
			}
			newStr = str.substring(i + 1 , str.length + 1);
			if(node.left){
				node.right = dojo.clone(value);
				ret = true;
			} else {
				node.left = dojo.clone(value);
			} 
			value = undefined;
		} else if(c =='\"'){
			value = value || "";
			i++;
		    c = str.charAt(i);

			for(++i; i < str.length && c != '\"'; i++){
				value += c;
				c = str.charAt(i);
			}

		} else if(c == 'A' && str.substring(i, i + 3) == 'AND'){
			if(node.left){
				node.right = dojo.clone(value);
				ret = true;
			} else {
				node.left = dojo.clone(value);
			} 
			value = undefined;
			node.op = 'AND';
			i = i + 2;
		} else if(c == 'O' && str.substring(i, i + 2) == 'OR'){
			if(node.left){
				node.right = dojo.clone(value);
				ret = true;
			} else {
				node.left = dojo.clone(value);
			}
			value = undefined;
			node.op = 'OR';
			i = i + 1;
		} else if(c != ' '){
			value = value || "";
			value += c;
		}

		if(ret){
			if(print) console.log(spacing,c, "RETURNED", "left:", node.left, "op:", node.op, "right:", node.right, str);
			if(node.left && !node.right){
				return [node.left, newStr];
			} else if(node.right && !node.left){
				return [node.right, newStr];
			} else {
				return [node, newStr];
			}
			
		} else {
			if(print) console.log(spacing,c, "left:", node.left,"op:", node.op, "right:", node.right);
		}
	}
	node.right = value;
	if(node.left && !node.right){
		return [node.left, newStr];
	} else if(node.right && !node.left){
		return [node.right, newStr];
	} else {
		return [node, newStr];
	}
}

Parser.prototype.printTree = function(tree, depth){
	depth = (depth === undefined) ? 0:depth;
	
	if(tree.right){
		this.printTree(tree.right, depth + 1) ;
	} 
	console.log(this._getTabs(depth) +( tree.op || tree));

	if(tree.left){
		this.printTree(tree.left, depth + 1);
	} 
}


Parser.prototype._getTabs = function(length){
	var s = "";
	for(var i = 0; i < length; i++){
		s += '\t'
	}
	return s;
}

Parser.prototype._test = function(){
	var qs = [
		'(((car AND truck) OR jim) AND (-tom OR bob)) AND plane'
		,"(((((((nik)))))) AND car )"
		,"nik"
		,"nik AND bob AND tom"
		,"\"nik AND jim\" AND motor"
		,'(social AND "real (OR) estate") '
	];
	
	for(var i in qs){
		var q = qs[i];
		console.log("'"+q+"'");
		var t = this.parse(q);
		this.printTree(t);
		console.log('\n');
	}
}