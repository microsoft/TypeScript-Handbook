# JSX support

JSX is an embeddable XML-like syntax.
It is meant to be transformed into valid JavaScript, but the semantics of that transformation are implementation-specific.
JSX came to popularity with the React library but has since seen other applications.
TypeScript 1.6 supports embedding, type checking, and optionally compiling JSX directly into JavaScript.

#### New `.tsx` file extension and `as` operator

TypeScript 1.6 introduces a new `.tsx` file extension.
This extension does two things: it enables JSX inside of TypeScript files, and it makes the new `as` operator the default way to cast (removing any ambiguity between JSX expressions and the TypeScript prefix cast operator).
For example:

```ts
var x = <any> foo;
// is equivalent to:
var x = foo as any;
```

#### Using React

To use JSX-support with React you should use the [React typings](https://github.com/borisyankov/DefinitelyTyped/tree/master/react). These typings define the `JSX` namespace so that TypeScript can correctly check JSX expressions for React. For example:

```ts
/// <reference path="react.d.ts" />

interface Props {
  name: string;
}

class MyComponent extends React.Component<Props, {}> {
  render() {
    return <span>{this.props.foo}</span>
  }
}

<MyComponent name="bar" />; // OK
<MyComponent name={0} />; // error, `name` is not a number
```

#### Using other JSX framworks

JSX element names and properties are validated against the `JSX` namespace.
Please see the [[JSX]] wiki page for defining the `JSX` namespace for your framework.

#### Output generation

TypeScript ships with two JSX modes: `preserve` and `react`.

* The `preserve` mode will keep JSX expressions as part of the output to be further consumed by another transform step. *Additionally the output will have a `.jsx` file extension.*
* The `react` mode will emit `React.createElement`, does not need to go through a JSX transformation before use, and the output will have a `.js` file extension.

See the [[JSX]] wiki page for more information on using JSX in TypeScript.

# Intersection types

TypeScript 1.6 introduces intersection types, the logical complement of union types.
A union type `A | B` represents an entity that is either of type `A` or type `B`, whereas an intersection type `A & B` represents an entity that is both of type `A` *and* type `B`.

##### Example

```ts
function extend<T, U>(first: T, second: U): T & U {
    let result = <T & U> {};
    for (let id in first) {
        result[id] = first[id];
    }
    for (let id in second) {
        if (!result.hasOwnProperty(id)) {
            result[id] = second[id];
        }
    }
    return result;
}

var x = extend({ a: "hello" }, { b: 42 });
var s = x.a;
var n = x.b;
```

```ts
type LinkedList<T> = T & { next: LinkedList<T> };

interface Person {
    name: string;
}

var people: LinkedList<Person>;
var s = people.name;
var s = people.next.name;
var s = people.next.next.name;
var s = people.next.next.next.name;
```

```ts
interface A { a: string }
interface B { b: string }
interface C { c: string }

var abc: A & B & C;
abc.a = "hello";
abc.b = "hello";
abc.c = "hello";
```

See [issue #1256](https://github.com/Microsoft/TypeScript/issues/1256) for more information.

# Local type declarations

Local class, interface, enum, and type alias declarations can now appear inside function declarations. Local types are block scoped, similar to variables declared with `let` and `const`. For example:

```ts
function f() {
    if (true) {
        interface T { x: number }
        let v: T;
        v.x = 5;
    }
    else {
        interface T { x: string }
        let v: T;
        v.x = "hello";
    }
}
```

The inferred return type of a function may be a type declared locally within the function. It is not possible for callers of the function to reference such a local type, but it can of course be matched structurally. For example:

```ts
interface Point {
    x: number;
    y: number;
}

function getPointFactory(x: number, y: number) {
    class P {
        x = x;
        y = y;
    }
    return P;
}

var PointZero = getPointFactory(0, 0);
var PointOne = getPointFactory(1, 1);
var p1 = new PointZero();
var p2 = new PointZero();
var p3 = new PointOne();
```

Local types may reference enclosing type parameters and local class and interfaces may themselves be generic. For example:

```ts
function f3() {
    function f<X, Y>(x: X, y: Y) {
        class C {
            public x = x;
            public y = y;
        }
        return C;
    }
    let C = f(10, "hello");
    let v = new C();
    let x = v.x;  // number
    let y = v.y;  // string
}
```

# Class expressions

TypeScript 1.6 adds support for ES6 class expressions. In a class expression, the class name is optional and, if specified, is only in scope in the class expression itself. This is similar to the optional name of a function expression. It is not possible to refer to the class instance type of a class expression outside the class expression, but the type can of course be matched structurally. For example:

```ts
let Point = class {
    constructor(public x: number, public y: number) { }
    public length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
};
var p = new Point(3, 4);  // p has anonymous class type
console.log(p.length());
```

# Extending expressions

TypeScript 1.6 adds support for classes extending arbitrary expression that computes a constructor function. This means that built-in types can now be extended in class declarations.

The `extends` clause of a class previously required a type reference to be specified. It now accepts an expression optionally followed by a type argument list. The type of the expression must be a constructor function type with at least one construct signature that has the same number of type parameters as the number of type arguments specified in the `extends` clause. The return type of the matching construct signature(s) is the base type from which the class instance type inherits. Effectively, this allows both real classes and "class-like" expressions to be specified in the `extends` clause.

Some examples:

```ts
// Extend built-in types

class MyArray extends Array<number> { }
class MyError extends Error { }

// Extend computed base class

class ThingA {
    getGreeting() { return "Hello from A"; }
}

class ThingB {
    getGreeting() { return "Hello from B"; }
}

interface Greeter {
    getGreeting(): string;
}

interface GreeterConstructor {
    new (): Greeter;
}

function getGreeterBase(): GreeterConstructor {
    return Math.random() >= 0.5 ? ThingA : ThingB;
}

class Test extends getGreeterBase() {
    sayHello() {
        console.log(this.getGreeting());
    }
}
```

# `abstract` classes and methods

TypeScript 1.6 adds support for `abstract` keyword for classes and their methods. An abstract class is allowed to have methods with no implementation, and cannot be constructed.

##### Examples

```ts
abstract class Base {
    abstract getThing(): string;
    getOtherThing() { return 'hello'; }
}

let x = new Base(); // Error, 'Base' is abstract

// Error, must either be 'abstract' or implement concrete 'getThing'
class Derived1 extends Base { }

class Derived2 extends Base {
    getThing() { return 'hello'; }
    foo() {
        super.getThing();// Error: cannot invoke abstract members through 'super'
    }
}

var x = new Derived2(); // OK
var y: Base = new Derived2(); // Also OK
y.getThing(); // OK
y.getOtherThing(); // OK
```

# Generic type aliases

With TypeScript 1.6, type aliases can be generic. For example:

```ts
type Lazy<T> = T | (() => T);

var s: Lazy<string>;
s = "eager";
s = () => "lazy";

interface Tuple<A, B> {
    a: A;
    b: B;
}

type Pair<T> = Tuple<T, T>;
```

# Stricter object literal assignment checks

TypeScript 1.6 enforces stricter object literal assignment checks for the purpose of catching excess or misspelled properties. Specifically, when a fresh object literal is assigned to a variable or passed as an argument for a non-empty target type, it is an error for the object literal to specify properties that don't exist in the target type.

##### Examples

```ts
var x: { foo: number };
x = { foo: 1, baz: 2 };  // Error, excess property `baz`

var y: { foo: number, bar?: number };
y = { foo: 1, baz: 2 };  // Error, excess or misspelled property `baz`
```

A type can include an index signature to explicitly indicate that excess properties are permitted:

```ts
var x: { foo: number, [x: string]: any };
x = { foo: 1, baz: 2 };  // Ok, `baz` matched by index signature
```

# ES6 generators

TypeScript 1.6 adds support for generators when targeting ES6.

A generator function can have a return type annotation, just like a function. The annotation represents the type of the generator returned by the function. Here is an example:

```ts
function *g(): Iterable<string> {
    for (var i = 0; i < 100; i++) {
        yield ""; // string is assignable to string
    }
    yield * otherStringGenerator(); // otherStringGenerator must be iterable and element type assignable to string
}
```

A generator function with no type annotation can have the type annotation inferred.
So in the following case, the type will be inferred from the yield statements:

```ts
function *g() {
    for (var i = 0; i < 100; i++) {
        yield ""; // infer string
    }
    yield * otherStringGenerator(); // infer element type of otherStringGenerator
}
```

# Experimental support for `async` functions

TypeScript 1.6 introduces experimental support of `async` functions when targeting ES6.
Async functions are expected to invoke an asynchronous operation and await its result without blocking normal execution of the program.
This accomplished through the use of an ES6-compatible `Promise` implementation, and transposition of the function body into a compatible form to resume execution when the awaited asynchronous operation completes.

An *async function* is a function or method that has been prefixed with the `async` modifier. This modifier informs the compiler that function body transposition is required, and that the keyword `await` should be treated as a unary expression instead of an identifier.
An *Async Function* must provide a return type annotation that points to a compatible `Promise` type. Return type inference can only be used if there is a globally defined, compatible `Promise` type.

##### Example

```ts
var p: Promise<number> = /* ... */;
async function fn(): Promise<number> {
  var i = await p; // suspend execution until 'p' is settled. 'i' has type "number"
  return 1 + i;
}

var a = async (): Promise<number> => 1 + await p; // suspends execution.
var a = async () => 1 + await p; // suspends execution. return type is inferred as "Promise<number>" when compiling with --target ES6
var fe = async function(): Promise<number> {
  var i = await p; // suspend execution until 'p' is settled. 'i' has type "number"
  return 1 + i;
}

class C {
  async m(): Promise<number> {
    var i = await p; // suspend execution until 'p' is settled. 'i' has type "number"
    return 1 + i;
  }

  async get p(): Promise<number> {
    var i = await p; // suspend execution until 'p' is settled. 'i' has type "number"
    return 1 + i;
  }
}
```

# Nightly builds

While not strictly a language change, nightly builds are now available by installing with the following command:

```Shell
npm install -g typescript@next
```

# Adjustments in module resolution logic

Starting from release 1.6 TypeScript compiler will use different set of rules to resolve module names when targeting 'commonjs'.
These [rules](https://github.com/Microsoft/TypeScript/issues/2338) attempted to model module lookup procedure used by Node.
This effectively mean that node modules can include information about its typings and TypeScript compiler will be able to find it.
User however can override module resolution rules picked by the compiler by using `--moduleResolution` command line option. Possible values are:

* 'classic' - module resolution rules used by pre 1.6 TypeScript compiler
* 'node' - node-like module resolution

# Merging ambient class and interface declaration

The instance side of an ambient class declaration can be extended using an interface declaration The class constructor object is unmodified.
For example:

```ts
declare class Foo {
    public x : number;
}

interface Foo {
    y : string;
}

function bar(foo : Foo)  {
    foo.x = 1; // OK, declared in the class Foo
    foo.y = "1"; // OK, declared in the interface Foo
}
```

# User-defined type guard functions

TypeScript 1.6 adds a new way to narrow a variable type inside an `if` block, in addition to `typeof` and `instanceof`.
A user-defined type guard functions is one with a return type annotation of the form `x is T`, where `x` is a declared parameter in the signature, and `T` is any type.
When a user-defined type guard function is invoked on a variable in an `if` block, the type of the variable will be narrowed to `T`.

##### Examples

```ts
function isCat(a: any): a is Cat {
  return a.name === 'kitty';
}

var x: Cat | Dog;
if(isCat(x)) {
  x.meow(); // OK, x is Cat in this block
}
```

# `exclude` property support in tsconfig.json

A tsconfig.json file that doesn't specify a files property (and therefore implicitly references all *.ts files in all subdirectories) can now contain an exclude property that specifies a list of files and/or directories to exclude from the compilation.
The exclude property must be an array of strings that each specify a file or folder name relative to the location of the tsconfig.json file.
For example:

```json
{
    "compilerOptions": {
        "out": "test.js"
    },
    "exclude": [
        "node_modules",
        "test.ts",
        "utils/t2.ts"
    ]
}
```

The `exclude` list does not support wilcards. It must simply be a list of files and/or directories.

# `--init` command line option

Run `tsc --init` in a directory to create an initial `tsconfig.json` in this directory with preset defaults.
Optionally pass command line arguments along with `--init` to be stored in your initial tsconfig.json on creation.