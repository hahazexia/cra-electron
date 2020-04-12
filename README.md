## Create React App with electron

cra-electron is a example about how to achieve `create-react-app` with multiple entry points work for `electron`.

English | [简体中文](./README-zh_CN.md)

### why

I made a electron app with electron and vue. After that I thought about making a electron app with react. And i realized it must be multiple entry points, because there will be several `BrowserWindow` in app. So one `BrowserWindow` will has one react application. That is to say, it has to set up as a multiple page application.

Then i found out if i want to make this happen with `create-react-app`, i must `eject` it and change the webpack config , otherwise there is no way to achieve it.

After that, i search for multiple page application with react, and in `create-react-app` i found this issue: <a href="https://github.com/facebook/create-react-app/issues/1084#issuecomment-538639068">Add more entry points
#1084</a>. In that issue <a href="https://github.com/iamandrewluca">iamandrewluca</a> make a example about how to achieve multiple entry points with `create-react-app`, here it is: <a href="https://github.com/iamandrewluca/example-cra-multi-entry">example-cra-multi-entry</a>.

Really thank <a href="https://github.com/iamandrewluca">iamandrewluca</a>, because his example gives me inspiration.

### how

1. install `create-react-app` globally, then run 

```
npx create-react-app my-app
```

to initialize a react app.

2. then run 

```
npm run eject
```
this will move all configuration directly into your project, so you can meke a custom setup.

3. open `./config/paths.js` change it to this:

```js
// before
module.exports = {
  dotenv: resolveApp('.env'),
  appPath: resolveApp('.'),
  appBuild: resolveApp('build'),
  appPublic: resolveApp('public'),
  appHtml: resolveApp('public/index.html'),
  appIndexJs: resolveModule(resolveApp, 'src/index'),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('src'),
  appTsConfig: resolveApp('tsconfig.json'),
  appJsConfig: resolveApp('jsconfig.json'),
  yarnLockFile: resolveApp('yarn.lock'),
  testsSetup: resolveModule(resolveApp, 'src/setupTests'),
  proxySetup: resolveApp('src/setupProxy.js'),
  appNodeModules: resolveApp('node_modules'),
  publicUrlOrPath,
};

// after
module.exports = {
  dotenv: resolveApp('.env'),
  appPath: resolveApp('.'),
  appBuild: resolveApp('build'),
  appPublic: resolveApp('public'),
  // appHtml: resolveApp('public/index.html'),
  // appIndexJs: resolveModule(resolveApp, 'src/index'),
  appPages: [
    {
        name: "index",
        title: "index",
        appHtml: resolveApp('public/index.html'),
        appIndexJs: resolveModule(resolveApp, 'src/index'),
    },
    {
        name: "login",
        title: "login",
        appHtml: resolveApp('public/login.html'),
        appIndexJs: resolveModule(resolveApp, 'src/login'),
    }
  ],
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('src'),
  appTsConfig: resolveApp('tsconfig.json'),
  appJsConfig: resolveApp('jsconfig.json'),
  yarnLockFile: resolveApp('yarn.lock'),
  testsSetup: resolveModule(resolveApp, 'src/setupTests'),
  proxySetup: resolveApp('src/setupProxy.js'),
  appNodeModules: resolveApp('node_modules'),
  publicUrlOrPath,
};
```
this means change one entry point to two entry points. here are `index` and `login`.

then go to `./public` add new html file for the new entry point. here i add `login.html`. and also, add a new `.js` file in `./src`. here i add `login.js`.

4. open `./config/webpack.config.js` chenge it:

