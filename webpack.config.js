import path from 'path';
import filterFileList from './tools';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';
import miniCssExtractPlugin from 'mini-css-extract-plugin';
import internalIp from 'internal-ip';
const targetList = [];
const entry = {};
const htmlPlugins = [];
filterFileList('./src', targetList);
entry['content'] = targetList.find(item => item.endsWith('content.ts'));
targetList
    .filter(item => item.endsWith('index.ts'))
    .forEach(p => {
        const regResult = /.+src\/(.+)\/index.ts$/.exec(p);
        if (regResult && regResult[1]) {
            entry[regResult[1]] = regResult[0];
        }
    });

targetList
    .filter(item => item.endsWith('index.html'))
    .forEach(tepmlate => {
        const regResult = /.+src\/(.+)\/index.html$/.exec(tepmlate);
        if (regResult && regResult[1]) {
            htmlPlugins.push(
                new HtmlWebpackPlugin({
                    template: tepmlate,
                    chunks: [regResult[1]],
                    filename: regResult[1] + '/index.html',
                }),
            );
        } else if (tepmlate.includes('src/index.html')) {
            htmlPlugins.push(
                new HtmlWebpackPlugin({
                    template: './src/index.html',
                    filename: 'index.html',
                    chunks: ['content'],
                }),
            );
        }
    });

module.exports = {
    entry,
    mode: 'development',
    output: {
        filename: '[name]/[name].bundle.js',
        path: path.resolve(__dirname, 'docs'),
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    miniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            url: false,
                        },
                    },
                ],
            },
            {
                test: /\.(gif|png|jpe?g|svg)$/i,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192,
                            name: '[name].[ext]',
                            fallback: 'file-loader', //超过了限制大小调用回调函数
                            outputPath: 'public/images', //图片存储的地址
                        },
                    },
                ],
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 10000, // 小于10000 ／ 1024 kb的字体会被url-loader压缩成base64格式
                            name: 'static/font/[name].[hash:7].[ext]', // 字体名字，7位哈希值，扩展名
                        },
                    },
                ],
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: require.resolve('jquery'),
                loader: 'expose-loader?$!expose-loader?jQuery',
            },
        ],
    },
    plugins: [
        ...htmlPlugins,
        new miniCssExtractPlugin({
            filename: 'index.[contenthash:8].css',
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.$': 'jquery',
            'window.jQuery': 'jquery',
        }),
    ],
    devServer: {
        contentBase: './docs',
        port: 9090,
        host: internalIp.v4.sync(),
        https: true,
    },
};
