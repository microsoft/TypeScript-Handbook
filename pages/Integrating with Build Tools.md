# Browserify

### Install

```sh
npm install tsify
```

### Using Command Line Interface

```sh
browserify main.ts -p [ tsify --noImplicitAny ] > bundle.js
```

### Using API

```js
var browserify = require("browserify");
var tsify = require("tsify");

browserify()
    .add('main.ts')
    .plugin('tsify', { noImplicitAny: true })
    .bundle()
    .pipe(process.stdout);
```

More details: [smrq/tsify](https://github.com/smrq/tsify)

# Duo

### Install

```sh
npm install duo-typescript
```

### Using Command Line Interface

```sh
duo --use duo-typescript entry.ts
```

### Using API

```js
var Duo = require('duo');
var fs = require('fs')
var path = require('path')
var typescript = require('duo-typescript');

var out = path.join(__dirname, "output.js")

Duo(__dirname)
    .entry('entry.ts')
    .use(typescript())
    .run(function (err, results) {
        if (err) throw err;
        // Write compiled result to output file
        fs.writeFileSync(out, results.code);
    });
```

More details: [frankwallis/duo-typescript](https://github.com/frankwallis/duo-typescript)

# Grunt

### Install

```sh
npm install grunt-ts
```

### Basic Gruntfile.js

````js
module.exports = function(grunt) {
    grunt.initConfig({
        ts: {
            default : {
                src: ["**/*.ts", "!node_modules/**/*.ts"]
            }
        }
    });
    grunt.loadNpmTasks("grunt-ts");
    grunt.registerTask("default", ["ts"]);
};
````

More details: [TypeStrong/grunt-ts](https://github.com/TypeStrong/grunt-ts)

# gulp

### Install

```sh
npm install gulp-typescript
```

### Basic gulpfile.js

```js
var gulp = require("gulp");
var ts = require("gulp-typescript");

gulp.task("default", function () {
    var tsResult = gulp.src("src/*.ts")
        .pipe(ts({
              noImplicitAny: true,
              out: "output.js"
        }));
    return tsResult.js.pipe(gulp.dest('built/local'));
});
```

More details: [ivogabe/gulp-typescript](https://github.com/ivogabe/gulp-typescript)

# jspm

### Install

```sh
npm install -g jspm@beta
```

_Note: Currently TypeScript support in jspm is in 0.16beta_

More details: [TypeScriptSamples/jspm](https://github.com/Microsoft/TypeScriptSamples/tree/jspm/jspm)

# webpack

### Install

```sh
npm install awesome-typescript-loader --save-dev
```

### Basic webpack.config.js

```js
module.exports = {

    // Currently we need to add '.ts' to resolve.extensions array.
    resolve: {
        extensions: ['', '.ts', '.webpack.js', '.web.js', '.js']
    },

    // Source maps support (or 'inline-source-map' also works)
    devtool: 'source-map',

    // Add loader for .ts files.
    module: {
        loaders: [
            {
                test: /\.ts$/,
                loader: 'awesome-typescript-loader'
            }
        ]
    }
};
```

More details: [s-panferov/awesome-typescript-loader](https://github.com/s-panferov/awesome-typescript-loader)

# MSBuild

Update project file to include locally installed `Microsoft.TypeScript.Default.props` (at the top) and `Microsoft.TypeScript.targets` (at the bottom) files:

```XML
<?xml version="1.0" encoding="utf-8"?>
<Project ToolsVersion="4.0" DefaultTargets="Build" xmlns="http://schemas.microsoft.com/developer/msbuild/2003">
  <!-- Include default props at the bottom -->
  <Import
      Project="$(MSBuildExtensionsPath32)\Microsoft\VisualStudio\v$(VisualStudioVersion)\TypeScript\Microsoft.TypeScript.Default.props"
      Condition="Exists('$(MSBuildExtensionsPath32)\Microsoft\VisualStudio\v$(VisualStudioVersion)\TypeScript\Microsoft.TypeScript.Default.props')" />

  <!-- TypeScript configurations go here -->
  <PropertyGroup Condition="'$(Configuration)' == 'Debug'">
    <TypeScriptRemoveComments>false</TypeScriptRemoveComments>
    <TypeScriptSourceMap>true</TypeScriptSourceMap>
  </PropertyGroup>
  <PropertyGroup Condition="'$(Configuration)' == 'Release'">
    <TypeScriptRemoveComments>true</TypeScriptRemoveComments>
    <TypeScriptSourceMap>false</TypeScriptSourceMap>
  </PropertyGroup>

  <!-- Include default targets at the bottom -->
  <Import
      Project="$(MSBuildExtensionsPath32)\Microsoft\VisualStudio\v$(VisualStudioVersion)\TypeScript\Microsoft.TypeScript.targets"
      Condition="Exists('$(MSBuildExtensionsPath32)\Microsoft\VisualStudio\v$(VisualStudioVersion)\TypeScript\Microsoft.TypeScript.targets')" />
</Project>
```

More details about defining MSBuild compiler options: [Setting Compiler Options in MSBuild projects](./Compiler Options in MSBuild.md)

# NuGet

* Right-Click -> Manage NuGet Packages
* Search for `Microsoft.TypeScript.MSBuild`
* Hit `Install`
* When install is complete, rebuild!

More details can be found at [Package Manager Dialog](http://docs.nuget.org/Consume/Package-Manager-Dialog) and [using nightly builds with NuGet](https://github.com/Microsoft/TypeScript/wiki/Nightly-drops#using-nuget-with-msbuild)