```js
// entry before
entry: [
      // Include an alternative client for WebpackDevServer. A client's job is to
      // connect to WebpackDevServer by a socket and get notified about changes.
      // When you save a file, the client will either apply hot updates (in case
      // of CSS changes), or refresh the page (in case of JS changes). When you
      // make a syntax error, this client will display a syntax error overlay.
      // Note: instead of the default WebpackDevServer client, we use a custom one
      // to bring better experience for Create React App users. You can replace
      // the line below with these two lines if you prefer the stock client:
      // require.resolve('webpack-dev-server/client') + '?/',
      // require.resolve('webpack/hot/dev-server'),
      isEnvDevelopment &&
        require.resolve('react-dev-utils/webpackHotDevClient'),
      // Finally, this is your app's code:
      paths.appIndexJs,
      // We include the app code last so that if there is a runtime error during
      // initialization, it doesn't blow up the WebpackDevServer client, and
      // changing JS code would still trigger a refresh.
    ].filter(Boolean),

// entry after
  let entries = {};
  paths.appPages.forEach(appPage => {
    entries[appPage.name] = [
      appPage.appIndexJs,
      isEnvDevelopment && require.resolve('react-dev-utils/webpackHotDevClient')
    ].filter(Boolean);
  });

  entry: entries,

// output before
output: {
      // The build folder.
      path: isEnvProduction ? paths.appBuild : undefined,
      // Add /* filename */ comments to generated require()s in the output.
      pathinfo: isEnvDevelopment,
      // There will be one main bundle, and one file per asynchronous chunk.
      // In development, it does not produce real files.
      filename: isEnvProduction
        ? 'static/js/[name].[contenthash:8].js'
        : isEnvDevelopment && 'static/js/bundle.js',
      // TODO: remove this when upgrading to webpack 5
      futureEmitAssets: true,
      // There are also additional JS chunk files if you use code splitting.
      chunkFilename: isEnvProduction
        ? 'static/js/[name].[contenthash:8].chunk.js'
        : isEnvDevelopment && 'static/js/[name].chunk.js',
      // webpack uses `publicPath` to determine where the app is being served from.
      // It requires a trailing slash, or the file assets will get an incorrect path.
      // We inferred the "public path" (such as / or /my-project) from homepage.
      publicPath: paths.publicUrlOrPath,
      // Point sourcemap entries to original disk location (format as URL on Windows)
      devtoolModuleFilenameTemplate: isEnvProduction
        ? info =>
            path
              .relative(paths.appSrc, info.absoluteResourcePath)
              .replace(/\\/g, '/')
        : isEnvDevelopment &&
          (info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')),
      // Prevents conflicts when multiple webpack runtimes (from different apps)
      // are used on the same page.
      jsonpFunction: `webpackJsonp${appPackageJson.name}`,
      // this defaults to 'window', but by setting it to 'this' then
      // module chunks which are built will work in web workers as well.
      globalObject: 'this',
    },

// output after
output: {
      // The build folder.
      path: isEnvProduction ? paths.appBuild : path.join(__dirname, '../dist'),
      // Add /* filename */ comments to generated require()s in the output.
      pathinfo: isEnvDevelopment,
      // There will be one main bundle, and one file per asynchronous chunk.
      // In development, it does not produce real files.
      filename: isEnvProduction
        ? 'static/js/[name].[contenthash:8].js'
        : isEnvDevelopment && 'static/js/[name].bundle.js',
      // TODO: remove this when upgrading to webpack 5
      futureEmitAssets: true,
      // There are also additional JS chunk files if you use code splitting.
      chunkFilename: isEnvProduction
        ? 'static/js/[name].[contenthash:8].chunk.js'
        : isEnvDevelopment && 'static/js/[name].chunk.js',
      // webpack uses `publicPath` to determine where the app is being served from.
      // It requires a trailing slash, or the file assets will get an incorrect path.
      // We inferred the "public path" (such as / or /my-project) from homepage.
      publicPath: paths.publicUrlOrPath,
      // Point sourcemap entries to original disk location (format as URL on Windows)
      devtoolModuleFilenameTemplate: isEnvProduction
        ? info =>
            path
              .relative(paths.appSrc, info.absoluteResourcePath)
              .replace(/\\/g, '/')
        : isEnvDevelopment &&
          (info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')),
      // Prevents conflicts when multiple webpack runtimes (from different apps)
      // are used on the same page.
      jsonpFunction: `webpackJsonp${appPackageJson.name}`,
      // this defaults to 'window', but by setting it to 'this' then
      // module chunks which are built will work in web workers as well.
      globalObject: 'this',
    },

// htmlPlugins before
new HtmlWebpackPlugin(
        Object.assign(
          {},
          {
            inject: true,
            template: paths.appHtml,
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
                  minifyURLs: true,
                },
              }
            : undefined
        )
      ),

// htmlPlugins after
let htmlPlugins = [];
  paths.appPages.forEach(appPage => {
    htmlPlugins.push(
      new HtmlWebpackPlugin(
        Object.assign(
          {},
          {
            inject: true,
            template: appPage.appHtml,
            filename: `${appPage.name}.html`,
            title: appPage.title,
            chunks: [appPage.name]
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
                minifyURLs: true,
              },
            }
            : undefined
        )
      ),
    )
  });

  plugins: [
      ...htmlPlugins,

  ]

// ManifestPlugin before
new ManifestPlugin({
        fileName: 'asset-manifest.json',
        publicPath: paths.publicUrlOrPath,
        generate: (seed, files, entrypoints) => {
          const manifestFiles = files.reduce((manifest, file) => {
            manifest[file.name] = file.path;
            return manifest;
          }, seed);
          const entrypointFiles = entrypoints.main.filter(
            fileName => !fileName.endsWith('.map')
          );

          return {
            files: manifestFiles,
            entrypoints: entrypointFiles,
          };
        },
      }),

// ManifestPlugin after
new ManifestPlugin({
        fileName: 'asset-manifest.json',
        publicPath: paths.publicUrlOrPath,
        generate: (seed, files, entrypoints) => {
          const manifestFiles = files.reduce((manifest, file) => {
            manifest[file.name] = file.path;
            return manifest;
          }, seed);
         
          // techcode
          let entrypointFiles = [];
 
          for (let [entryFile, fileName] of Object.entries(entrypoints)) {
            let notMapFiles = fileName.filter(fileName => !fileName.endsWith('.map'));
            entrypointFiles = entrypointFiles.concat(notMapFiles);
          };
 
          return {
            files: manifestFiles,
            entrypoints: entrypointFiles,
          };
        },
      }),

// add a target property to webpack config
    target: 'electron-renderer',

```

