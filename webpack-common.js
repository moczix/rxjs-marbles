"use strict";

const path = require("path");
const webpack = require("webpack");
const webpackRxjsExternals = require("webpack-rxjs-externals");

function getConfig(framework, env, moduleType) {
  const libraryName =
    moduleType === "amd" ? `rxjs-marbles/${framework}` : "rxjsMarbles";
  const libraryTarget = moduleType === "amd" ? "amd" : "umd";

  let suffix = framework ? `-${framework}` : "";
  let filename = `rxjs-marbles${suffix}.${libraryTarget}.js`;
  let mode = "development";
  if (env && env.production) {
    filename = `rxjs-marbles${suffix}.min.${libraryTarget}.js`;
    mode = "production";
  }
  return {
    context: path.join(__dirname, "./"),
    entry: {
      index: framework ? `./source/${framework}/index.ts` : "./source/index.ts"
    },
    externals: [
      webpackRxjsExternals(),
      (context, request, callback) => {
        if (/^(ava|tape)$/.test(request)) {
          return callback(null, {
            commonjs: request,
            commonjs2: request
          });
        }
        callback();
      }
    ],
    mode,
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: {
            loader: "ts-loader",
            options: {
              compilerOptions: {
                declaration: false
              },
              configFile: "tsconfig-dist-cjs.json"
            }
          }
        }
      ]
    },
    output: {
      filename,
      library: libraryName,
      libraryTarget: libraryTarget,
      path: path.resolve(__dirname, "./dist/bundles")
    },
    resolve: {
      extensions: [".ts", ".js"]
    }
  };
}

module.exports = framework => env => [
  getConfig(framework, env, "umd"),
  getConfig(framework, env, "amd")
];
