This quick start guide will teach you how to wire up TypeScript with [Express 4](http://facebook.github.io/react/).

# Lay out the project

Let's start out with a new directory.
We'll name it `proj` for now, but you can change it to whatever you want.

```shell
mkdir proj
cd proj
```

To start, we're going to structure our project in the following way:

```text
proj/
   ├─ src/
   |    └─ components/
   |
   └─ lib/
```

TypeScript files will start out in your `src` folder, run through the TypeScript compiler, and end up in the `lib` directory.

Let's scaffold this out:

```shell
mkdir src
mkdir lib
```

# Initialize the project

Now we'll turn this folder into an npm package.

```shell
npm init
```

You'll be given a series of prompts.
Unless you're planning to publish this, you can use the defaults except for your entry point.
You can always go back and change these in the `package.json` file that's been generated for you.

# Install our dependencies

Let's install our dependencies to get going:

```shell
npm install --save express @types/express
```

That `@types/` prefix means that we also want to get the declaration files for Express.
Usually when you import a path like `"express"`, Node will look inside of the `express` package itself;
however, not all packages include declaration files, so TypeScript looks in both a package named `@types/express` as well as the `express` package.
You'll see that we won't even have to think about this later on.

Next, we'll add development-time dependencies on TypeScript.

```shell
npm install --save-dev typescript
```

Both of these dependencies will let TypeScript and webpack play well together.
ts-loader helps webpack compile your TypeScript code using the TypeScript's standard configuration file named `tsconfig.json`.
source-map-loader uses any sourcemap outputs from TypeScript to inform webpack when generating *its own* sourcemaps.
This will allow you to debug your final output file as if you were debugging your original TypeScript source code.

Linking TypeScript allows ts-loader to use your global installation of TypeScript instead of needing a separate local copy.
If you want a local copy, just run `npm install typescript`.

# Add a TypeScript configuration file

You'll want to bring your TypeScript files together - both the code you'll be writing as well as any necessary declaration files.

To do this, you'll need to create a `tsconfig.json` which contains a list of your input files as well as all your compilation settings.
Simply create a new file in your project root named `tsconfig.json` and fill it with the following contents:

```json
{
    "compilerOptions": {
        "outDir": "./dist/",
        "sourceMap": true,
        "noImplicitAny": true,
        "module": "commonjs",
        "target": "es5",
        "jsx": "react"
    },
    "files": [
        "./src/components/Hello.tsx",
        "./src/index.tsx"
    ]
}
```

You can learn more about `tsconfig.json` files [here](../../tsconfig.json.md).

# Write some code

Let's write our first TypeScript file using React.
First, create a file named `Hello.tsx` in `src/components` and write the following:

```ts
import * as React from "react";

export interface HelloProps { compiler: string; framework: string; }

export class Hello extends React.Component<HelloProps, {}> {
    render() {
        return <h1>Hello from {this.props.compiler} and {this.props.framework}!</h1>;
    }
}
```

Note that while this example is quite *classy*, we didn't need to use a class.
Other methods of using React (like [stateless functional components](https://facebook.github.io/react/docs/reusable-components.html#stateless-functions)) should work just as well.

Next, let's create an `index.tsx` in `src` with the following source:

```ts
import * as React from "react";
import * as ReactDOM from "react-dom";

import { Hello } from "./components/Hello";

ReactDOM.render(
    <Hello compiler="TypeScript" framework="React" />,
    document.getElementById("example")
);
```

We just imported our `Hello` component into `index.tsx`.
Notice that unlike with `"react"` or `"react-dom"`, we used a *relative path* to `Hello.tsx` - this is important.
If we hadn't, TypeScript would've instead tried looking in our `node_modules` folder.

We'll also need a page to display our `Hello` component.
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

        <!-- Dependencies -->
        <script src="./node_modules/react/dist/react.js"></script>
        <script src="./node_modules/react-dom/dist/react-dom.js"></script>

        <!-- Main -->
        <script src="./dist/bundle.js"></script>
    </body>
</html>
```

Notice that we're including files from within `node_modules`.
React and React-DOM's npm packages include standalone `.js` files that you can include in a web page, and we're referencing them directly to get things moving faster.
Feel free to copy these files to another directory, or alternatively, host them on a content delivery network (CDN).
Facebook makes CDN-hosted versions of React available, and you can [read more about that here](http://facebook.github.io/react/downloads.html#development-vs.-production-builds).

# Create a webpack configuration file

Create a `webpack.config.js` file at the root of the project directory.

```js
module.exports = {
    entry: "./src/index.tsx",
    output: {
        filename: "bundle.js",
        path: __dirname + "/dist"
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
    },

    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    },
};
```

You might be wondering about that `externals` field.
We want to avoid bundling all of React into the same file, since this increases compilation time and browsers will typically be able to cache a library if it doesn't change.

Ideally, we'd just import the React module from within the browser, but most browsers still don't quite support modules yet.
Instead libraries have traditionally made themselves available using a single global variable like `jQuery` or `_`.
This is called the "namespace pattern", and webpack allows us to continue leveraging libraries written that way.
With our entry for `"react": "React"`, webpack will work its magic to make any import of `"react"` load from the `React` variable.

You can learn more about configuring webpack [here](http://webpack.github.io/docs/configuration.html).

# Putting it all together

Just run:

```shell
webpack
```

Now open up `index.html` in your favorite browser and everything should be ready to use!
You should see a page that says "Hello from TypeScript and React!"
