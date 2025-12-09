const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const resolve = require("resolve");
const PnpWebpackPlugin = require("pnp-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const InlineChunkHtmlPlugin = require("react-dev-utils/InlineChunkHtmlPlugin");
const InterpolateHtmlPlugin = require("react-dev-utils/InterpolateHtmlPlugin");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const safePostCssParser = require("postcss-safe-parser");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
const WorkboxWebpackPlugin = require("workbox-webpack-plugin");
const getCSSModuleLocalIdent = require("react-dev-utils/getCSSModuleLocalIdent");
const paths = require("./paths");
const modules = require("./modules");
const getClientEnvironment = require("./env");
const ModuleNotFoundPlugin = require("react-dev-utils/ModuleNotFoundPlugin");
const ForkTsCheckerWebpackPlugin = require("react-dev-utils/ForkTsCheckerWebpackPlugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

const postcssNormalize = require("postcss-normalize");

const appPackageJson = require(paths.appPackageJson);

// Source maps are resource heavy and can cause out of memory issue for large source files.
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== "false";
// Some apps do not need the benefits of saving a web request, so not inlining the chunk
// makes for a smoother build process.
const shouldInlineRuntimeChunk = process.env.INLINE_RUNTIME_CHUNK !== "false";

const imageInlineSizeLimit = parseInt(
  process.env.IMAGE_INLINE_SIZE_LIMIT || "10000"
);

// Check if TypeScript is setup
const useTypeScript = fs.existsSync(paths.appTsConfig);

// style files regexes
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;

// This is the production and development configuration.
// It is focused on developer experience, fast rebuilds, and a minimal bundle.
module.exports = function(webpackEnv) {
  const isEnvDevelopment = webpackEnv === "development";
  const isEnvProduction = webpackEnv === "production";

  // Variable used for enabling profiling in Production
  // passed into alias object. Uses a flag if passed into the build command
  const isEnvProductionProfile =
    isEnvProduction && process.argv.includes("--profile");

  // Webpack uses `publicPath` to determine where the app is being served from.
  // It requires a trailing slash, or the file assets will get an incorrect path.
  // In development, we always serve from the root. This makes config easier.
  const publicPath = isEnvProduction
    ? paths.servedPath
    : isEnvDevelopment && "/";
  // Some apps do not use client-side routing with pushState.
  // For these, "homepage" can be set to "." to enable relative asset paths.
  const shouldUseRelativeAssetPaths = publicPath === "./";

  // `publicUrl` is just like `publicPath`, but we will provide it to our app
  // as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
  // Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
  const publicUrl = isEnvProduction
    ? publicPath.slice(0, -1)
    : isEnvDevelopment && "";
  // Get environment variables to inject into our app.
  const env = getClientEnvironment(publicUrl);

  // common function to get style loaders
  const getStyleLoaders = (cssOptions, preProcessor) => {
    const loaders = [
      isEnvDevelopment && require.resolve("style-loader"),
      isEnvProduction && {
        loader: MiniCssExtractPlugin.loader,
        options: shouldUseRelativeAssetPaths ? { publicPath: "../../" } : {}
      },
      {
        loader: require.resolve("css-loader"),
        options: {
          ...cssOptions,
          url: {
            filter: (url) => {
              if (url.startsWith('data:')) {
                return false;
              }
              return true;
            }
          }
        }
      },
      {
        loader: require.resolve("postcss-loader"),
        options: {
          postcssOptions: {
            ident: "postcss",
            plugins: [
              require("postcss-flexbugs-fixes"),
              require("postcss-preset-env")({
                autoprefixer: {
                  flexbox: "no-2009"
                },
                stage: 3
              }),
              postcssNormalize()
            ]
          },
          sourceMap: isEnvProduction && shouldUseSourceMap
        }
      }
    ].filter(Boolean);
    if (preProcessor) {
      loaders.push(
        {
          loader: require.resolve("resolve-url-loader"),
          options: {
            sourceMap: isEnvProduction && shouldUseSourceMap
          }
        },
        {
          loader: require.resolve(preProcessor),
          options: {
            sourceMap: true,
            api: "modern"
          }
        }
      );
    }
    return loaders;
  };

  const entries = {
    main: paths.appIndexJs
  };

  // Add playground entry if requested (dev or prod)
  if (process.env.REACT_APP_BUILD_TARGET === 'playground') {
    entries.playground = paths.playgroundIndexJs;
  }

  if (isEnvDevelopment) {
    // Intégrer le hot client directement dans main au lieu de créer une entrée séparée
    entries.main = [
      require.resolve("react-dev-utils/webpackHotDevClient"),
      paths.appIndexJs
    ];
  }

  return {
    mode: isEnvProduction ? "production" : isEnvDevelopment && "development",
    bail: isEnvProduction,
    devtool: isEnvProduction
      ? shouldUseSourceMap
        ? "source-map"
        : false
      : isEnvDevelopment && "cheap-module-source-map",
    cache: {
      type: "filesystem",
      buildDependencies: {
        config: [__filename]
      }
    },
    entry: entries,
    output: {
      path: isEnvProduction ? paths.appBuild : undefined,
      pathinfo: isEnvDevelopment,
      filename: isEnvProduction
        ? "static/js/[name].[contenthash:8].js"
        : isEnvDevelopment && "static/js/[name].bundle.js",
      chunkFilename: isEnvProduction
        ? "static/js/[name].[contenthash:8].chunk.js"
        : isEnvDevelopment && "static/js/[name].chunk.js",
      publicPath: publicPath,
      devtoolModuleFilenameTemplate: isEnvProduction
        ? info =>
            path
              .relative(paths.appSrc, info.absoluteResourcePath)
              .replace(/\\/g, "/")
        : isEnvDevelopment &&
          (info => path.resolve(info.absoluteResourcePath).replace(/\\/g, "/")),
      chunkLoadingGlobal: `webpackJsonp${appPackageJson.name}`,
      globalObject: "this"
    },
    optimization: {
      concatenateModules: isEnvProduction,
      minimize: isEnvProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            parse: {
              ecma: 8
            },
            compress: {
              ecma: 5,
              warnings: false,
              comparisons: false,
              inline: 2,
              drop_console: isEnvProduction,
              drop_debugger: isEnvProduction,
              pure_funcs: isEnvProduction
                ? ["console.log", "console.info", "console.debug"]
                : []
            },
            mangle: {
              safari10: true
            },
            keep_classnames: isEnvProductionProfile,
            keep_fnames: isEnvProductionProfile,
            output: {
              ecma: 5,
              comments: false,
              ascii_only: true
            }
          },
          parallel: true
        }),
        new CssMinimizerPlugin({
          parallel: true,
          minimizerOptions: {
            preset: [
              "default",
              {
                parser: safePostCssParser,
                map: shouldUseSourceMap
                  ? {
                      inline: false,
                      annotation: true
                    }
                  : false
              }
            ]
          }
        })
      ],
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            priority: -10,
            reuseExistingChunk: true
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            name: "react",
            priority: 20,
            reuseExistingChunk: true
          }
        }
      },
      runtimeChunk: {
        name: entrypoint => `runtime-${entrypoint.name}`
      }
    },
    resolve: {
      modules: ["node_modules", paths.appNodeModules]
        .concat(modules.additionalModulePaths || [])
        .filter(Boolean),
      extensions: paths.moduleFileExtensions
        .map(ext => `.${ext}`)
        .filter(ext => useTypeScript || !ext.includes("ts")),
      alias: {
        "react-native": "react-native-web",
        ...(isEnvProductionProfile && {
          "react-dom$": "react-dom/profiling",
          "scheduler/tracing": "scheduler/tracing-profiling"
        }),
        ...(modules.webpackAliases || {})
      },
      fallback: {
        module: false,
        dgram: false,
        dns: false,
        fs: false,
        http2: false,
        net: false,
        tls: false,
        child_process: false,
        process: require.resolve("process/browser"),
        buffer: require.resolve("buffer"),
        path: require.resolve("path-browserify")
      },
      plugins: [
        PnpWebpackPlugin
      ]
    },
    resolveLoader: {
      plugins: [
        PnpWebpackPlugin.moduleLoader(module)
      ]
    },
    module: {
      strictExportPresence: true,
      rules: [
        // Handle problematic ES modules that need process polyfill
        // Disable fullySpecified for node_modules to fix 'process/browser' resolution issues
        // See: https://github.com/webpack/webpack.js.org/issues/3975
        {
          test: /\.m?js$/,
          include: /node_modules/,
          resolve: {
            fullySpecified: false
          }
        },
        {
          oneOf: [
            {
              test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
              // Exclude images using inline url-loader 
              exclude: /partner-logos|sponsor-logos|interfaced-logos/,
              type: "asset",
              parser: {
                dataUrlCondition: {
                  maxSize: imageInlineSizeLimit
                }
              },
              generator: {
                filename: "static/media/[name].[contenthash:8][ext]"
              }
            },
            {
              test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg$/],
              include: /(partner-logos|sponsor-logos|interfaced-logos)/,
              type: "asset",
              parser: {
                dataUrlCondition: {
                  maxSize: imageInlineSizeLimit
                }
              },
              generator: {
                filename: (pathData) => {
                  const filePath = pathData.filename;
                  if (filePath.includes('partner-logos')) {
                    return 'static/partner-logos/[name].[contenthash:8][ext]';
                  }
                  if (filePath.includes('sponsor-logos')) {
                    return 'static/sponsor-logos/[name].[contenthash:8][ext]';
                  }
                  if (filePath.includes('interfaced-logos')) {
                    return 'static/interfaced-logos/[name].[contenthash:8][ext]';
                  }
                  return 'static/media/[name].[contenthash:8][ext]';
                }
              }
            },
            {
              test: /\.(js|mjs|jsx|ts|tsx)$/,
              include: [
                paths.appSrc,
                paths.commonSrc,
                paths.playgroundSrc
              ].filter(Boolean),
              loader: require.resolve("babel-loader"),
              options: {
                customize: require.resolve(
                  "babel-preset-react-app/webpack-overrides"
                ),
                plugins: [
                  [
                    require.resolve("babel-plugin-named-asset-import"),
                    {
                      loaderMap: {
                        svg: {
                          ReactComponent:
                            "@svgr/webpack?-svgo,+titleProp,+ref![path]"
                        }
                      }
                    }
                  ],
                  // React Fast Refresh géré par babel.config.js automatiquement en développement
                ].filter(Boolean),
                cacheDirectory: true,
                cacheCompression: false,
                compact: isEnvProduction
              }
            },
            {
              test: /\.(js|mjs)$/,
              exclude: /@babel(?:\/|\\{1,2})runtime/,
              loader: require.resolve("babel-loader"),
              options: {
                babelrc: false,
                configFile: false,
                compact: false,
                presets: [
                  [
                    require.resolve("babel-preset-react-app/dependencies"),
                    { helpers: true }
                  ]
                ],
                cacheDirectory: true,
                cacheCompression: false,
                sourceMaps: shouldUseSourceMap,
                inputSourceMap: shouldUseSourceMap
              }
            },
            {
              test: cssRegex,
              exclude: cssModuleRegex,
              use: getStyleLoaders({
                importLoaders: 1,
                sourceMap: isEnvProduction && shouldUseSourceMap
              }),
              sideEffects: true
            },
            {
              test: cssModuleRegex,
              use: getStyleLoaders({
                importLoaders: 1,
                sourceMap: isEnvProduction && shouldUseSourceMap,
                modules: {
                  getLocalIdent: getCSSModuleLocalIdent
                }
              })
            },
            {
              test: sassRegex,
              exclude: sassModuleRegex,
              use: getStyleLoaders(
                {
                  importLoaders: 2,
                  sourceMap: isEnvProduction && shouldUseSourceMap
                },
                "sass-loader"
              ),
              sideEffects: true
            },
            {
              test: sassModuleRegex,
              use: getStyleLoaders(
                {
                  importLoaders: 2,
                  sourceMap: isEnvProduction && shouldUseSourceMap,
                  modules: {
                    getLocalIdent: getCSSModuleLocalIdent
                  }
                },
                "sass-loader"
              )
            },
            {
              test: /\.(woff|woff2|eot|ttf|otf)$/i,
              type: "asset/resource",
              generator: {
                filename: "static/fonts/[name].[contenthash:8][ext]"
              }
            },
            {
              loader: require.resolve("file-loader"),
              exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
              options: {
                name: "static/media/[hash:8].[ext]"
              }
            }
          ]
        }
      ]
    },
    plugins: [
      // Generate playground.html if requested (dev or prod)
      ...(process.env.REACT_APP_BUILD_TARGET === 'playground' ? [
        new HtmlWebpackPlugin(
          Object.assign(
            {},
            {
              inject: true,
              filename: "api-playground.html",
              chunks: ["playground"].filter(Boolean),
              template: paths.playgroundHtml
            },
            isEnvProduction
              ? {
                  minify: {
                    removeComments: true,
                    collapseWhitespace: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                    keepClosingSlash: true,
                    minifyJS: true,
                    minifyCSS: true,
                    minifyURLs: true
                  }
                }
              : undefined
          )
        )
      ] : []),
      
      new HtmlWebpackPlugin(
        Object.assign(
          {},
          {
            inject: true,
            chunks: ["main"].filter(Boolean),
            template: paths.appHtml
          },
          isEnvProduction
            ? {
                minify: {
                  removeComments: true,
                  collapseWhitespace: true,
                  removeRedundantAttributes: true,
                  useShortDoctype: true,
                  removeEmptyAttributes: true,
                  removeStyleLinkTypeAttributes: true,
                  keepClosingSlash: true,
                  minifyJS: true,
                  minifyCSS: true,
                  minifyURLs: true
                }
              }
            : undefined
        )
      ),
      isEnvProduction &&
        shouldInlineRuntimeChunk &&
        new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/runtime-.+[.]js/]),
      new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),
      new ModuleNotFoundPlugin(paths.appPath),
      new webpack.DefinePlugin({
        ...env.stringified,
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        'process.browser': JSON.stringify(true)
      }),
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer']
      }),
      isEnvDevelopment && new CaseSensitivePathsPlugin(),
      // React Fast Refresh automatique en développement
      isEnvDevelopment && new ReactRefreshWebpackPlugin({
        overlay: false,
        // Configuration sécurisée pour éviter les problèmes avec les stores/API
        exclude: [
          /node_modules/,
          // Exclusions ciblées pour les parties sensibles
          /\/store\//,
          /\/utils\/api/,
          /\/utils\/actions/,
          /root\.js$/,
          /routes\.js$/
        ],
      }),
      new ESLintPlugin({
        extensions: ["js", "mjs", "jsx", "ts", "tsx"],
        formatter: require.resolve("react-dev-utils/eslintFormatter"),
        eslintPath: require.resolve("eslint"),
        context: paths.appSrc,
        cache: true,
        cacheLocation: path.resolve(
          paths.appNodeModules,
          ".cache/.eslintcache"
        ),
        emitWarning: isEnvDevelopment,
        emitError: !isEnvDevelopment,
        failOnError: !isEnvDevelopment
      }),
      isEnvProduction &&
        new MiniCssExtractPlugin({
          filename: "static/css/[name].[contenthash:8].css",
          chunkFilename: "static/css/[name].[contenthash:8].chunk.css"
        }),
      new WebpackManifestPlugin({
        fileName: "asset-manifest.json",
        publicPath: publicPath,
        generate: (seed, files, entrypoints) => {
          const manifestFiles = files.reduce((manifest, file) => {
            manifest[file.name] = file.path;
            return manifest;
          }, seed);
          const entrypointFiles = entrypoints.main.filter(
            fileName => !fileName.endsWith(".map")
          );

          return {
            files: manifestFiles,
            entrypoints: entrypointFiles
          };
        }
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/
      }),
      isEnvProduction &&
        new WorkboxWebpackPlugin.GenerateSW({
          additionalManifestEntries: [{ url: "/favicon.svg", revision: "1" }],
          clientsClaim: true,
          skipWaiting: true,
          maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
          exclude: [
            /\.map$/,
            /asset-manifest\.json$/,
            /\.LICENSE$/,
            /hero.*\.jpg$/,
            /.*partner-logos.*/,
            /.*sponsor-logos.*/,
            /\.mp4/
          ],
          navigateFallback: publicUrl + "/index.html",
          sourcemap: false,
          navigateFallbackDenylist: [
            new RegExp("/[^/?]+\\.[^/]+$"),
            new RegExp("^/api"),
            new RegExp("^/admin"),
            new RegExp("^/developers")
          ]
        }),
      useTypeScript &&
        new ForkTsCheckerWebpackPlugin({
          typescript: resolve.sync("typescript", {
            basedir: paths.appNodeModules
          }),
          async: isEnvDevelopment,
          useTypescriptIncrementalApi: true,
          checkSyntacticErrors: true,
          resolveModuleNameModule: process.versions.pnp
            ? `${__dirname}/pnpTs.js`
            : undefined,
          resolveTypeReferenceDirectiveModule: process.versions.pnp
            ? `${__dirname}/pnpTs.js`
            : undefined,
          tsconfig: paths.appTsConfig,
          reportFiles: [
            "**",
            "!**/__tests__/**",
            "!**/?(*.)(spec|test).*",
            "!**/src/setupProxy.*",
            "!**/src/setupTests.*"
          ],
          silent: true
        })
    ].filter(Boolean),
    node: {
      __dirname: false,
      __filename: false,
      global: true
    },
    performance: false,
    ignoreWarnings: [
      {
        module: /node_modules\/@graphiql\/toolkit/,
        message: /Can't resolve 'graphql-ws'/
      },
      {
        module: /web\/landing\/partners\.js/,
        message: /Critical dependency/
      }
    ]
  };
};