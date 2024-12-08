// file: prepend-mixin-loader.js
const fs
	= require('fs');
const path
	= require('path');

const mixinContent
	= fs.readFileSync(
		path.resolve(__dirname, './mixin.pug'),
		'utf8'
	);

module.exports
	= function( source ) {
		this.cacheable && this.cacheable();
		return mixinContent + '\n' + source;
	};
