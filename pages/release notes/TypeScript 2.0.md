## Null- and undefined-aware types

TypeScript has two special types, Null and Undefined, that have the values `null` and `undefined` respectively.
Previously it was not possible to explicitly name these types, but `null` and `undefined` may now be used as type names regardless of type checking mode.

The type checker previously considered `null` and `undefined` assignable to anything.
Effectively, `null` and `undefined` were valid values of *every* type and it wasn't possible to specifically exclude them (and therefore not possible to detect erroneous use of them).

## `--strictNullChecks`

`--strictNullChecks` switches to a new strict null checking mode.

In strict null checking mode, the `null` and `undefined` values are *not* in the domain of every type and are only assignable to themselves and `any` (the one exception being that `undefined` is also assignable to `void`).
So, whereas `T` and `T | undefined` are considered synonymous in regular type checking mode (because `undefined` is considered a subtype of any `T`), they are different types in strict type checking mode, and only `T | undefined` permits `undefined` values. The same is true for the relationship of `T` to `T | null`.

##### Example

```ts
// Compiled with --strictNullChecks
let x: number;
let y: number | undefined;
let z: number | null | undefined;
x = 1;  // Ok
y = 1;  // Ok
z = 1;  // Ok
x = undefined;  // Error
y = undefined;  // Ok
z = undefined;  // Ok
x = null;  // Error
y = null;  // Error
z = null;  // Ok
x = y;  // Error
x = z;  // Error
y = x;  // Ok
y = z;  // Error
z = x;  // Ok
z = y;  // Ok
```

## Assigned-before-use checking

In strict null checking mode the compiler requires every reference to a local variable of a type that doesn't include `undefined` to be preceded by an assignment to that variable in every possible preceding code path.

##### Example

```ts
// Compiled with --strictNullChecks
let x: number;
let y: number | null;
let z: number | undefined;
x;  // Error, reference not preceded by assignment
y;  // Error, reference not preceded by assignment
z;  // Ok
x = 1;
y = null;
x;  // Ok
y;  // Ok
```

The compiler checks that variables are definitely assigned by performing *control flow based type analysis*. See later for further details on this topic.

## Optional parameters and properties

Optional parameters and properties automatically have `undefined` added to their types, even when their type annotations don't specifically include `undefined`.
For example, the following two types are identical:

```ts
// Compiled with --strictNullChecks
type T1 = (x?: number) => string;              // x has type number | undefined
type T2 = (x?: number | undefined) => string;  // x has type number | undefined
```

## Non-null and non-undefined type guards

A property access or a function call produces a compile-time error if the object or function is of a type that includes `null` or `undefined`.
However, type guards are extended to support non-null and non-undefined checks.

##### Example

```ts
// Compiled with --strictNullChecks
declare function f(x: number): string;
let x: number | null | undefined;
if (x) {
    f(x);  // Ok, type of x is number here
}
else {
    f(x);  // Error, type of x is number? here
}
let a = x != null ? f(x) : "";  // Type of a is string
let b = x && f(x);  // Type of b is string | 0 | null | undefined
```

Non-null and non-undefined type guards may use the `==`, `!=`, `===`, or `!==` operator to compare to `null` or `undefined`, as in `x != null` or `x === undefined`.
The effects on subject variable types accurately reflect JavaScript semantics (e.g. double-equals operators check for both values no matter which one is specified whereas triple-equals only checks for the specified value).

## Dotted names in type guards

Type guards previously only supported checking local variables and parameters.
Type guards now support checking "dotted names" consisting of a variable or parameter name followed one or more property accesses.

##### Example

```ts
interface Options {
    location?: {
        x?: number;
        y?: number;
    };
}

function foo(options?: Options) {
    if (options && options.location && options.location.x) {
        const x = options.location.x;  // Type of x is number
    }
}
```

Type guards for dotted names also work with user defined type guard functions and the `typeof` and `instanceof` operators and do not depend on the `--strictNullChecks` compiler option.

