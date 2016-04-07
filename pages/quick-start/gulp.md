# Gulp

This quick start guide will teach you how to build TypeScript with [gulp](http://gulpjs.com) and then add [Browserify](http://browserify.org), [uglify](http://lisperator.net/uglifyjs/), or [Watchify](https://github.com/substack/watchify) to the gulp pipeline.

We assume that you're already using [Node.js](https://nodejs.org/) with [npm](https://www.npmjs.com/).

## Minimal project

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

Now we can use `npm install` to install packages.
First install TypeScript and gulp globally.

```shell
npm install -g typescript gulp-cli
```

Then install `gulp` and `gulp-typescript` in your project `devDependencies`.
[Gulp-typescript](https://www.npmjs.com/package/gulp-typescript) is a gulp plugin for Typescript.

```shell
npm install --save-dev gulp gulp-typescript
```

### Write a simple example

Let's write a Hello World program.
In `src`, create the file `main.ts`:

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

```shell
gulp
cd dist
node main.js
```

The program should print "Hello from TypeScript!".

# Browserify

Now let's turn our code into a web app written as a collection of modules.
This is the structure you're more likely to use for a real web app.
We'll use Browserify to pack our code into a single file for distribution.

## Add modules to the code

Create a file called `src/greet.ts`:

```ts
export function showHello(divName: string) {
    const elt = document.getElementById(divName)
    elt.innerText = sayHello("TypeScript");
}
export function sayHello(name: string) {
    return `Hello from ${name}`;
}
```

Now change the code in `src/main.ts` to import `sayHello` from `greet.ts`:

```ts
import { sayHello } from "./greet";
console.log(sayHello("TypeScript"));
```

Before we get to Browserify, let's make sure that the modules work by running `gulp` and then testing in Node:

```shell
gulp
cd dist
node main.js
```

Notice that even though we used ES2015 module syntax, TypeScript emitted CommonJS modules that Node uses.
You can change this by adding a `module` member to the options object that you pass to gulp-typescript.
For example `module: "amd` emits AMD module syntax instead.

## Change to a web app

Now let's move this from Node to the browser.
We'll use browserify, which bundles all our modules into one JavaScript file.
In addition, it lets us use the CommonJS module system used by Node, which is the default TypeScript emit.
That means we don't have to change any options to tell TypeScript which module system to target.

First, install browserify, [tsify](https://www.npmjs.com/package/tsify) and vinyl-source-stream.
tsify is a browserify plugin that, like gulp-typescript, gives access to the TypeScript compiler.
vinyl-source-stream lets us adapt the file output of browserify back into a gulp stream.

```shell
npm install --save-dev browserify tsify vinyl-source-stream
```

### Create a page

Create a file in the root of the project named `index.html`:

```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <title>Hello World!</title>
    </head>
    <body>
        <p id="greeting">Loading ...</p>
        <script src="bundle.js"></script>
    </body>
</html>
```

Now change `main.ts` to update the page:

```ts
import { sayHello, showHello } from "./greet";
console.log(sayHello("TypeScript"));
showHello("greeting");
```

Calling `showHello` makes `main.ts` change the paragraph's text in addition to writing to the console.
Now change your gulpfile to the following:

```js
var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var tsify = require('tsify');
var paths = {
    pages: ['*.html']
};

gulp.task('copyHtml', function () {
    return gulp.src(paths.pages)
        .pipe(gulp.dest('dist'));
});
gulp.task('default', ['copyHtml'], function () {
    return browserify({
        basedir: '.',
        debug: true,
        entries: ['src/main.ts'],
        cache: {},
        packageCache: {}
    })
    .plugin(tsify, {noImplicitAny: true})
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('dist'));
});
```

This adds the `copyHtml` task and changes the `default` task significantly.
`copyHtml` is a simple task that needs to run before `default`.
`default` now calls browserify first instead of using the usual gulp methods.
After calling `bundle` we use `source` (our alias for vinyl-source-stream) to name the bundle `bundle.js`.

Test the page by running gulp and then opening `dist/index.html` in a browser.
You should see "Hello from TypeScript" on the page.

Notice that we specify `debug: true` to browserify.
This causes tsify to emit inline source maps.
You can test that source maps are working by opening the debugger for your browser and putting a breakpoint inside `main.ts`.
When you refresh the page the breakpoint should pause the page and let you debug into `greet.ts`.

# Watchify, Babel and Uglify

Now that we are bundling our code with browserify and tsify, we can add various features to our build with browserify plugins.

* Watchify starts gulp and keeps it running, incrementally compiling whenever you save a file.
  This lets you keep an edit-save-refresh cycle going in the browser.

* Babel is a hugely flexible transpiler that converts ES2015 and beyond into ES5 and ES3.
  This lets you add transformations that TypeScript doesn't support.

* Uglify compacts your code so that it takes less time to download onto the client.

## Watchify

We'll start with Watchify to provide background compilation:

```shell
npm install --save-dev watchify
```

Now change your gulpfile to the following:

```js
var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var tsify = require('tsify');
var paths = {
    pages: ['*.html']
};

const b = watchify(browserify({
        basedir: '.',
        debug: true,
        entries: ['src/main.ts'],
        cache: {},
        packageCache: {}
})
        .plugin(tsify, {
            noImplicitAny: true
        }));
gulp.task('copyHtml', function () {
    return gulp.src(paths.pages)
        .pipe(gulp.dest('dist'));
});
function bundle() {
    return b
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('dist'));
}
gulp.task('default', ['copyHtml'], bundle);
b.on('update', bundle);
```

There are basically two changes here, but they require you to refactor your code a bit.

1. Wrap the `browserify` plus `tsify` call in a `watchify` call.
   Then save the resulting object in a variable named `b`.
2. Call `b.on('update', bundle);` to run browserify's bundling every time one of your TypeScript files changes.

Together (1) and (2) mean that you have to separate the browserify construction out of the `default` task.
And you have to give the function for `default` a name since you need it both for the `gulp.task` and for `watchify.on`.

## Uglify

First install Uglify.
Since the point of Uglify is to mangle your code, we also need to install vinyl-buffer and gulp-sourcemaps to keep sourcemaps working.

```shell
npm install --save-dev gulp-uglify vinyl-buffer gulp-sourcemaps
```

Now change your gulpfile to the following:

```js
var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var tsify = require('tsify');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');
var paths = {
    pages: ['*.html']
};


gulp.task('copyHtml', function () {
    return gulp.src(paths.pages)
        .pipe(gulp.dest('dist'));
});
gulp.task('default', ['copyHtml'], function () {
    return browserify({
        basedir: '.',
        debug: true,
        entries: ['src/main.ts'],
        cache: {},
        packageCache: {}
    })
        .plugin(tsify, {
            noImplicitAny: true
        })
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist'));
});
```

Notice that `uglify` itself just one call &mdash; the calls to `buffer` and `sourcemaps` exist to make sure sourcemaps keep working.
These calls give us a separate sourcemap file instead of using inline sourcemaps like before.

## Babel

First install Babelify.
Like Uglify, Babelify mangles code, so we'll need vinyl-buffer and gulp-sourcemaps.

```shell
npm install --save-dev babelify vinyl-buffer gulp-sourcemaps
```

Now change your gulpfile to the following:

```js
var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var tsify = require('tsify');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');
var paths = {
    pages: ['*.html']
};


gulp.task('copyHtml', function () {
    return gulp.src(paths.pages)
        .pipe(gulp.dest('dist'));
});
gulp.task('default', ['copyHtml'], function () {
    return browserify({
        basedir: '.',
        debug: true,
        entries: ['src/main.ts'],
        cache: {},
        packageCache: {}
    })
        .plugin(tsify, {
            noImplicitAny: true
        })
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist'));
});
```

Notice that TypeScript now targets ES6.
Babel then takes the emitted ES6 code and produces ES5 from it.
Babel's ES5 output should be very similar to TypeScript's output for such a simple script.
