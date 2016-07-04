# Definition Files by Example

## Introduction

The purpose of this guide is to teach you how to write a high-quality definition file.
This guide is structured by showing an example *usage* and *documentation*,
  and explaining how to write the corresponding declaration.

These examples are ordered in approximately increasing order of complexity.

* [Global variable](#global-variable)
* [Global function](#global-function)
* [Object with Properties](#object-with-properties)
* [Overloaded function](#overloaded-function)
* [Reusable Types (Global)](#reusable-types-global)
* [Classes](#classes)

## The Examples

### Global variables

*Documentation*
> The global variable `foo` contains the number of widgets present.

*Code*

```ts
console.log('Half the number of widgets is ' + (foo / 2));
```

*Declaration*
Use `declare var` to declare variables.
If the variable is read-only, you can use `declare const`.
You can also use `declare let` if the variable is block-scoped.

```ts
/** The number of widgets present */
declare var foo: number;
```

### Global functions

*Documentation*
> You can invoke the function `greet` with a string to show a greeting to the user.

*Code*

```ts
greet('hello, world');
```

*Declaration*

Use `declare function` to declare functions.

```ts
declare function greet(greeting: string): void;
```

### Objects with Properties

*Documentation*
> The global variable `myLib` has a function `makeGreeting` for creating greetings,
> and a property `numberOfGreetings` indicating the number of greetings made so far.

*Code*

```ts
var result = myLib.makeGreeting('hello, world');
console.log('The computed greeting is:' + result);
var count = myLib.numberOfGreetings;
```

*Declaration*

Use `declare namespace` to describe types or values accessed by dotted notation.

```ts
declare namespace myLib {
    function makeGreeting(s: string): string;
    let numberOfGreetings: number;
}
```

### Overloaded functions

*Documentation*
> The `getWidget` function accepts a number and return a Widget, or accepts a string and returns a Widget array

*Code*

```ts
let x: Widget = getWidget(43);
let arr = getWidget('all of them'); // arr: Widget[]
```

*Declaration*

```ts
declare function getWidget(n: number): Widget;
declare function getWidget(s: string): Widget[];
```

### Reusable Types (interfaces)

*Documentation*
> When specifying a greeting, you must pass a GreetingSettings object.
> This object has the following properties:
> - greeting: Mandatory string
> - duration: Optional length of time (in milliseconds)
> - color: Optional string, e.g. '#ff00ff'

*Code*

```ts
greet({
  greeting: 'hello world',
  duration: 4000
});
```

*Declaration*

Use `interface` to define a type with properties.

```ts
interface GreetingSettings {
  greeting: string;
  duration?: number;
  color?: string;
}
declare function greet(setting: GreetingSettings): void;
```

### Reusable Types (type aliases)

*Documentation*
> Anywhere a greeting is expected, you can provide a `string`,
> a function returning a `string`, or a `Greeter` class.

*Code*

```ts
function getGreeting() {
    return 'howdy';
}
class MyGreeter extends Greeter { }

greet('hello');
greet(getGreeting);
greet(new MyGreeter());
```

*Declaration*

You can use a type alias to make a shorthand for a type:

```ts
type GreetingLike = string | (() => string) | Greeting;

declare function greet(g: GreetingLike): void;
```

### Organizing Types

*Documentation*
> The `greeter` object can log to a file, or display an alert.
> You can provide LogOptions to `.log(...)` or alert options to `.alert(...)`

*Code*

```ts
const g = new Greeter('Hello');
g.log({ verbose: true });
g.alert({ modal: false, title: 'Current Greeting' });
```

*Declaration*

Use namespaces to organize types.

```ts
declare namespace GreetingLib {
    interface LogOptions {
        verbose?: boolean;
    }
    interface AlertOptions {
        modal: boolean;
        title?: string;
        color?: string;
    }
}
```

You can also created nested namespaces in one declaration:

```ts
declare namespace GreetingLib.Options {
    // Refer to via GreetingLib.Options.Log
    interface Log {
        verbose?: boolean;
    }
    interface Alert {
        modal: boolean;
        title?: string;
        color?: string;
    }
}
```

### Classes

*Documentation*
> You can create a greeter by instantiating the `Greeter` object,
> or create a customized greeter by extending from it.

*Code*

```ts
const myGreeter = new Greeter('hello, world');
myGreeter.greeting = 'howdy';
myGreeter.showGreeting();

class SpecialGreeter extends Greeter {
    constructor() {
        super('Very special greetings');
    }
}
```

*Declaration*
Use `declare class` to describe a class or classlike object.
Classes can have properties and methods as well as a constructor.

```ts
declare class Greeter {
    constructor(greeting: string);

    greeting: string;
    showGreeting(): void;
}
```

<!-- Template

###

*Documentation*
>

*Code*

```ts

```

*Declaration*

```ts

```

-->
