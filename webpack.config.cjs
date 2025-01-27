const path = require("path");
const fs = require('fs')
const webpack = require("webpack");
const dotenv = require("dotenv");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const nodeExternals = require("webpack-node-externals");

dotenv.config();

const development = {
  entry: "./src/core/renderers/bundler/index.tsx",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "src/dist/dev"), // esta config de webpack la corre webpack-dev-server, que no escribe en disco. Por eso no se va a encontrar en archivo en esta localizacion
  },
  devServer: {
    port: 8080,
    static: {
      directory: path.join(__dirname, "src/dist/dev/"),
    },
    https: {
      key: fs.readFileSync('cert.key'), // Path to your key
      cert: fs.readFileSync('cert.crt'), // Path to your certificate
    },
    historyApiFallback: true,
    client: {
      progress: true,
    },
  },
  devtool: "source-map",
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"], // Add all the extensions you are using
  },
  module: {
    rules: [
      {
        test: /\.(?:js|mjs|cjs|jsx|tsx|ts)$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
          options: {
            transpileOnly: true, // important so front-end files won't crash when making chages (and so the hot reload works as expected)
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource', // Handles image assets automatically
      },
      {
        test: /\.css$/i, // For plain .css files
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(s(a|c)ss)$/, // For .scss and .sass files
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.js$/,
        use: "source-map-loader",
        enforce: "pre",
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/core/html/template.html", // Path to your HTML file
    }),
    // variables del .env que van a estar visibles en el codigo que corre el navegador
    new webpack.EnvironmentPlugin([
      "BACKEND_URL",
      "COOKIES_PATH",
      "BACKEND_CLOSE_AUTH_PATH",
      "SERVER_URL",
      "PORTAL_SUFIX",
    ]),
  ],
};

const productionFrontBundle = {
  entry: "./src/core/renderers/bundler/index.tsx",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "src/dist"),
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"], // Add all the extensions you are using
  },
  module: {
    rules: [
      {
        test: /\.(?:js|mjs|cjs|jsx|tsx|ts)$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
        },
      },
      {
        test: /\.(s(a|c)ss)$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
    ],
  },
  plugins: [
    // variables del .env que van a estar visibles en el codigo que corre el navegador
    new webpack.EnvironmentPlugin([
      "BACKEND_URL",
      "COOKIES_PATH",
      "BACKEND_CLOSE_AUTH_PATH",
      "SERVER_URL",
      "PORTAL_SUFIX", // no se usa en prod, pero hay que ponerlo para que el codigo no se rompa
    ]),
  ],
};

const serverBundle = {
  entry: path.resolve(__dirname, "src/app.ts"),
  output: {
    filename: "bundle-server.js",
    path: path.resolve(__dirname, "src/dist-server"),
  },
  externals: [nodeExternals()],
  ...(process.env.NODE_ENV === "production" ? {} : { devtool: "source-map" }),
  module: {
    rules: [
      {
        test: /\.(s(a|c)ss)$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
      {
        test: /\.(?:js|mjs|cjs|jsx|tsx|ts)$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
        },
      },
      {
        test: /\.js$/,
        use: "source-map-loader",
        enforce: "pre",
      },
    ],
  },
  target: "node",
  plugins: [new MiniCssExtractPlugin()],
  resolve: {
    fallback: {
      fs: require.resolve("fs"),
      tls: false,
      net: false,
      path: require.resolve("path-browserify"),
      zlib: false,
      http: false,
      https: false,
      stream: false,
      crypto: false,
      "crypto-browserify": false,
    },
    extensions: [".js", ".jsx", ".ts", ".tsx"], // extensions you used
  },
};

const bundles = {
  "production-server": { mode: "production", bundle: serverBundle }, // front server running as production environment
  "development-server": { mode: "development", bundle: serverBundle }, // front server running as development environment
  production: { mode: "production", bundle: productionFrontBundle }, // front bundle for production
  development: { mode: "development", bundle: development }, // for development. just front from bundle. no front server
};

module.exports = (env, args) => ({
  mode: bundles[env.bundle].mode,
  ...bundles[env.bundle].bundle,
});
