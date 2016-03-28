# Gulp

This quick start guide will teach you how to build TypeScript with [Gulp](http://gulpjs.com) or add TypeScript into an existing Gulp build with [Babel](https://babeljs.io/), [webpack](https://webpack.github.io/) and [uglify](http://lisperator.net/uglifyjs/).

We assume that you're already using [Node.js](https://nodejs.org/) with [npm](https://www.npmjs.com/).

## Minimal project

### Lay out the project

Let's start out with a new directory.
We'll name it `proj` for now, but you can change it to whatever you want.

```shell
mkdir proj
cd proj
```

To start, we're going to structure our project in the following way:

```text
proj/
   +- src/
   +- dist/
```

TypeScript files will start out in your `src` folder, run through the TypeScript compiler and end up in `dist`.
Later we'll show how to webpack

Let's scaffold this out:

```shell
mkdir src
mkdir dist
```

### Initialize the project

Now we'll turn this folder into an npm package.

```shell
npm init
```

You'll be given a series of prompts.
You can use the defaults except for your entry point.
For your entry point, use `./dist/main.js`.
You can always go back and change these in the `package.json` file that's been generated for you.

### Install our dependencies

First install TypeScript and gulp globally.

```shell
npm install -g typescript gulp-cli
```

Then install `gulp` and `gulp-typescript` in your project devDependencies.
Gulp-typescript is a gulp plugin for Typescript.
TODO: Find out which (if any) gulp plugin is most popular.

```shell
npm install --save-dev gulp gulp-typescript
```

### Write a simple example

In src, create the file `main.ts`:

```ts
function hello(compiler: string) {
    console.log(`Hello from ${compiler}`);
}
hello("TypeScript");
```

### Create a `gulpfile.js`

In the project root, create the file `gulpfile.js`:

```js
var gulp = require('gulp');
var ts = require('gulp-typescript');
var paths = {
    scripts: ['src/**/*.ts'],
};


gulp.task('default', function () {
    return gulp.src(paths.scripts)
        .pipe(ts({noImplicitAny: true}))
        .pipe(gulp.dest('dist'));
});
```

### Test the resulting app

```ts
gulp
cd dist
node main.js
```

The program should print "Hello from TypeScript!".


## Add sourcemaps

TODO: gulp-typescript recommends gulp-sourcemaps but doesn't explain how they work.


2. Fit TypeScript into an existing gulp workflow.
3. Fit TypeScript into a babel-based workflow.
4. Make --watch work with gulp too

## Existing workflow with bundling and minify

```shell
npm install -g webpack
```

Webpack is a tool that will bundle your code and optionally all of its dependencies into a single `.js` file.
[Typings](https://www.npmjs.com/package/typings) is a package manager for grabbing definition files.
Next, we'll add development-time dependencies on [ts-loader](https://www.npmjs.com/package/ts-loader) and [source-map-loader](https://www.npmjs.com/package/source-map-loader).

```shell
npm install --save-dev ts-loader source-map-loader
npm link typescript
```

Both of these dependencies will let TypeScript and webpack play well together.
ts-loader helps webpack compile your TypeScript code using the TypeScript's standard configuration file named `tsconfig.json`.
source-map-loader uses any sourcemap outputs from TypeScript to inform webpack when generating *its own* sourcemaps.
This will allow you to debug your final output file as if you were debugging your original TypeScript source code.

Linking TypeScript allows ts-loader to use your global installation of TypeScript instead of needing a separate local copy.
If you want a local copy, just run `npm install typescript`.


It's ... not hard.
But I need a solid real-world example to use.
There should plenty of large projects on github to look at.

1. open your existing gulpfile.js
2. add a typescript compile task
3. add the task as a dependency of something.
4. make sure not to hit any of the numerous pitfalls of these various tools when working together that aren't related to Gulp at all.

Source maps should work so that you can continue debugging.

## Babel-based workflow

5. Start from a Babel-using
Maybe this should be a separate quickstart?
