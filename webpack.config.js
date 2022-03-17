const path = require('path');
const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const dotenv = require('dotenv');

const htmlPlugin = new HtmlWebPackPlugin({
	template: './src/index.html',
	filename: './index.html',
});

let environment = dotenv.config().parsed;
environment = { ...(environment ? environment : {}), ...process.env };
const envPlugin = new webpack.DefinePlugin(
	Object.keys(environment).reduce((prev, next) => {
		prev[`process.env.${next}`] = JSON.stringify(environment[next]);
		return prev;
	}, {}),
);
module.exports = {
	module: {
		rules: [
			{
				test: /\.[jt]sx?$/,
				exclude: [/node_modules/, /.*\.d\.ts/],
				use: {
					loader: 'babel-loader',
				},
			},
			{
				test: /\.d\.ts$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.sass$/i,
				use: [
					'style-loader',
					{
						loader: 'css-loader',
						options: {
							modules: true,
						},
					},
					'postcss-loader',
					'sass-loader',
					{
						loader: 'sass-resources-loader',
						options: {
							resources: [
								path.resolve(
									__dirname,
									'assets',
									'styles',
									'global.sass',
								),
							],
						},
					},
				],
			},
		],
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.jsx', '.styles', '.sass', '.css'],
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	devServer: {
		open: true,
		hot: true,
	},
	entry: './src/index.tsx',
	mode: 'development',
	plugins: [
		htmlPlugin,
		envPlugin,
		new webpack.ProvidePlugin({
			Buffer: ['buffer', 'Buffer'],
		}),
	],
};