A type guard for a dotted name has no effect following an assignment to any part of the dotted name.
For example, a type guard for `x.y.z` will have no effect following an assignment to `x`, `x.y`, or `x.y.z`.

## Expression operators

Expression operators permit operand types to include `null` and/or `undefined` but always produce values of non-null and non-undefined types.

```ts
// Compiled with --strictNullChecks
function sum(a: number | null, b: number | null) {
    return a + b;  // Produces value of type number
}
```

The `&&` operator adds `null` and/or `undefined` to the type of the right operand depending on which are present in the type of the left operand, and the `||` operator removes both `null` and `undefined` from the type of the left operand in the resulting union type.

```ts
// Compiled with --strictNullChecks
interface Entity {
    name: string;
}
let x: Entity | null;
let s = x && x.name;  // s is of type string | null
let y = x || { name: "test" };  // y is of type Entity
```

## Type widening

The `null` and `undefined` types are *not* widened to `any` in strict null checking mode.

```ts
let z = null;  // Type of z is null
```

In regular type checking mode the inferred type of `z` is `any` because of widening, but in strict null checking mode the inferred type of `z` is `null` (and therefore, absent a type annotation, `null` is the only possible value for `z`).

## Non-null assertion operator

A new `!` post-fix expression operator may be used to assert that its operand is non-null and non-undefined in contexts where the type checker is unable to conclude that fact.
Specifically, the operation `x!` produces a value of the type of `x` with `null` and `undefined` excluded.
Similar to type assertions of the forms `<T>x` and `x as T`, the `!` non-null assertion operator is simply removed in the emitted JavaScript code.

```ts
// Compiled with --strictNullChecks
function validateEntity(e?: Entity) {
    // Throw exception if e is null or invalid entity
}

function processEntity(e?: Entity) {
    validateEntity(e);
    let s = e!.name;  // Assert that e is non-null and access name
}
```

## Compatibility

The new features are designed such that they can be used in both strict null checking mode and regular type checking mode.
In particular, the `null` and `undefined` types are automatically erased from union types in regular type checking mode (because they are subtypes of all other types), and the `!` non-null assertion expression operator is permitted but has no effect in regular type checking mode. Thus, declaration files that are updated to use null- and undefined-aware types can still be used in regular type checking mode for backwards compatibility.

In practical terms, strict null checking mode requires that all files in a compilation are null- and undefined-aware.

## Control flow based type analysis

TypeScript 2.0 implements a control flow-based type analysis for local variables and parameters.
Previously, the type analysis performed for type guards was limited to `if` statements and `?:` conditional expressions and didn't include effects of assignments and control flow constructs such as `return` and `break` statements.
With TypeScript 2.0, the type checker analyses all possible flows of control in statements and expressions to produce the most specific type possible (the *narrowed type*) at any given location for a local variable or parameter that is declared to have a union type.

##### Example

```ts
function foo(x: string | number | boolean) {
    if (typeof x === "string") {
        x; // type of x is string here
        x = 1;
        x; // type of x is number here
    }
    x; // type of x is number | boolean here
}

function bar(x: string | number) {
    if (typeof x === "number") {
        return;
    }
    x; // type of x is string here
}
```

Control flow based type analysis is particularly relevant in `--strictNullChecks` mode because nullable types are represented using union types:

```ts
function test(x: string | null) {
    if (x === null) {
        return;
    }
    x; // type of x is string in remainder of function
}
```

Furthermore, in `--strictNullChecks` mode, control flow based type analysis includes *definite assignment analysis* for local variables of types that don't permit the value `undefined`.

```ts
function mumble(check: boolean) {
    let x: number; // Type doesn't permit undefined
    x; // Error, x is undefined
    if (check) {
        x = 1;
        x; // Ok
    }
    x; // Error, x is possibly undefined
    x = 2;
    x; // Ok
}
```

## Tagged union types

TypeScript 2.0 implements support for tagged (or discriminated) union types.
Specifically, the TS compiler now support type guards that narrow union types based on tests of a discriminant property and furthermore extend that capability to `switch` statements.

