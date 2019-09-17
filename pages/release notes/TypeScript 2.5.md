## Optional `catch` clause variables

Thanks to work done by [@tinganho](https://github.com/tinganho), TypeScript 2.5 implements a new ECMAScript feature that allows users to omit the variable in `catch` clauses.
For example, when using `JSON.parse` you may need to wrap calls to the function with a `try`/`catch`, but you may not end up using the `SyntaxError` that gets thrown when input is erroneous.

```ts
let input = "...";
try {
    JSON.parse(input);
}
catch {
    // ^ Notice that our `catch` clause doesn't declare a variable.
    console.log("Invalid JSON given\n\n" + input)
}
```

## Type assertion/cast syntax in `checkJs`/`@ts-check` mode

TypeScript 2.5 introduces the ability to [assert the type of expressions when using plain JavaScript in your projects](https://github.com/Microsoft/TypeScript/issues/5158).
The syntax is an `/** @type {...} */` annotation comment followed by a parenthesized expression whose type needs to be re-evaluated.
For example:

```ts
var x = /** @type {SomeType} */ (AnyParenthesizedExpression);
```

## Deduplicated and redirected packages

When importing using the `Node` module resolution strategy in TypeScript 2.5, the compiler will now check whether files originate from "identical" packages.
If a file originates from a package with a `package.json` containing the same `name` and `version` fields as a previously encountered package, then TypeScript will redirect itself to the top-most package.
This helps resolve problems where two packages might contain identical declarations of classes, but which contain `private` members that cause them to be structurally incompatible.

As a nice bonus, this can also reduce the memory and runtime footprint of the compiler and language service by avoiding loading `.d.ts` files from duplicate packages.

## The `--preserveSymlinks` compiler flag

TypeScript 2.5 brings the `preserveSymlinks` flag, which parallels the behavior of [the `--preserve-symlinks` flag in Node.js](https://nodejs.org/api/cli.html#cli_preserve_symlinks).
This flag also exhibits the opposite behavior to Webpack's `resolve.symlinks` option (i.e. setting TypeScript's `preserveSymlinks` to `true` parallels setting Webpack's `resolve.symlinks` to `false`, and vice-versa).

In this mode, references to modules and packages (e.g. `import`s and `/// <reference type="..." />` directives) are all resolved relative to the location of the symbolic link file, rather than relative to the path that the symbolic link resolves to.
For a more concrete example, we'll defer to [the documentation on the Node.js website](https://nodejs.org/api/cli.html#cli_preserve_symlinks).
