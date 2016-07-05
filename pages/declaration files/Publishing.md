Now that you have authored a declaration file following the steps of this guide, it is time to publish it to npm.
There are two main ways you can publish your declaration files to npm: 1. bundling with your npm package, or 2. publishing to [@types organization](https://www.npmjs.com/~types) on npm.

If you control the npm package you are publishing declarations for, then the first approach is favored; this way your declarations and JavaScript always travel together.

# Bundle with npm package

You will need to indicate the main declaration file for your `package.json` file, similar to how you indicate the main `.js` file.
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

Note that `"typings"` is synonymous with `"types"` and can be used as well.

Also note that if your main declaration file is named `index.d.ts` and lives at the root of the package (next to `index.js`) you do not need to mark the `"types"` property, though it is advisable to do so.

## Dependencies

All dependencies are managed by npm.
Make sure all the declaration packages you depend on are marked appropriately in the `"dependencies"` section in your `package.json`.
For example:

```json
{
    "name": "browserify-typescript-extension",
    "author": "Vandelay Industries",
    "version": "1.0.0",
    "main": "./lib/main.js",
    "types": "./lib/main.d.ts"
    "dependencies" : [
        "browserify": "latest",
        "@types/browserify": "latest",
        "typescript": "next"
    ]
}
```

In this example this package depends on `browserify`, and `typescript`.
It does expose declarations that uses the declarations in these packages; so any user or our `browserify-typescript-extension` package needs to have these dependencies as well.

`browserify` does not bundle its declaration files with its npm packages, thus the declaration files come from `@types/browserify`.
`typescript` however, bundles its declaration files, so no need to add additional references.

Note that you need to use `"dependencies"` and not `"devDependencies"` since your declarations depend on these dependencies.

## Red flags

### `/// <reference path="..." />

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

### Bundling dependent declarations

If your type definitions depend on another package:

* *Don't* combine it with yours, keep each in their own file.
* *Don't* copy the declarations in your package either.
* *Do* depend on the npm type declaration package.

## Publicize your declaration file

After publishing your declaration file with your package, make sure to add a reference to it in the [DefinitelyTyped repo external package list](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/types-2.0/notNeededPackages.json).
Adding this will allow search tool to know that your package provides its own declarations.

<!-- TODO: more about this. -->

# Publish to [@types](https://www.npmjs.com/~types)

Packages on under the [@types](https://www.npmjs.com/~types) organization are published automatically from [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) using the [types-publisher tool](https://github.com/Microsoft/types-publisher).
To get your declarations published as an @types package, please submit a pull request to [https://github.com/DefinitelyTyped/DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped).
You can find more details in the [contribution guidelines page](http://definitelytyped.org/guides/contributing.html).