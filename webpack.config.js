const path = require("path");
const { NODE_ENV = "production" } = process.env;
module.exports = {
  entry: "./src/server.ts",
  mode: NODE_ENV,
  target: "node",
  node: {
    __dirname: true
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "server.js"
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  externals: {
    sharp: "commonjs sharp"
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ["ts-loader"]
      }
    ]
  }
};
