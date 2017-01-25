# Definition File Theory: A Deep Dive

Structuring modules to give the exact API shape you want can be tricky.
For example, we might want a module that can be invoked with or without `new` to produce different types,
  has a variety of named types exposed in a hierarchy,
  and has some properties on the module object as well.

By reading this guide, you'll have the tools to write complex definition files that expose a friendly API surface.
This guide focuses on module (or UMD) libraries because the options here are more varied.

## Key Concepts

You can fully understand how to make any shape of definition
  by understanding some key concepts of how TypeScript works.

### Types

If you're reading this guide, you probably already roughly know what a type in TypeScript is.
To be more explicit, though, a *type* is introduced with:

* A type alias declaration (`type sn = number | string;`)
* An interface declaration (`interface I { x: number[]; }`)
* A class declaration (`class C { }`)
* An enum declaration (`enum E { A, B, C }`)
* An `import` declaration which refers to a type

Each of these declaration forms creates a new type name.

### Values

As with types, you probably already understand what a value is.
Values are runtime names that we can reference in expressions.
For example `let x = 5;` creates a value called `x`.

Again, being explicit, the following things create values:

* `let`, `const`, and `var` declarations
* A `namespace` or `module` declaration which contains a value
* An `enum` declaration
* A `class` declaration
* An `import` declaration which refers to a value
* A `function` declaration

### Namespaces

Types can exist in *namespaces*.
For example, if we have the declaration `let x: A.B.C`,
  we say that the type `C` comes from the `A.B` namespace.

This distinction is subtle and important -- here, `A.B` is not necessarily a type or a value.

## Simple Combinations: One name, multiple meanings

Given a name `A`, we might find up to three different meanings for `A`: a type, a value or a namespace.
How the name is interpreted depends on the context in which it is used.
For example, in the declaration `let m: A.A = A;`,
  `A` is used first as a namespace, then as a type name, then as a value.
These meanings might end up referring to entirely different declarations!

This may seem confusing, but it's actually very convenient as long as we don't excessively overload things.
Let's look at some useful aspects of this combining behavior.

### Built-in Combinations

Astute readers will notice that, for example, `class` appeared in both the *type* and *value* lists.
The declaration `class C { }` creates two things:
  a *type* `C` which refers to the instance shape of the class,
  and a *value* `C` which refers to the constructor function of the class.
Enum declarations behave similarly.

### User Combinations

Let's say we wrote a module file `foo.d.ts`:

```ts
export var SomeVar: { a: SomeType };
export interface SomeType {
  count: number;
}
```

Then consumed it:

```ts
import * as foo from './foo';
let x: foo.SomeType = foo.SomeVar.a;
console.log(x.count);
```

This works well enough, but we might imagine that `SomeType` and `SomeVar` were very closely related
  such that you'd like them to have the same name.
We can use combining to present these two different objects (the value and the type) under the same name `Bar`:

```ts
export var Bar: { a: Bar };
export interface Bar {
  count: number;
}
```

This presents a very good opportunity for destructuring in the consuming code:

```ts
import { Bar } from './foo';
let x: Bar = Bar.a;
console.log(x.count);
```

Again, we've used `Bar` as both a type and a value here.
Note that we didn't have to declare the `Bar` value as being of the `Bar` type -- they're independent.

## Advanced Combinations

Some kinds of declarations can be combined across multiple declarations.
For example, `class C { }` and `interface C { }` can co-exist and both contribute properties to the `C` types.

This is legal as long as it does not create a conflict.
A general rule of thumb is that values always conflict with other values of the same name unless they are declared as `namespace`s,
  types will conflict if they are declared with a type alias declaration (`type s = string`),
  and namespaces never conflict.

Let's see how this can be used.

### Adding using an `interface`

We can add additional members to an `interface` with another `interface` declaration:

```ts
interface Foo {
  x: number;
}
// ... elsewhere ...
interface Foo {
  y: number;
}
let a: Foo = ...;
console.log(a.x + a.y); // OK
```

This also works with classes:

```ts
class Foo {
  x: number;
}
// ... elsewhere ...
interface Foo {
  y: number;
}
let a: Foo = ...;
console.log(a.x + a.y); // OK
```

Note that we cannot add to type aliases (`type s = string;`) using an interface.

### Adding using a `namespace`

A `namespace` declaration can be used to add new types, values, and namespaces in any way which does not create a conflict.

For example, we can add a static member to a class:

```ts
class C {
}
// ... elsewhere ...
namespace C {
  export let x: number;
}
let y = C.x; // OK
```

Note that in this example, we added a value to the *static* side of `C` (its constructor function).
This is because we added a *value*, and the container for all values is another value
  (types are contained by namespaces, and namespaces are contained by other namespaces).

We could also add a namespaced type to a class:

```ts
class C {
}
// ... elsewhere ...
namespace C {
  export interface D { }
}
let y: C.D; // OK
```

In this example, there wasn't a namespace `C` until we wrote the `namespace` declaration for it.
The meaning `C` as a namespace doesn't conflict with the value or type meanings of `C` created by the class.

Finally, we could perform many different merges using `namespace` declarations.
This isn't a particularly realistic example, but shows all sorts of interesting behavior:

```ts
namespace X {
  export interface Y { }
  export class Z { }
}

// ... elsewhere ...
namespace X {
  export var Y: number;
  export namespace Z {
    export class C { }
  }
}
type X = string;
```

In this example, the first block creates the following name meanings:

* A value `X` (because the `namespace` declaration contains a value, `Z`)
* A namespace `X` (because the `namespace` declaration contains a type, `Y`)
* A type `Y` in the `X` namespace
* A type `Z` in the `X` namespace (the instance shape of the class)
* A value `Z` that is a property of the `X` value (the constructor function of the class)

The second  block creates the following name meanings:

* A value `Y` (of type `number`) that is a property of the `X` value
* A namespace `Z`
* A value `Z` that is a property of the `X` value
* A type `C` in the `X.Z` namespace
* A value `C` that is a property of the `X.Z` value
* A type `X`

## Using with `export =` or `import`

An important rule is that `export` and `import` declarations export or import *all meanings* of their targets.

<!-- TODO: Write more on that. -->
