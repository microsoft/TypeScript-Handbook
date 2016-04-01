# Introduction

When using an external JavaScript library, or new host API, you'll need to use a declaration file (.d.ts) to describe the shape of that library.
This guide covers a few high-level concepts specific to writing declaration files, then proceeds with a number of examples that show how to transcribe various concepts to their matching declaration file descriptions.

# Guidelines and Specifics

## Workflow

The best way to write a .d.ts file is to start from the documentation of the library, not the code.
Working from the documentation ensures the surface you present isn't muddied with implementation details, and is typically much easier to read than JS code.
The examples below will be written as if you were reading documentation that presented example calling code.

## Namespacing

When defining interfaces (for example, "options" objects), you have a choice about whether to put these types inside a namespace or not.
This is largely a judgement call -- if the consumer is likely to often declare variables or parameters of that type, and the type can be named without risk of colliding with other types, prefer placing it in the global namespace.
If the type is not likely to be referenced directly, or can't be named with a reasonably unique name, do use a namespace to prevent it from colliding with other types.

## Callbacks

Many JavaScript libraries take a function as a parameter, then invoke that function later with a known set of arguments.
When writing the function signatures for these types, *do not* mark those parameters as optional.
The right way to think of this is *"What parameters will be provided?"*, not *"What parameters will be consumed?"*.
While TypeScript 0.9.7 and above does not enforce that the optionality, bivariance on argument optionality might be enforced by an external linter.

## Extensibility and Declaration Merging

When writing declaration files, it's important to remember TypeScript's rules for extending existing objects.
You might have a choice of declaring a variable using an anonymous type or an interface type:

#### Anonymously-typed var

```ts
declare var MyPoint: { x: number; y: number; };
```

#### Interfaced-typed var

```ts
interface SomePoint { x: number; y: number; }
declare var MyPoint: SomePoint;
```

From a consumption side these declarations are identical, but the type `SomePoint` can be extended through interface merging:

```ts
interface SomePoint { z: number; }
MyPoint.z = 4; // OK
```

Whether or not you want your declarations to be extensible in this way is a bit of a judgement call.
As always, try to represent the intent of the library here.

## Class Decomposition

Classes in TypeScript create two separate types: the instance type, which defines what members an instance of a class has, and the constructor function type, which defines what members the class constructor function has.
The constructor function type is also known as the "static side" type because it includes static members of the class.

While you can reference the static side of a class using the `typeof` keyword, it is sometimes useful or necessary when writing declaration files to use the *decomposed class* pattern which explicitly separates the instance and static types of class.

As an example, the following two declarations are nearly equivalent from a consumption perspective:

#### Standard

```ts
class A {
    static st: string;
    inst: number;
    constructor(m: any) {}
}
```

#### Decomposed

```ts
interface A_Static {
    new(m: any): A_Instance;
    st: string;
}
interface A_Instance {
    inst: number;
}
declare var A: A_Static;
```

The trade-offs here are as follows:

* Standard classes can be inherited from using `extends`; decomposed classes cannot. This might change in later version of TypeScript if arbitrary `extends` expressions are allowed.
* It is possible to add members later (through declaration merging) to the static side of both standard and decomposed classes
* It is possible to add instance members to decomposed classes, but not standard classes
* You'll need to come up with sensible names for more types when writing a decomposed class

## Naming Conventions

In general, you shouldn't prefix interfaces with `I` (e.g. `IColor`).
Because the concept of an interface in TypeScript is much more broad than in C# or Java, the `IFoo` naming convention is not broadly useful.

# Examples

Let's jump in to the examples section. For each example, sample *usage* of the library is provided, followed by the declaration code that accurately types the usage.
When there are multiple good representations, more than one declaration sample might be listed.

## Options Objects

#### Usage

```ts
animalFactory.create("dog");
animalFactory.create("giraffe", { name: "ronald" });
animalFactory.create("panda", { name: "bob", height: 400 });
// Invalid: name must be provided if options is given
animalFactory.create("cat", { height: 32 });
```

#### Typing

```ts
namespace animalFactory {
    interface AnimalOptions {
        name: string;
        height?: number;
        weight?: number;
    }
    function create(name: string, animalOptions?: AnimalOptions): Animal;
}
```

## Functions with Properties

#### Usage

```ts
zooKeeper.workSchedule = "morning";
zooKeeper(giraffeCage);
```

#### Typing

```ts
// Note: Function must precede namespace
function zooKeeper(cage: AnimalCage);
namespace zooKeeper {
    var workSchedule: string;
}
```

## New + callable methods

#### Usage

```ts
var w = widget(32, 16);
var y = new widget("sprocket");
// w and y are both widgets
w.sprock();
y.sprock();
```

#### Typing

```ts
interface Widget {
    sprock(): void;
}

interface WidgetFactory {
    new(name: string): Widget;
    (width: number, height: number): Widget;
}

declare var widget: WidgetFactory;
```

## Global / External-agnostic Libraries

#### Usage

```ts
// Either
import x = require('zoo');
x.open();
// or
zoo.open();
```

#### Typing

```ts
declare namespace zoo {
  function open(): void;
}

declare module "zoo" {
    export = zoo;
}
```

## Single Complex Object in Modules

#### Usage

```ts
// Super-chainable library for eagles
import Eagle = require('./eagle');

// Call directly
Eagle('bald').fly();

// Invoke with new
var eddie = new Eagle('Mille');

// Set properties
eddie.kind = 'golden';
```

#### Typing

```ts
interface Eagle {
    (kind: string): Eagle;
    new (kind: string): Eagle;

    kind: string;
    fly(): void
}

declare var Eagle: Eagle;

export = Eagle;
```

## Function as an Module

This is a common pattern for modules whose imported entities are callable functions.

#### Usage

```ts
import sayHello = require("say-hello");
sayHello("Travis");
```

#### Typing

```ts
declare module "say-hello" {
    function sayHello(name: string): void;
    export = sayHello;
}
```

## Callbacks

#### Usage

```ts
addLater(3, 4, x => console.log('x = ' + x));
```

#### Typing

```ts
// Note: 'void' return type is preferred here
function addLater(x: number, y: number, (sum: number) => void): void;
```

Please post a comment [here](https://github.com/Microsoft/TypeScript-Handbook/issues) if there's a pattern you'd like to see documented!
We'll add to this as we can.