##### Example

```ts
interface Square {
    kind: "square";
    size: number;
}

interface Rectangle {
    kind: "rectangle";
    width: number;
    height: number;
}

interface Circle {
    kind: "circle";
    radius: number;
}

type Shape = Square | Rectangle | Circle;

function area(s: Shape) {
    // In the following switch statement, the type of s is narrowed in each case clause
    // according to the value of the discriminant property, thus allowing the other properties
    // of that variant to be accessed without a type assertion.
    switch (s.kind) {
        case "square": return s.size * s.size;
        case "rectangle": return s.width * s.height;
        case "circle": return Math.PI * s.radius * s.radius;
    }
}

function test1(s: Shape) {
    if (s.kind === "square") {
        s;  // Square
    }
    else {
        s;  // Rectangle | Circle
    }
}

function test2(s: Shape) {
    if (s.kind === "square" || s.kind === "rectangle") {
        return;
    }
    s;  // Circle
}
```

A *discriminant property type guard* is an expression of the form `x.p == v`, `x.p === v`, `x.p != v`, or `x.p !== v`, where `p` and `v` are a property and an expression of a string literal type or a union of string literal types.
The discriminant property type guard narrows the type of `x` to those constituent types of `x` that have a discriminant property `p` with one of the possible values of `v`.

Note that we currently only support discriminant properties of string literal types.
We intend to later add support for boolean and numeric literal types.

## The `never` type

TypeScript 2.0 introduces a new primitive type `never`.
The `never` type represents the type of values that never occur.
Specifically, `never` is the return type for functions that never return and `never` is the type of variables under type guards that are never true.

The `never` type has the following characteristics:

* `never` is a subtype of and assignable to every type.
* No type is a subtype of or assignable to `never` (except `never` itself).
* In a function expression or arrow function with no return type annotation, if the function has no `return` statements, or only `return` statements with expressions of type `never`, and if the end point of the function is not reachable (as determined by control flow analysis), the inferred return type for the function is `never`.
* In a function with an explicit `never` return type annotation, all `return` statements (if any) must have expressions of type `never` and the end point of the function must not be reachable.

Because `never` is a subtype of every type, it is always omitted from union types and it is ignored in function return type inference as long as there are other types being returned.

Some examples of functions returning `never`:

```ts
// Function returning never must have unreachable end point
function error(message: string): never {
    throw new Error(message);
}

// Inferred return type is never
function fail() {
    return error("Something failed");
}

// Function returning never must have unreachable end point
function infiniteLoop(): never {
    while (true) {
    }
}
```

Some examples of use of functions returning `never`:

```ts
// Inferred return type is number
function move1(direction: "up" | "down") {
    switch (direction) {
        case "up":
            return 1;
        case "down":
            return -1;
    }
    return error("Should never get here");
}

// Inferred return type is number
function move2(direction: "up" | "down") {
    return direction === "up" ? 1 :
        direction === "down" ? -1 :
        error("Should never get here");
}

// Inferred return type is T
function check<T>(x: T | undefined) {
    return x || error("Undefined value");
}
```

Because `never` is assignable to every type, a function returning `never` can be used when a callback returning a more specific type is required:

```ts
function test(cb: () => string) {
    let s = cb();
    return s;
}

test(() => "hello");
test(() => fail());
test(() => { throw new Error(); })
```

## Read-only properties and index signatures

A property or index signature can now be declared with the `readonly` modifier is considered read-only.

Read-only properties may have initializers and may be assigned to in constructors within the same class declaration, but otherwise assignments to read-only properties are disallowed.

In addition, entities are *implicitly* read-only in several situations:

* A property declared with a `get` accessor and no `set` accessor is considered read-only.
* In the type of an enum object, enum members are considered read-only properties.
* In the type of a module object, exported `const` variables are considered read-only properties.
* An entity declared in an `import` statement is considered read-only.
* An entity accessed through an ES2015 namespace import is considered read-only (e.g. `foo.x` is read-only when `foo` is declared as `import * as foo from "foo"`).

