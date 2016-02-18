This quick start guide will teach you how to wire up TypeScript with [React](http://facebook.github.io/react/) and [webpack](http://webpack.github.io/).

We assume that you're already using [Node.js](https://nodejs.org/) with [npm](https://www.npmjs.com/).

# Lay out the project

Let's start out with a new directory.
We'll name it `proj` for now, but you can change it to whatever you want.

```shell
mkdir proj
cd proj
```

We're going to structure our project in the following way:

```text
proj/
   +- src/
   +- dist/
```

TypeScript files will start out in your `src` folder, run through the TypeScript compiler, then webpack, and end up in a `bundle.js` file in `dist`.

Let's scaffold this out:

```shell
mkdir src
mkdir dist
```

Now we'll turn this folder into an npm package.

```shell
npm init
```

You'll be given a series of prompts.
You can use the defaults except for your entry point.
For your entry point, use `./lib/bundle.js`.
You can always go back and change these in the `package.json` file that's been generated for you.

# Install our dependencies

First ensure TypeScript, typings, and webpack are installed globally.

```shell
npm install -g typescript typings webpack
```

Webpack is a tool that will bundle your code and all of its dependencies into a single `.js` file.
[Typings](https://www.npmjs.com/package/typings) is a package manager for grabbing definition files.

Let's now add React and React-DOM as dependencies to your `package.json` file:

```shell
npm install --save react react-dom
```

Next, we'll add development-time dependencies on [ts-loader](https://www.npmjs.com/package/ts-loader) and [source-map-loader](https://www.npmjs.com/package/source-map-loader).

```shell
npm install --save-dev ts-loader source-map-loader
npm link typescript
```

Both of these dependencies will let TypeScript and webpack play well together.
ts-loader helps webpack compile your TypeScript code using the TypeScript's standard configuration file named `tsconfig.json`.
source-map-loader uses any sourcemap outputs from TypeScript to informs webpack when generating its own sourcemaps.

Linking TypeScript allows ts-loader to use your global installation of TypeScript instead of needing a separate local copy.
If you want a local copy, just run `npm install typescript`.

Finally, we'll grab the declaration files for React using the `typings` utility:

```shell
typings install --ambient --save react
typings install --ambient --save react-dom
```

The `--ambient` flag will tell typings to grab any declaration files from [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped), a repository of community-authored `.d.ts` files.
This command will create a file called `typings.json` and a folder called `typings` in the current directory.

# Write some code

Let's write our first TypeScript file using React.
Create a new file in your `src` directory named `index.tsx`.

```ts
import * as React from "react";
import * as ReactDOM from "react-dom";

class HelloComponent extends React.Component<any, any> {
    render() {
        return <h1>Hello from TypeScript and React!</h1>;
    }
}

ReactDOM.render(
    <HelloComponent />,
    document.getElementById("example")
);
```

Note that while this example is quite *classy*, we didn't need to use a class.
Other methods of using React should work just as well.

We'll also need a view to display our `HelloComponent`.
Create a file at the root of `proj` named `index.html` with the following contents:

```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <title>Hello React!</title>
    </head>
    <body>
        <div id="example"></div>
        <script src="./dist/bundle.js"></script>
    </body>
</html>
```

# Add a TypeScript configuration file

At this point, you'll want to bring your TypeScript files together - both your `index.tsx` as well as your typings files.

To do this, you'll need to create a `tsconfig.json` which contains a list of your input files as well as all your compilation settings.
Simply run the following at the root of the project directory:

```shell
tsc --init ./typings/main.d.ts ./src/index.tsx --jsx react --outDir ./dist --sourceMap --noImplicitAny
```

You can learn more about `tsconfig.json` files [here](../tsconfig.json.md).

# Create a webpack configuration file

Create a `webpack.config.js` file at the root of the project directory.

```js
module.exports = {
    entry: "./src/index.tsx",
    output: {
        filename: "./dist/bundle.js",
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },

    module: {
        loaders: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
            { test: /\.tsx?$/, loader: "ts-loader" }
        ],

        preLoaders: [
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { test: /\.js$/, loader: "source-map-loader" }
        ]
    }
};
```

You can learn more about configuring webpack [here](http://webpack.github.io/docs/configuration.html).

# Putting it all together

Just run:

```shell
webpack
```

Now open up `index.html` in your favorite browser and everything should be ready to use!
You should see a page that says "Hello from TypeScript and React!"
