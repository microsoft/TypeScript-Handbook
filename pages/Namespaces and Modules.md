> **A note about terminology:**
It's important to note that in TypeScript 1.5, the nomenclature has changed.
"Internal modules" are now "namespaces".
"External modules" are now simply "modules", as to align with [ECMAScript 2015 (also known as ES6)](http://www.ecma-international.org/ecma-262/6.0/)'s terminology, (namely that `module X {` is equivalent to the now-preferred `namespace X {`).

# Introduction

This post outlines the various ways to organize your code using namespaces and modules in TypeScript.
We'll also go over some advanced topics of how to use namespaces and modules, and address some common pitfalls when using them in TypeScript.

See the [[Modules]] documentation for more information about modules.
See the [[Namespaces]] documentation for more information about namespaces.


# Using Namespaces

Namespaces are simply named JavaScript object in the global namespace.
This makes namespaces a very simple construct to use.
They can span multiple files, and can be concatenated using `--outFile`.
Namespaces can be a good way to structure your code in a Web Application, with all dependencies included as `<script>` tags in your html page.

Just like all global namespace pollution, it can be hard to identify component dependencies, especially in a large application.

# Going modular

Just like namespaces, modules can contain both code and declarations.
The main difference is that modules *declare* their dependencies.

Modules also adds the dependency on a module loader (such as CommonJs/requirejs).
For a small JS application this might not be optimal, but for larger applications, the cost comes with long term modularity and maintainability benefits.
Modules provide for better code reuse, stronger isolation and better bundling optimization tooling support.

Also worth noting that, for NodeJs applications, modules are the default and the recommended approach to structure your code.

Starting with ECMAScript 2015, modules are native part of the language, and should be supported by all compliant engine implementations.

For new projects modules would be the recommended code organization mechanism.

# Pitfalls of Namespaces and Modules

In this section we'll describe various common pitfalls in using namespaces and modules, and how to avoid them.

## `/// <reference>`-ing a module

A common mistake is to try to use the `/// <reference>` syntax to refer to a module file, rather than using import.
To understand the distinction, we first need to understand the three ways that the compiler can locate the type information for a module.

The first is by finding a `.ts` file named by an `import x = require(...);` declaration.
That file should be an implementation file with top-level import or export declarations.

The second is by finding a `.d.ts` file, similar to above, except that instead of being an implementation file, it's a declaration file (also with top-level import or export declarations).

The final way is by seeing an "ambient module declaration", where we `declare` a module with a matching quoted name.

##### myModules.d.ts

```TypeScript
// In a .d.ts file or .ts file that is not a module:
declare module "SomeModule" {
    export function fn(): string;
}
```

##### myOtherModule.ts

```TypeScript
/// <reference path="myModules.d.ts" />
import m = require("SomeModule");
```

The reference tag here allows us to locate the declaration file that contains the declaration for the ambient module.
This is how the node.d.ts file that several of the TypeScript samples use is consumed, for example.

## Needless Namespacing

If you're converting a program from namespaces to modules, it can be easy to end up with a file that looks like this:

##### shapes.ts

```TypeScript
export namespace Shapes {
    export class Triangle { /* ... */ }
    export class Square { /* ... */ }
}
```

The top-level module here `Shapes` wraps up `Triangle` and `Square` for no reason.
This is confusing and annoying for consumers of your module:

##### shapeConsumer.ts

```TypeScript
import shapes = require('./shapes');
var t = new shapes.Shapes.Triangle(); // shapes.Shapes?
```

A key feature of modules in TypeScript is that two different modules will never contribute names to the same scope.
Because the consumer of a module decides what name to assign it, there's no need to proactively wrap up the exported symbols in a namespace.

To reiterate why you shouldn't try to namespace your module contents, the general idea of namespacing is to provide logical grouping of constructs and to prevent name collisions.
Because the module file itself is already a logical grouping, and its top-level name is defined by the code that imports it, it's unnecessary to use an additional module layer for exported objects.

Here's a revised example:

##### shapes.ts

```TypeScript
export class Triangle { /* ... */ }
export class Square { /* ... */ }
```

##### shapeConsumer.ts

```TypeScript
import shapes = require('./shapes');
var t = new shapes.Triangle();
```

## Trade-offs of Modules

Just as there is a one-to-one correspondence between JS files and modules, TypeScript has a one-to-one correspondence between module source files and their emitted JS files.
One effect of this is that it's not possible to use the `--outFile` compiler switch to concatenate multiple module source files into a single JavaScript file.