##### Example

```ts
interface Point {
    readonly x: number;
    readonly y: number;
}

var p1: Point = { x: 10, y: 20 };
p1.x = 5;  // Error, p1.x is read-only

var p2 = { x: 1, y: 1 };
var p3: Point = p2;  // Ok, read-only alias for p2
p3.x = 5;  // Error, p3.x is read-only
p2.x = 5;  // Ok, but also changes p3.x because of aliasing
```

```ts
class Foo {
    readonly a = 1;
    readonly b: string;
    constructor() {
        this.b = "hello";  // Assignment permitted in constructor
    }
}
```

```ts
let a: Array<number> = [0, 1, 2, 3, 4];
let b: ReadonlyArray<number> = a;
b[5] = 5;      // Error, elements are read-only
b.push(5);     // Error, no push method (because it mutates array)
b.length = 3;  // Error, length is read-only
a = b;         // Error, mutating methods are missing
```

## Specifying the type of `this` for functions

Following up on specifying the type of `this` in a class or an interface, functions and methods can now declare the type of `this` they expect.

By default the type of `this` inside a function is `any`.
Starting with TypeScript 2.0, you can provide an explicit `this` parameter.
`this` parameters are fake parameters that come first in the parameter list of a function:

```ts
function f(this: void) {
    // make sure `this` is unusable in this standalone function
}
```

## `this` parameters in callbacks

Libraries can also use `this` parameters to declare how callbacks will be invoked.

##### Example

```ts
interface UIElement {
    addClickListener(onclick: (this: void, e: Event) => void): void;
}
```

`this: void` means that `addClickListener` expects `onclick` to be a function that does not require a `this` type.

Now if you annotate calling code with `this`:

```ts
class Handler {
    info: string;
    onClickBad(this: Handler, e: Event) {
        // oops, used this here. using this callback would crash at runtime
        this.info = e.message;
    };
}
let h = new Handler();
uiElement.addClickListener(h.onClickBad); // error!
```

## `--noImplicitThis`

A new flag is also added in TypeScript 2.0 to flag all uses of `this` in functions without an explicit type annotation.

## Glob support in `tsconfig.json`

