const path = require('path');

module.exports = {
	module: {
		rules: [
			{
				test: /\.pug$/,
				use: [
					{
						loader: '@webdiscus/pug-loader',
						options: {
							method: 'render',
							doctype: 'html',
							plugins: [require('pug-plugin-ng')],

						}
					},
					{
						loader: path.resolve(__dirname, './prepend-mixin-loader.js')
					}
				]
			},
			{
				test: /\.(png|jpg|jpeg)/,
				type: 'asset/resource',
			},
		],
	},
};
