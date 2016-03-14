# Advanced Module Tasks

## Optional Module Loading and Other Advanced Loading Scenarios

In some cases, you may want to decide whether or not to load a module at runtime.
In TypeScript, you can still invoke the module loaders directly to implement this and other advanced loading scenarios.
You don't need to rely on TypeScript to emit the module loader code for you.
Additionally, the pattern below lets you keep type safety even when calling loaders yourself.

The compiler detects whether each module is used in the emitted JavaScript.
If a module identifier is never used as an expression -- only part of a type annotation -- then no `require` call is emitted for that module.
So you can import a module just for the types, then call the module loader manually.
Below is an example of this double-import pattern in Node.js:

##### Sample: Dynamic Module Loading in Node.js

```ts
declare function require(moduleName: string): any;

// 1. Get types from module
import { ZipCodeValidator as ZipModule } from "./ZipCodeValidator";

// 2. Check whether module should load at runtime
if (needZipValidation) {
    // 3. manually load module
    let ZipCodeValidator: typeof ZipModule = require("./ZipCodeValidator");
    let validator = new ZipCodeValidator();
    if (validator.isAcceptable("...")) { /* ... */ }
}
```

At step (1), we import the module normally, but with a special name that we will only use once.
This gives us access to the module's types.
Then at step (3) we call the module loader manually using `require`.
This variable gives the actual name you'll use for the module.
We get type safety by assigning the dynamically loaded module the static type of the module: `typeof ZipModule`.
The `typeof` keyword, when used in a type position, produces the type of a value, in this case the type of the module `ZipModule`.
For this pattern to work, it's important that the symbol defined via an `import` is only used in type positions (i.e. never in a position that would be emitted into the JavaScript).

Below are examples in other module systems.

##### Sample: Dynamic Module Loading in require.js

```ts
declare function require(moduleNames: string[], onLoad: (...args: any[]) => void): void;

import { ZipCodeValidator as Zip } from "./ZipCodeValidator";

if (needZipValidation) {
    require(["./ZipCodeValidator"], (ZipCodeValidator: typeof Zip) => {
        let validator = new ZipCodeValidator();
        if (validator.isAcceptable("...")) { /* ... */ }
    });
}
```

##### Sample: Dynamic Module Loading in System.js

```ts
declare const System: any;

import { ZipCodeValidator as Zip } from "./ZipCodeValidator";

if (needZipValidation) {
    System.import("./ZipCodeValidator").then((ZipCodeValidator: typeof Zip) => {
        var x = new ZipCodeValidator();
        if (x.isAcceptable("...")) { /* ... */ }
    });
}
```

## Converting From Namespaces

If you're converting a program from namespaces to modules, there are a few common pitfalls.

### Do not use namespaces in modules

When you first move to a module-based organization, it can be easy to end up with a file that looks like this:

* `shapes.ts`

  ```ts
  export namespace Shapes {
      export class Triangle { /* ... */ }
      export class Square { /* ... */ }
  }
  ```

The top-level namespace `Shapes` wraps up `Triangle` and `Square`.
This code is easy to produce just by adding 'export' to the beginning of the existing code.
But the result is confusing and annoying for consumers of your module.
The namespace puts an extra layer around the objects that the module exports:

* `shapeConsumer.ts`

  ```ts
  import * as shapes from "./shapes";
  let t = new shapes.Shapes.Triangle(); // shapes.Shapes?
  ```

A key feature of modules in TypeScript is that two different modules will never contribute names to the same scope.
Because the consumer of a module decides what name to assign it, you don't need to wrap up the exported symbols in a namespace.
Basically, both namespaces and modules (1) provide logical grouping and (2) prevent name collisions.
You don't need both.

Here's a revised example:

* `shapes.ts`

  ```ts
  export class Triangle { /* ... */ }
  export class Square { /* ... */ }
  ```

* `shapeConsumer.ts`

  ```ts
  import * as shapes from "./shapes";
  let t = new shapes.Triangle();
  ```

## Code Generation for Modules

Depending on the module target specified during compilation, the compiler will generate appropriate code for Node.js ([CommonJS](http://wiki.commonjs.org/wiki/CommonJS)), require.js ([AMD](https://github.com/amdjs/amdjs-api/wiki/AMD)), isomorphic ([UMD](https://github.com/umdjs/umd)), [SystemJS](https://github.com/systemjs/systemjs), or [ECMAScript 2015 native modules](http://www.ecma-international.org/ecma-262/6.0/#sec-modules) (ES6) module-loading systems.
For more information on what the `define`, `require` and `register` calls in the generated code do, consult the documentation for each module loader.

This simple example shows how the names used during importing and exporting get translated into the module loading code.

##### SimpleModule.ts

```ts
import { something } from "./mod";
export let t = m.something + 1;
```

##### AMD / RequireJS SimpleModule.js

Compile with `tsc -m amd SimpleModule.ts`

```js
define(["require", "exports", "./mod"], function (require, exports, mod_1) {
    "use strict";
    exports.t = mod_1.something + 1;
});
```

##### CommonJS / Node SimpleModule.js

Compile with `tsc -m commonjs SimpleModule.ts`

```js
"use strict";
var mod_1 = require("./mod");
exports.t = mod_1.something + 1;
```

##### UMD SimpleModule.js

Compile with `tsc -m umd SimpleModule.ts`

```js
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./mod"], factory);
    }
})(function (require, exports) {
    "use strict";
    var mod_1 = require("./mod");
    exports.t = mod_1.something + 1;
});
```

##### System SimpleModule.js

Compile with `tsc -m system SimpleModule.ts`

```js
System.register(["./mod"], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var mod_1;
    var t;
    return {
        setters:[
            function (mod_1_1) {
                mod_1 = mod_1_1;
            }],
        execute: function() {
            exports_1("t", t = mod_1.something + 1);
        }
    }
});
```

##### Native ECMAScript 2015 modules SimpleModule.js

To produce native modules, you must target ES2015 for all of your code as well.
Compile with `tsc -m es2015 -t es2015 SimpleModule.ts`

```js
import { something } from "./mod";
export let t = something + 1;
```
