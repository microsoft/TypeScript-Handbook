This quick start guide will teach you how to get TypeScript and [Vue](https://vuejs.org) working together.
This guide is flexible enough that any steps here can be used to integrate TypeScript into an existing Vue project.

# Initialize your project

Let's create a new package.

```sh
mkdir typescript-vue-tutorial
cd typescript-vue-tutorial
```

Next, we'll scaffold our project in the following way:

```txt
typescript-vue-tutorial/
├─ dist/
└─ src/
   └─ components/
```

TypeScript files will start out in your `src` folder, run through the TypeScript compiler, then webpack, and end up in a `bundle.js` file in `dist`.
Any components that we write will go in the `src/components` folder.

Let's scaffold this out:

```shell
mkdir src
cd src
mkdir components
cd ..
```

Webpack will eventually generate the `dist` directory for us.

# Initialize the project

Now we'll turn this folder into an npm package.

```shell
npm init
```

You'll be given a series of prompts.
You can use the defaults except for your entry point.
You can always go back and change these in the `package.json` file that's been generated for you.

# Install our dependencies

We'll be using a custom repository that uses experimental declarations for Vue.
These declarations are currently maintained on a fork of Vue, but may be part of the main repo in the near future.

```sh
npm install https://github.com/DanielRosenwasser/vue#540a38fb21adb7a7bc394c65e23e6cffb36cd867
```

Next, ensure TypeScript, Webpack and the necessary loaders are installed.

```sh
npm install --save-dev typescript webpack ts-loader css-loader vue-loader vue-template-compiler@2.2.1
```

Webpack is a tool that will bundle your code and optionally all of its dependencies into a single `.js` file.
While you don't need to use a bundler like Webpack or Browserify, these tools will allow us to use `.vue` files which we'll cover in a bit.

We've locked onto version 2.2.1 of the vue-template-compiler so that it operates smoothly with our fork of Vue.

We didn't need to [add `.d.ts` files](https://www.typescriptlang.org/docs/handbook/declaration-files/consumption.html), but if we were using a package which didn't ship declaration files, we'd need to install the appropriate `@types/` package.
[Read more about using definition files in our documentation](https://www.typescriptlang.org/docs/handbook/declaration-files/consumption.html).

# Add a TypeScript configuration file

You'll want to bring your TypeScript files together - both the code you'll be writing as well as any necessary declaration files.

To do this, you'll need to create a `tsconfig.json` which contains a list of your input files as well as all your compilation settings.
Simply create a new file in your project root named `tsconfig.json` and fill it with the following contents:

```json
{
    "compilerOptions": {
        "outDir": "./built/",
        "sourceMap": true,
        "strict": true,
        "noImplicitReturns": true,
        "module": "es2015",
        "moduleResolution": "node",
        "target": "es5"
    },
    "include": [
        "./src/**/*"
    ]
}
```

Notice the `strict` flag is set to true.
At the very least, TypeScript's `noImplicitThis` flag will need to be turned on to leverage Vue's declaration files, but `strict` gives us that and more (like `noImplicitAny` and `strictNullChecks`).
We strongly recommend using TypeScript's stricter options for a better experience.

# Adding Webpack

We'll need to add a `webpack.config.json` to bundle our app.

```js
var path = require('path')
var webpack = require('webpack')

module.exports = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: 'build.js'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
            // the "scss" and "sass" values for the lang attribute to the right configs here.
            // other preprocessors should work out of the box, no loader config like this necessary.
            'scss': 'vue-style-loader!css-loader!sass-loader',
            'sass': 'vue-style-loader!css-loader!sass-loader?indentedSyntax',
          }
          // other vue-loader options go here
        }
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          appendTsSuffixTo: [/\.vue$/],
        }
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true
  },
  performance: {
    hints: false
  },
  devtool: '#eval-source-map'
}

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ])
}
```

# Add a build script

Open up your `package.json` and add a script named `build` to run Webpack.
Your `"scripts"` field should look something like this:

```json
"scripts": {
    "build": "webpack",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
```

Once we add an entry point, we'll be able to build by running

```sh
npm run build
```

and have builds get triggered on changes by running

```sh
npm run build -- --watch
```

# Create a basic project

Let's create the most bare-bones Vue & TypeScript example that we can try out.
First, create the file `./src/index.ts`:

```ts
// src/index.ts

import Vue from "vue";

let v = new Vue({
    el: "#app",
    template: `
    <div>
        <div>Hello {{name}}!</div>
        Name: <input v-model="name" type="text">
    </div>`,
    data: {
        name: "World"
    }
});

```

Let's check to see if everything is wired up correctly.
Create an `index.html` with the following content at your root:

```html
<!doctype html>
<html>
<head></head>

<body>
    <div id="app"></div>
</body>
<script src="./dist/build.js"></script>

</html>
```

Now run `npm run build` and open up your `index.html` file in a browser.

You should see some text that says `Hello World!`.
Below that, you'll see a textbox.
If you change the content of the textbox, you'll notice how the text is synchronized between the two.

Congrats!
You've gotten TypeScript and Vue fully hooked up!

# Adding a component

As you've just seen, Vue has a very simple interface for when you need to accomplish simple tasks.
When our page only needed to communicate a bit of data between two elements, it took very little code.

For more complex tasks, Vue is flexible in that it supports breaking your application into *components*.
[Components](https://vuejs.org/v2/guide/components.html) are useful for separating the concerns of how entities are displayed to the user.
[Read up more on components from Vue's documentation.](https://vuejs.org/v2/guide/components.html)

A Vue component can be declared in the following manner:

```ts
// src/components/Hello.ts

import Vue from "vue";

export default Vue.extend({
    template: `
        <div>
            <div>Hello {{name}}{{exclamationMarks}}</div>
            <button @click="decrement">-</button>
            <button @click="increment">+</button>
        </div>
    `,
    props: ['name', 'initialEnthusiasm'],
    data() {
        return {
            enthusiasm: this.initialEnthusiasm,
        }
    },
    methods: {
        increment() { this.enthusiasm++; },
        decrement() {
            if (this.enthusiasm > 1) {
                this.enthusiasm--;
            }
        },
    },
    computed: {
        exclamationMarks(): string {
            return Array(this.enthusiasm + 1).join('!');
        }
    }
});
```

This component has two buttons and some text.
When rendered, it takes an initial `name` and an `initialEnthusiasm` which is the number of exclamation marks we want to display.
When we hit the `+` button, it adds an exclamation mark to the end of the text.
Likewise, when we hit the `-` button, it removes an exclamation mark unless we're down to just one.

Our root Vue instance can consume it as follows:

```ts
// src/index.ts

import Vue from "vue";
import HelloComponent from "./components/Hello";

let v = new Vue({
    el: "#app",
    template: `
    <div>
        Name: <input v-model="name" type="text">
        <hello-component :name="name" :initialEnthusiasm="5" />
    </div>
    `,
    data: { name: "World" },
    components: {
        HelloComponent
    }
});
```

However, we'll note that it is fairly popular to use [Vue's *single file components*](https://vuejs.org/v2/guide/single-file-components.html).
Let's try writing the above as an SFC.

# Single File Components

When using Webpack or Browserify, Vue has plugins like [vue-loader](https://github.com/vuejs/vue-loader) and [vueify](https://www.npmjs.com/package/vueify) which allow you to author your components in HTML-like files.
These files, which end in a `.vue` extension, are single file components.

There are a few things that need to be put in place to use `.vue` files with TypeScript, but luckily we're already halfway there.
We already installed vue-loader earlier when we got our dev dependencies.
We also specified the `appendTsSuffixTo: [/\.vue$/],` option to ts-loader in our `webpack.config.js` file, which allows TypeScript to process the code extracted from a single file component.

One extra thing we'll have to do is tell TypeScript what `.vue` files will look like when they're imported.
We'll do this with a `vue-shims.d.ts` file:

```ts
// src/vue-shims.d.ts

declare module "*.vue" {
    import Vue from "vue";
    export default Vue;
}
```

We don't need to import this file anywhere.
It's automatically included by TypeScript, and it tells it that anything imported that ends in `.vue` has the same shape of the Vue constructor itself.

What's left?
The editing experience!
One of the best features TypeScript gives us is its editor support.
To leverage that within `.vue` files, we recommend using [Visual Studio Code](https://code.visualstudio.com/) with the [Vetur](https://marketplace.visualstudio.com/items?itemName=octref.vetur) plugin for Vue.

Now, let's write an SFC!

```html
<!-- src/components/Hello.vue -->

<template>
    <div>
        <div class="greeting">Hello {{name}}{{exclamationMarks}}</div>
        <button @click="decrement">-</button>
        <button @click="increment">+</button>
    </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
    props: ['name', 'initialEnthusiasm'],
    data() {
        return {
            enthusiasm: this.initialEnthusiasm,
        }
    },
    methods: {
        increment() { this.enthusiasm++; },
        decrement() {
            if (this.enthusiasm > 1) {
                this.enthusiasm--;
            }
        },
    },
    computed: {
        exclamationMarks(): string {
            return Array(this.enthusiasm + 1).join('!');
        }
    }
});
</script>

<style>
.greeting {
    font-size: 20px;
}
</style>
```

and let's import it for our root instance:

```ts
// src/index.ts

import Vue from "vue";
import HelloComponent from "./components/Hello.vue";

let v = new Vue({
    el: "#app",
    template: `
    <div>
        Name: <input v-model="name" type="text">
        <hello-component :name="name" :initialEnthusiasm="5" />
    </div>
    `,
    data: { name: "World" },
    components: {
        HelloComponent
    }
});
```

Notice a few things about our single-file component:

* We had to write `<script lang="ts">` to get it working with TypeScript.
* We had to import the component with the `.vue` extension in `index.ts`.
* We were able to write CSS isolated to our components in a `<style>` tag, which we couldn't do in our `.ts` components.
* We default-exported a call to `Vue.extend` (rather than the options bag itself).
  If you don't write `Vue.extend`, Vetur will make it look like things are working correctly, but you'll get an error when you build your project.

Try running `npm run build` and open up `index.html` to see the result!

# What next?

You can [try out this application by cloning it from GitHub](https://github.com/DanielRosenwasser/typescript-vue-tutorial).

Once you feel like you've got a handle on that, you can try out a sample [TodoMVC-style app written in TypeScript and Vue](https://github.com/DanielRosenwasser/typescript-vue-todomvc).
This TodoMVC-style sample features routing through [vue-router](https://github.com/DanielRosenwasser/typescript-vue-todomvc) so that your application can show different views depending on the current URL.

You may also want to look into [Vuex](https://github.com/vuejs/vuex) if you're looking for [Redux](http://redux.js.org/)-style state management.