Glob support is here!! Glob support has been [one of the most requested features](https://github.com/Microsoft/TypeScript/issues/1927).

Glob-like file patterns are supported two properties `"include"` and `"exclude"`.

##### Example

```json
{
    "compilerOptions": {
        "module": "commonjs",
        "noImplicitAny": true,
        "removeComments": true,
        "preserveConstEnums": true,
        "outFile": "../../built/local/tsc.js",
        "sourceMap": true
    },
    "include": [
        "src/**/*"
    ],
    "exclude": [
        "node_modules",
        "**/*.spec.ts"
    ]
}
```

The supported glob wildcards are:

* `*` matches zero or more characters (excluding directory separators)
* `?` matches any one character (excluding directory separators)
* `**/` recursively matches any subdirectory

If a segment of a glob pattern includes only `*` or `.*`, then only files with supported extensions are included (e.g. `.ts`, `.tsx`, and `.d.ts` by default with `.js` and `.jsx` if `allowJs` is set to true).

If the `"files"` and `"include"` are both left unspecified, the compiler defaults to including all TypeScript (`.ts`, `.d.ts` and `.tsx`) files in the containing directory and subdirectories except those excluded using the `"exclude"` property. JS files (`.js` and `.jsx`) are also included if `allowJs` is set to true.

If the `"files"` or `"include"` properties are specified, the compiler will instead include the union of the files included by those two properties.
Files in the directory specified using the `"outDir"` compiler option are always excluded unless explicitly included via the `"files"` property (even when the "`exclude`" property is specified).

Files included using `"include"` can be filtered using the `"exclude"` property.
However, files included explicitly using the `"files"` property are always included regardless of `"exclude"`.
The `"exclude"` property defaults to excluding the `node_modules`, `bower_components`, and `jspm_packages` directories when not specified.

## Module resolution enhancements: BaseUrl, Path mapping, rootDirs and tracing

TypeScript 2.0 provides a set of additional module resolution knops to *inform* the compiler where to find declarations for a given module.

See [Module Resolution](http://www.typescriptlang.org/docs/handbook/module-resolution.html) documentation for more details.

## Base URL

Using a `baseUrl` is a common practice in applications using AMD module loaders where modules are "deployed" to a single folder at run-time.
All module imports with non-relative names are assumed to be relative to the `baseUrl`.

##### Example

```json
{
  "compilerOptions": {
    "baseUrl": "./modules"
  }
}
```

Now imports to `"moduleA"` would be looked up in `./modules/moduleA`

```ts
import A from "moduleA";
```

## Path mapping

Sometimes modules are not directly located under *baseUrl*.
Loaders use a mapping configuration to map module names to files at run-time, see [RequireJs documentation](http://requirejs.org/docs/api.html#config-paths) and [SystemJS documentation](https://github.com/systemjs/systemjs/blob/master/docs/overview.md#map-config).

The TypeScript compiler supports the declaration of such mappings using `"paths"` property in `tsconfig.json` files.

##### Example

For instance, an import to a module `"jquery"` would be translated at runtime to `"node_modules/jquery/dist/jquery.slim.min.js"`.

```json
{
  "compilerOptions": {
    "baseUrl": "./node_modules",
    "paths": {
      "jquery": ["jquery/dist/jquery.slim.min"]
    }
}
```

Using `"paths"` also allow for more sophisticated mappings including multiple fall back locations.
Consider a project configuration where only some modules are available in one location, and the rest are in another.

## Virtual Directories with `rootDirs`

Using 'rootDirs', you can inform the compiler of the *roots* making up this "virtual" directory;
and thus the compiler can resolve relative modules imports within these "virtual" directories *as if* were merged together in one directory.

##### Example

Given this project structure:

```tree
 src
 └── views
     └── view1.ts (imports './template1')
     └── view2.ts

 generated
 └── templates
         └── views
             └── template1.ts (imports './view2')
```

A build step will copy the files in `/src/views` and `/generated/templates/views` to the same directory in the output.
At run-time, a view can expect its template to exist next to it, and thus should import it using a relative name as `"./template"`.

`"rootDirs"` specify a list of *roots* whose contents are expected to merge at run-time.
So following our example, the `tsconfig.json` file should look like:

```json
{
  "compilerOptions": {
    "rootDirs": [
      "src/views",
      "generated/templates/views"
    ]
  }
}
```

## Tracing module resolution

`--traceResolution` offers a handy way to understand how modules have been resolved by the compiler.

```shell
tsc --traceResolution
```

## Shorthand ambient module declarations

If you don't want to take the time to write out declarations before using a new module, you can now just use a shorthand declaration to get started quickly.

##### declarations.d.ts

```ts
declare module "hot-new-module";
```

All imports from a shorthand module will have the any type.

```ts
import x, {y} from "hot-new-module";
x(y);
```

## Wildcard character in module names

Importing none-code resources using module loaders extension (e.g. [AMD](https://github.com/amdjs/amdjs-api/blob/master/LoaderPlugins.md) or [SystemJS](https://github.com/systemjs/systemjs/blob/master/docs/creating-plugins.md)) has not been easy before;
previously an ambient module declaration had to be defined for each resource.

TypeScript 2.0 supports the use of the wildcard character (`*`) to declare a "family" of module names;
this way, a declaration is only required once for an extension, and not for every resource.

##### Example

```ts
declare module "*!text" {
    const content: string;
    export default content;
}
// Some do it the other way around.
declare module "json!*" {
    const value: any;
    export default value;
}
```

Now you can import things that match `"*!text"` or `"json!*"`.

```ts
import fileContent from "./xyz.txt!text";
import data from "json!http://example.com/data.json";
console.log(data, fileContent);
```

Wildcard module names can be even more useful when migrating from an un-typed code base.
Combined with Shorthand ambient module declarations, a set of modules can be easily declared as `any`.

##### Example

```ts
declare module "myLibrary/*";
```

All imports to any module under `myLibrary` would be considered to have the type `any` by the compiler;
thus, shutting down any checking on the shapes or types of these modules.

```ts
import { readFile } from "myLibrary/fileSystem/readFile`;

readFile(); // readFile is 'any'
```

## Support for UMD module definitions

Some libraries are designed to be used in many module loaders, or with no module loading (global variables).
These are known as [UMD](https://github.com/umdjs/umd) or [Isomorphic](http://isomorphic.net) modules.
These libraries can be accessed through either an import or a global variable.

For example:

##### math-lib.d.ts

```ts
export const isPrime(x: number): boolean;
export as namespace mathLib;
```

The library can then be used as an import within modules:

```ts
import { isPrime } from "math-lib";
isPrime(2);
mathLib.isPrime(2); // ERROR: can't use the global definition from inside a module
```

It can also be used as a global variable, but only inside of a script.
(A script is a file with no imports or exports.)

```ts
mathLib.isPrime(2);
```

## Optional class properties

Optional properties and methods can now be declared in classes, similar to what is already permitted in interfaces.

##### Example

```ts
class Bar {
    a: number;
    b?: number;
    f() {
        return 1;
    }
    g?(): number;  // Body of optional method can be omitted
    h?() {
        return 2;
    }
}
```

When compiled in `--strictNullChecks` mode, optional properties and methods automatically have `undefined` included in their type. Thus, the `b` property above is of type `number | undefined` and the `g` method above is of type `(() => number) | undefined`.
Type guards can be used to strip away the `undefined` part of the type:

```ts
function test(x: Bar) {
    x.a;  // number
    x.b;  // number | undefined
    x.f;  // () => number
    x.g;  // (() => number) | undefined
    let f1 = x.f();            // number
    let g1 = x.g && x.g();     // number | undefined
    let g2 = x.g ? x.g() : 0;  // number
}
```

## Private and Protected Constructors

A class constructor may be marked `private` or `protected`.
A class with private constructor cannot be instantiated outside the class body, and cannot be extended.
A class with protected constructor cannot be instantiated outside the class body, but can be extended.

##### Example

```ts
class Singleton {
    private static instance: Singleton;

    private constructor() { }

    static getInstance() {
        if (!Singleton.instance) {
            Singleton.instance = new Singleton();
        }
        return Singleton.instance;
    }
}

let e = new Singleton(); // Error: constructor of 'Singleton' is private.
let v = Singleton.getInstance();
```

## Abstract properties and accessors

An abstract class can declare abstract properties and/or accessors.
Any sub class will need to declare the abstract properties or be marked as abstract.
Abstract properties cannot have an initializer.
Abstract accessors cannot have bodies.

##### Example

```ts
abstract class Base {
    abstract name: string;
    abstract get value();
    abstract set value(v: number);
}

class Derived extends Base {
    name = "derived";

    value = 1;
}
```

## Implicit index signatures

An object literal type is now assignable to a type with an index signature if all known properties in the object literal are assignable to that index signature. This makes it possible to pass a variable that was initialized with an object literal as parameter to a function that expects a map or dictionary:

```ts
function httpService(path: string, headers: { [x: string]: string }) { }

const headers = {
    "Content-Type": "application/x-www-form-urlencoded"
};

httpService("", { "Content-Type": "application/x-www-form-urlencoded" });  // Ok
httpService("", headers);  // Now ok, previously wasn't
```

## Including built-in type declarations with `--lib`

Getting to ES6/ES2015 built-in API declarations were only limited to `target: ES6`.
Enter `--lib`; with `--lib` you can specify a list of built-in API declaration groups that you can chose to include in your project.
For instance, if you expect your runtime to have support for `Map`, `Set` and `Promise` (e.g. most evergreen browsers today), just include `--lib es2015.collection,es2015.promise`.
Similarly you can exclude declarations you do not want to include in your project, e.g. DOM if you are working on a node project using `--lib es5,es6`.

Here is a list of available API groups:

* dom
* webworker
* es5
* es6 / es2015
* es2015.core
* es2015.collection
* es2015.iterable
* es2015.promise
* es2015.proxy
* es2015.reflect
* es2015.generator
* es2015.symbol
* es2015.symbol.wellknown
* es2016
* es2016.array.include
* es2017
* es2017.object
* es2017.sharedmemory
* scripthost

##### Example

```bash
tsc --target es5 --lib es5,es2015.promise
```

```json
"compilerOptions": {
    "lib": ["es5", "es2015.promise"]
}
```

## Flag unused declarations with `--noUnusedParameters` and `--noUnusedLocals`

TypeScript 2.0 has two new flags to help you maintain a clean code base.
`--noUnusedParameters` flags any unused function or method parameters errors.
`--noUnusedLocals` flags any unused local (un-exported) declaration like variables, functions, classes, imports, etc...
Also, unused private members of a class would be flagged as errors under `--noUnusedLocals`.

##### Example

```ts
import B, { readFile } from "./b";
//     ^ Error: `B` declared but never used
readFile();


export function write(message: string, args: string[]) {
    //                                 ^^^^  Error: 'arg' declared but never used.
    console.log(message);
}
```

Parameters declaration with names starting with `_` are exempt from the unused parameter checking.
e.g.:

```ts
function returnNull(_a) { // OK
    return null;
}
```

## Module identifiers allow for `.js` extension

Before TypeScript 2.0, a module identifier was always assumed to be extension-less;
for instance, given an import as `import d from "./moduleA.js"`, the compiler looked up the definition of `"moduleA.js"` in `./moduleA.js.ts` or `./moduleA.js.d.ts`.
This made it hard to use bundling/loading tools like [SystemJS](https://github.com/systemjs/systemjs) that expect URI's in their module identifier.

With TypeScript 2.0, the compiler will look up definition of `"moduleA.js"` in  `./moduleA.ts` or `./moduleA.d.t`.

## Support 'target : es5' with 'module: es6'

Previously flagged as an invalid flag combination, `target: es5` and 'module: es6' is now supported.
This should facilitate using ES2015-based tree shakers like [rollup](https://github.com/rollup/rollup).

## Trailing commas in function parameter and argument lists

Trailing comma in function parameter and argument lists are now allowed.
This is an implementation for a [Stage-3 ECMAScript proposal](https://jeffmo.github.io/es-trailing-function-commas/) that emits down to valid ES3/ES5/ES6.

##### Example

```ts
function foo(
  bar: Bar,
  baz: Baz, // trailing commas are OK in parameter lists
) {
  // Implementation...
}

foo(
  bar,
  baz, // and in argument lists
);
```

## New `--skipLibCheck`

TypeScript 2.0 adds a new `--skipLibCheck` compiler option that causes type checking of declaration files (files with extension `.d.ts`) to be skipped.
When a program includes large declaration files, the compiler spends a lot of time type checking declarations that are already known to not contain errors, and compile times may be significantly shortened by skipping declaration file type checks.

Since declarations in one file can affect type checking in other files, some errors may not be detected when `--skipLibCheck` is specified.
For example, if a non-declaration file augments a type declared in a declaration file, errors may result that are only reported when the declaration file is checked.
However, in practice such situations are rare.

## Allow duplicate identifiers across declarations

This has been one common source of duplicate definition errors.
Multiple declaration files defining the same members on interfaces.

TypeScript 2.0 relaxes this constraint and allows duplicate identifiers across blocks, as long as they have *identical* types.

Within the same block duplicate definitions are still disallowed.

##### Example

```ts
interface Error {
    stack?: string;
}


interface Error {
    code?: string;
    path?: string;
    stack?: string;  // OK
}

```

## New `--declarationDir`

`--declarationDir` allows for generating declaration files in a different location than JavaScript files.