5. add new folder `main` to contain main process js file and `webpack.config.main.js` for build production main.js.

```js
// ./main/index.js
const {app, BrowserWindow} = require('electron')

let loginWindow;

function appInit () {
  loginWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        webSecurity: false,
        nodeIntegration: true
    }
  });
  global.loginWindow = loginWindow;
  loginWindow.loadURL(process.env.NODE_ENV === 'development' ? `http://localhost:${process.env.PORT}/index.html` : `file://${__dirname}/index.html`);

  loginWindow.webContents.openDevTools();

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        webSecurity: false,
        nodeIntegration: true
    }
  });
  global.mainWindow = mainWindow;

  mainWindow.loadURL(process.env.NODE_ENV === 'development' ? `http://localhost:${process.env.PORT}/login.html` : `file://${__dirname}/login.html`);

  mainWindow.webContents.openDevTools();
}

app.whenReady().then(appInit)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) appInit()
})

```

webpack.config.main.js:

```js
/**
 * Webpack config for production electron main process
 */

const path = require('path')
const webpack = require('webpack')
// import path from 'path';
// import webpack from 'webpack';
// import merge from 'webpack-merge';
// import TerserPlugin from 'terser-webpack-plugin';
const TerserPlugin = require('terser-webpack-plugin')
// import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
// import baseConfig from './webpack.config.base';
// import CheckNodeEnv from '../internals/scripts/CheckNodeEnv';
// import DeleteSourceMaps from '../internals/scripts/DeleteSourceMaps';

// CheckNodeEnv('production');
// DeleteSourceMaps();

// merge.smart({}, 
module.exports = {
// export default {
  devtool: process.env.DEBUG_PROD === 'true' ? 'source-map' : 'none',

  mode: 'production',

  target: 'electron-main',

  entry: path.resolve(__dirname, '../main/index.js'),

  output: {
    path: path.join(__dirname, '../build'),
    filename: 'main.js'
  },

  optimization: {
    // minimizer: process.env.E2E_BUILD
    //   ? []
    //   : [
    //       new TerserPlugin({
    //         parallel: true,
    //         sourceMap: true,
    //         cache: true
    //       })
    //     ]
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          ecma: undefined,
          warnings: false,
          parse: {},
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log']
          },
        },
      })
    ]
  },

  plugins: [
    // new BundleAnalyzerPlugin({
    //   analyzerMode:
    //     process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
    //   openAnalyzer: process.env.OPEN_ANALYZER === 'true'
    // }),

    /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production'
    })
  ],

  /**
   * Disables webpack processing of __dirname and __filename.
   * If you run the bundle in node.js it falls back to these values of node.js.
   * https://github.com/webpack/webpack/issues/2010
   */
  node: {
    __dirname: false,
    __filename: false
  }
}
// );
```

6. change package.json, install new package and add a `.env` file for development env `process.env.PORT`

```js
//package.json

