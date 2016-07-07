Now that you have authored a declaration file following the steps of this guide, it is time to publish it to npm.
There are two main ways you can publish your declaration files to npm:

1. bundling with your npm package, or
2. publishing to the [@types organization](https://www.npmjs.com/~types) on npm.

If you control the npm package you are publishing declarations for, then the first approach is favored.
That way, your declarations and JavaScript always travel together.

# Including declarations in your npm package

If your package has a main `.js` file, you will need to indicate the main declaration file in your `package.json` file as well.
Set the `types` property to point to your bundled declaration file.
For example:

```json
{
    "name": "awesome",
    "author": "Vandelay Industries",
    "version": "1.0.0",
    "main": "./lib/main.js",
    "types": "./lib/main.d.ts"
}
```

Note that the `"typings"` field is synonymous with `"types"`, and could be used as well.

Also note that if your main declaration file is named `index.d.ts` and lives at the root of the package (next to `index.js`) you do not need to mark the `"types"` property, though it is advisable to do so.

## Dependencies

All dependencies are managed by npm.
Make sure all the declaration packages you depend on are marked appropriately in the `"dependencies"` section in your `package.json`.
For example, imagine we authored a package that used Browserify and TypeScript.

```json
{
    "name": "browserify-typescript-extension",
    "author": "Vandelay Industries",
    "version": "1.0.0",
    "main": "./lib/main.js",
    "types": "./lib/main.d.ts",
    "dependencies": [
        "browserify@latest",
        "@types/browserify@latest",
        "typescript@next"
    ]
}
```

Here, our package depends on the `browserify` and `typescript` packages.
`browserify` does not bundle its declaration files with its npm packages, so we needed to depend on `@types/browserify` for its declarations.
`typescript`, on the other hand, packages its declaration files, so there was no need for any additional dependencies

Our package exposes declarations from each of those, so any user of our `browserify-typescript-extension` package needs to have these dependencies as well.
For that reason, we used `"dependencies"` and not `"devDependencies"`, because otherwise our consumers would have needed to manually install those packages.
If we had just written a command line application and not expected our package to be used as a library, we might have used `devDependencies`.

## Red flags

### `/// <reference path="..." />`

*Don't* use `/// <reference path="..." />` in your declaration files.

```ts
/// <reference path="../typescript/lib/typescriptServices.d.ts" />
....
```

*Do* use `/// <reference types="..." />` instead.

```ts
/// <reference types="typescript" />
....
```

Make sure to revisit the [Consuming dependencies](./Library Structures.md#consuming-dependencies) section for more information.

### Packaging dependent declarations

If your type definitions depend on another package:

* *Don't* combine it with yours, keep each in their own file.
* *Don't* copy the declarations in your package either.
* *Do* depend on the npm type declaration package if it doesn't package its declaration files.

## Publicize your declaration file

After publishing your declaration file with your package, make sure to add a reference to it in the [DefinitelyTyped repo external package list](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/types-2.0/notNeededPackages.json).
Adding this will allow search tools to know that your package provides its own declarations.

<!-- TODO: more about this. -->

# Publish to [@types](https://www.npmjs.com/~types)

Packages on under the [@types](https://www.npmjs.com/~types) organization are published automatically from [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) using the [types-publisher tool](https://github.com/Microsoft/types-publisher).
To get your declarations published as an @types package, please submit a pull request to [https://github.com/DefinitelyTyped/DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped).
You can find more details in the [contribution guidelines page](http://definitelytyped.org/guides/contributing.html).
