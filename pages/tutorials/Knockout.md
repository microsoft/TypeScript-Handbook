This quick start guide will teach you how to wire up TypeScript with [Knockout.js](http://knockoutjs.com/).

We assume that you're already using [Node.js](https://nodejs.org/) with [npm](https://www.npmjs.com/).

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
   └─ built/
```

TypeScript files will start out in your `src` folder, run through the TypeScript compiler, and end up in `built`.

Let's scaffold this out:

```shell
mkdir src
mkdir built
```

# Initialize the project

Now we'll turn this folder into an npm package.

```shell
npm init
```

You'll be given a series of prompts.
You can use the defaults except for your entry point.
You can always go back and change these in the `package.json` file that's been generated for you.

# Install our build dependencies

First ensure TypeScript is installed globally.

```shell
npm install -g typescript
```

We'll also grab declaration files for Knockout to describe the library's shape for TypeScript.

```shell
npm install --save @types/knockout
```

# Grab our runtime dependencies

We'll need to grab Knockout itself, as well as something called RequireJS.
[RequireJS](http://www.requirejs.org/) is a library that enables us to load modules at runtime asynchronously.

There are several ways we can go about this:

1. Download the files manually and host them.
2. Download the files through a package manager like [Bower](http://bower.io/) and host them.
3. Use a Content Delivery Network (CDN) to host both files.

We'll keep it simple and go with the first option, but Knockout's documentation has [details on using a CDN](http://knockoutjs.com/downloads/index.html), and more libraries like RequireJS can be searched for on [cdnjs](https://cdnjs.com/).

Let's create an `externals` folder in the root of our project.

```shell
mkdir externals
```

Now [download Knockout](http://knockoutjs.com/downloads/index.html) and [download RequireJS](http://www.requirejs.org/docs/download.html#latest) into that folder.
The latest and minified versions of the files should work just fine.

# Add a TypeScript configuration file

You'll want to bring your TypeScript files together - both the code you'll be writing as well as any necessary declaration files.

To do this, you'll need to create a `tsconfig.json` which contains a list of your input files as well as all your compilation settings.
Simply create a new file in your project root named `tsconfig.json` and fill it with the following contents:

```json
{
    "compilerOptions": {
        "outDir": "./built/",
        "sourceMap": true,
        "noImplicitAny": true,
        "module": "amd",
        "target": "es5"
    },
    "files": [
        "./src/require-config.ts",
        "./src/hello.ts"
    ]
}
```

You can learn more about `tsconfig.json` files [here](../tsconfig.json.md).

# Write some code

Let's write our first TypeScript file using Knockout.
First, create a new file in your `src` directory named `hello.ts`.

```ts
import * as ko from "knockout";

class HelloViewModel {
    language: KnockoutObservable<string>
    framework: KnockoutObservable<string>

    constructor(language: string, framework: string) {
        this.language = ko.observable(language);
        this.framework = ko.observable(framework);
    }
}

ko.applyBindings(new HelloViewModel("TypeScript", "Knockout"));
```

Next, we'll create a file named `require-config.ts` in `src` as well.

```ts
declare var require: any;
require.config({
    paths: {
        "knockout": "externals/knockout-3.4.0",
    }
});
```

This file will tell RequireJS where to find Knockout when we import it, just like we did in `hello.ts`.
Any page that you create should include this immediately after RequireJS, but before importing anything else.
To get a better understanding of this file and how to configure RequireJS, you can [read up on its documentation](http://requirejs.org/docs/api.html#config).

We'll also need a view to display our `HelloViewModel`.
Create a file at the root of `proj` named `index.html` with the following contents:

```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <title>Hello Knockout!</title>
    </head>
    <body>
        <p>
            Hello from
            <strong data-bind="text: language">todo</strong>
            and
            <strong data-bind="text: framework">todo</strong>!
        </p>

        <p>Language: <input data-bind="value: language" /></p>
        <p>Framework: <input data-bind="value: framework" /></p>

        <script src="./externals/require.js"></script>
        <script src="./built/require-config.js"></script>
        <script>
            require(["built/hello"]);
        </script>
    </body>
</html>
```

Notice there are three script tags.
First, we're including RequireJS itself.
Then we're mapping the paths of our external dependencies in `require-config.js` so that RequireJS knows where to look for them.
Finally, we're calling `require` with a list of modules we'd like to load.

# Putting it all together

Just run:

```shell
tsc
```

Now open up `index.html` in your favorite browser and everything should be ready to use!
You should see a page that says "Hello from TypeScript and Knockout!"
Below that, you'll also see two input boxes.
As you modify their contents and switch focus, you'll see that the original message changes.