{
  "name": "cra-electron",
  "version": "0.1.0",
  "private": true,
  "homepage": "./",
  "main": "./build/index.js",// specify production main process file for electron-builder to pack
  "dependencies": {},
  "scripts": {
    "start": "node scripts/start.js",// run development
    "test": "node scripts/test.js",
    "build:renderer": "node scripts/build.js",
    "build:main": "webpack --config ./config/webpack.config.main.js --colors",
    "build": "npm run build:renderer && npm run build:main",
    "pack": "npm run rm && npm run build && electron-builder --win --ia32 --projectDir ./", // pack for windows
    "rm:release": "rm -rf ./release",
    "rm:build": "rm -rf ./build",
    "rm": "npm run rm:release && npm run rm:build",
    "electron": "electron ./main/index.dev.js"
  },
  "eslintConfig": {
    "extends": "react-app"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "jest": {
    "roots": [
      "<rootDir>/src"
    ],
    "collectCoverageFrom": [
      "src/**/*.{js,jsx,ts,tsx}",
      "!src/**/*.d.ts"
    ],
    "setupFiles": [
      "react-app-polyfill/jsdom"
    ],
    "setupFilesAfterEnv": [
      "<rootDir>/src/setupTests.js"
    ],
    "testMatch": [
      "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
      "<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}"
    ],
    "testEnvironment": "jest-environment-jsdom-fourteen",
    "transform": {
      "^.+\\.(js|jsx|ts|tsx)$": "<rootDir>/node_modules/babel-jest",
      "^.+\\.css$": "<rootDir>/config/jest/cssTransform.js",
      "^(?!.*\\.(js|jsx|ts|tsx|css|json)$)": "<rootDir>/config/jest/fileTransform.js"
    },
    "transformIgnorePatterns": [
      "[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx)$",
      "^.+\\.module\\.(css|sass|scss)$"
    ],
    "modulePaths": [],
    "moduleNameMapper": {
      "^react-native$": "react-native-web",
      "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy"
    },
    "moduleFileExtensions": [
      "web.js",
      "js",
      "web.ts",
      "ts",
      "web.tsx",
      "tsx",
      "json",
      "web.jsx",
      "jsx",
      "node"
    ],
    "watchPlugins": [
      "jest-watch-typeahead/filename",
      "jest-watch-typeahead/testname"
    ]
  },
  "babel": {
    "presets": [
      "react-app",
      "@babel/preset-env" // make main process support es6
    ]
  },
  "build": { // electron-builder config
    "asar": true,
    "files": [
      "**/*",
      "build/**",
      "!src/*",
      "!scripts/*",
      "!public/*",
      "!main/*",
      "!config/*"
    ],
    "productName": "zhumuClient",
    "appId": "com.suirui.zhumu",
    "compression": "maximum",
    "artifactName": "${productName}-${version}-${os}-${arch}.${ext}",
    "win": {
      "target": "nsis",
      "icon": "./icons/icon.ico"
    },
    "dmg": {
      "contents": [
        {
          "x": 130,
          "y": 220
        },
        {
          "x": 410,
          "y": 220,
          "type": "link",
          "path": "/Applications"
        }
      ],
      "title": "zhumu client ${version}"
    },
    "mac": {
      "icon": "./icons/icon.icns"
    },
    "nsis": {
      "oneClick": false,
      "perMachine": true,
      "allowToChangeInstallationDirectory": true
    },
    "directories": {
      "output": "./release"
    }
  },
  "devDependencies": {
    "@babel/core": "^7.9.0",
    "@babel/preset-env": "^7.9.0",
    "@babel/register": "^7.9.0",
    "@svgr/webpack": "4.3.3",
    "@testing-library/react": "^9.3.2",
    "@testing-library/user-event": "^7.1.2",
    "@typescript-eslint/eslint-plugin": "^2.10.0",
    "@typescript-eslint/parser": "^2.10.0",
    "antd": "^4.0.4",
    "babel-eslint": "10.1.0",
    "babel-loader": "8.1.0",
    "babel-plugin-import": "^1.13.0",
    "babel-plugin-named-asset-import": "^0.3.6",
    "babel-preset-react-app": "^9.1.2",
    "camelcase": "^5.3.1",
    "case-sensitive-paths-webpack-plugin": "2.3.0",
    "connected-react-router": "^6.8.0",
    "css-loader": "3.4.2",
    "dotenv": "8.2.0",
    "dotenv-expand": "5.1.0",
    "electron": "5.0.2",
    "electron-builder": "^22.4.1",
    "eslint": "^6.6.0",
    "eslint-config-react-app": "^5.2.1",
    "eslint-loader": "3.0.3",
    "eslint-plugin-flowtype": "4.6.0",
    "eslint-plugin-import": "2.20.1",
    "eslint-plugin-jsx-a11y": "6.2.3",
    "eslint-plugin-react": "7.19.0",
    "eslint-plugin-react-hooks": "^1.6.1",
    "file-loader": "4.3.0",
    "fs-extra": "^8.1.0",
    "history": "^4.10.1",
    "html-webpack-plugin": "4.0.0-beta.11",
    "identity-obj-proxy": "3.0.0",
    "mini-css-extract-plugin": "0.9.0",
    "node-sass": "4.13.1",
    "optimize-css-assets-webpack-plugin": "5.0.3",
    "pnp-webpack-plugin": "1.6.4",
    "postcss-flexbugs-fixes": "4.1.0",
    "postcss-loader": "3.0.0",
    "postcss-normalize": "8.0.1",
    "postcss-preset-env": "6.7.0",
    "postcss-safe-parser": "4.0.1",
    "react": "^16.13.1",
    "react-app-polyfill": "^1.0.6",
    "react-dev-utils": "^10.2.1",
    "react-dom": "^16.13.1",
    "react-redux": "^7.2.0",
    "react-router-dom": "^5.1.2",
    "redux": "^4.0.5",
    "resolve": "1.15.0",
    "resolve-url-loader": "3.1.1",
    "sass-loader": "8.0.2",
    "semver": "6.3.0",
    "style-loader": "0.23.1",
    "terser-webpack-plugin": "2.3.5",
    "ts-pnp": "1.1.6",
    "url-loader": "2.3.0",
    "webpack": "4.42.0",
    "webpack-cli": "^3.3.11",
    "webpack-dev-server": "3.10.3",
    "webpack-manifest-plugin": "2.2.0",
    "workbox-webpack-plugin": "4.3.1"
  }
}


```

.env file

```
PORT=3000

```

here is new packages: 

```
    "babel-plugin-import": "^1.13.0",
    "electron": "5.0.2",
    "electron-builder": "^22.4.1",
    "webpack-cli": "^3.3.11",
```

7. change `./scripts/start.js` and `./scripts/build.js` and `webpackDevServer.config.js`

```js
// ./scripts/start.js
// before
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
  process.exit(1);
}

//after
paths.appPages.forEach(appPage => {
  if(!checkRequiredFiles([appPage.appHtml, appPage.appIndexJs])) {
    process.exit(1);
  }
});

// ./scripts/build.js
// before
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
  process.exit(1);
}

function copyPublicFolder() {
  fs.copySync(paths.appPublic, paths.appBuild, {
    dereference: true,
    filter: file => file !== paths.appHtml,
  });
}


// after
paths.appPages.forEach(appPage => {
  if(!checkRequiredFiles([appPage.appHtml, appPage.appIndexJs])) {
    process.exit(1);
  }
});

function copyPublicFolder() {
  paths.appPages.forEach(appPage => {
    fs.copySync(paths.appPublic, paths.appBuild, {
      dereference: true,
      filter: file => file !== paths.appHtml,
    });
  });
}


// webpackDevServer.config.js

// before
before(app, server) {
      // Keep `evalSourceMapMiddleware` and `errorOverlayMiddleware`
      // middlewares before `redirectServedPath` otherwise will not have any effect
      // This lets us fetch source contents from webpack for the error overlay
      app.use(evalSourceMapMiddleware(server));
      // This lets us open files from the runtime error overlay.
      app.use(errorOverlayMiddleware());

      if (fs.existsSync(paths.proxySetup)) {
        // This registers user provided middleware for proxy reasons
        require(paths.proxySetup)(app);
      }
    },


// after

const spawn = require('child_process').spawn;

before(app, server) {
      // Keep `evalSourceMapMiddleware` and `errorOverlayMiddleware`
      // middlewares before `redirectServedPath` otherwise will not have any effect
      // This lets us fetch source contents from webpack for the error overlay
      app.use(evalSourceMapMiddleware(server));
      // This lets us open files from the runtime error overlay.
      app.use(errorOverlayMiddleware());

      if (fs.existsSync(paths.proxySetup)) {
        // This registers user provided middleware for proxy reasons
        require(paths.proxySetup)(app);
      }
      spawn('npm', ['run', 'electron'], {
        shell: true,
        env: process.env,
        stdio: 'inherit'
      })
        .on('close', code => process.exit(code))
        .on('error', spawnError => console.error(spawnError));
    },
```

8. run it 

```js
npm run start // run development

npm run pack // build for windows
```

### attention

when you use `react-router` in it, you may find out `BrowserRouter` will not work，page will be blank. you can only use `HashRouter`, i think this is because electron load local static html file.