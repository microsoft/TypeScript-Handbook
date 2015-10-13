# Introduction

With the introduction of Classes in TypeScript and ES6, there now exist certain scenarios that require additional features to support annotating or modifying classes and class members.
*Decorators* provide a way to add both annotations and a metaprogramming syntax for class declarations and members.
*Decorators* are a [stage 1 proposal](https://github.com/wycats/javascript-decorators/blob/master/README.md) for JavaScript and are available as an experimental feature of TypeScript.

> Decorators are an experimental feature that may change in future releases.

To enable experimental support for *Decorators*, you must enable the `experimentalDecorators` compiler option either on the commandline or in your `tsconfig.json`:

**command line**
```
tsc --target ES5 --experimentalDecorators
```

**tsconfig.json**
```json
{
    "compilerOptions": {
        "target": "ES5",
        "experimentalDecorators": true
    }
}
```

# Decorators

A *Decorator* is a special kind of declaration that can be attached to a class declaration, method, accessor, property, or parameter.
Decorators use the form:

&emsp;&emsp;*Decorator* **:** &emsp;`@`&emsp;*LeftHandSideExpression*

The *LeftHandSideExpression* here must evaluate to a function that will be called at runtime with information about the decorated declaration.
So a decorator that would call the `sealed` function would be written as: `@sealed`.

Since the *Decorator* is called as a function, we might write the `sealed` function as follows:

```ts
function sealed(target) {
    // do something with "target" ...
}
```

> You can see a more detailed example of a decorator in [Class Decorators](#class-decorators), below.

## Decorator Factories

If we want to customize how a decorator is applied to a declaration, we can write a *Decorator Factory*.
A *Decorator Factory* is simply a function that returns the expression that will be called at runtime.

We can write a decorator factory in the following fashion:

```ts
function color(value: string) { // this is the decorator factory
    return function (target) { // this is the decorator
        // do something with "target" and "value"...
    }
}
```

> You can see a more detailed example of a decorator factory in [Method/Accessor Decorators](#method-accessor-decorators), below.

## Decorator Composition

Multiple decorators can be applied to a declaration, as in the following examples: 

* On a single line:
  ```ts
  @f @g declaration
  ```
* On multiple lines:
  ```ts
  @f
  @g
  declaration
  ```

When multiple decorators apply to a single declaration, their evaluation is similar to [function composition in mathematics](http://en.wikipedia.org/wiki/Function_composition). 
As such, the following steps are performed when evaluating multiple decorators on a single declaration in TypeScript: 

1. The expressions for each decorator are evaluated top-to-bottom.
2. The results are then called as functions from bottom-to-top.

If we were to use decorator factories, we can observe this evaluation order with the following example:

```ts
function f() {
    console.log("f(): evaluated");
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log("f(): called");
    }
}

function g() {
    console.log("g(): evaluated");
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log("g(): called");
    }
}

class C {
    @f()
    @g()
    method() {}
}
```

Which would print this output to the console:
```
f(): evaluated
g(): evaluated
g(): called
f(): called
```

## Decorator Evaluation

There is also a well defined order to how decorators applied to various declarations inside of a class are applied. 

1. *Parameter Decorators*, followed by *Method* or *Property Decorators* are applied for each instance member.
2. *Parameter Decorators*, followed by *Method* or *Property Decorators* are applied for each static member.
3. *Parameter Decorators* are applied for the constructor.
4. *Class Decorators* are applied for the class.

## Class Decorators

A *Class Decorator* is declared just before a class declaration.
The *Class Decorator* is applied to the constructor of the class and can be used to observe, modify, or replace a class definition.
A *Class Decorator* cannot be used in a declaration file, or in any other ambient context (such as on a `declare` class).

The expression for the *Class Decorator* will be called as a function at runtime, with the constructor of the decorated class as its only argument.

The following is an example of a *Class Decorator* (`@sealed`) applied to the `Greeter` class:

```ts
@sealed
class Greeter {
    greeting: string;
    constructor(message: string) {
        this.greeting = message;
    }
    greet() {
        return "Hello, " + this.greeting;
    }
}
```

The `@sealed` decorator could be defined using the following function declaration: 

```ts
function sealed(constructor: Function) {
    Object.seal(constructor);
    Object.seal(constructor.prototype);
}
```

When `@sealed` is executed, it will seal both the constructor and its prototype.

## Method/Accessor Decorators

A *Method* or *Accessor Decorator* is declared just before a method or accessor declaration, respectively.
The *Method* or *Accessor Decorator* is applied to the *Property Descriptor* for the method, and can be used to observe, modify, or replace a method definition.
A *Method* or *Accessor Decorator* cannot be used in a declaration file, on an overload, or in any other ambient context (such as in a `declare` class).

> TypeScript disallows decorating both the `get` and `set` accessor for a single member.
  Instead, all decorators for the member must be applied to the first accessor specified in document order.
> This is because decorators apply to a *Property Descriptor*, which combines both the `get` and `set` accessor, not each declaration separately.

The expression for the *Method Decorator* will be called as a function at runtime, with the following three arguments:

1. Either the constructor function of the class for a static method, or the prototype of the class for an instance method.
2. The name of the method.
3. The *Property Descriptor* for the method.

> The *Property Descriptor* will be `undefined` if your script target is less than `ES5`.

If the *Method Decorator* returns a value, it will be used as the *Property Descriptor* for the method.

The following is an example of a *Method Decorator* (`@enumerable`) applied to the `Greeter` class:

```ts
class Greeter {
    greeting: string;
    constructor(message: string) {
        this.greeting = message;
    }
    
    @enumerable(false)
    greet() {
        return "Hello, " + this.greeting;
    }
}
```

We can define the `@enumerable` decorator using the following function declaration:

```ts
function enumerable(value: boolean) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        descriptor.enumerable = value;
    };
} 
```

The `@enumerable(false)` decorator here is a [Decorator Factory](#decorator-factories).
When the `@enumerable(false)` decorator is called, it modifies the `enumerable` property of the property descriptor.

## Property Decorators

A *Property Decorator* is declared just before a property declaration.
A *Property Decorator* cannot be used in a declaration file, or in any other ambient context (such as in a `declare` class).

The expression for the *Property Decorator* will be called as a function at runtime, with the following two arguments:

1. Either the constructor function of the class for a static property, or the prototype of the class for an instance property.
2. The name of the property.

A *Property Descriptor* is not provided as an argument to a *Property Decorator* due to how property decorators are initialized in TypeScript.
This is because there is currently no mechanism to describe an instance property when defining members of a prototype, and no way to observe or modify the initializer for a property.
As such, a *Property Decorator* can only be used to observe that a property of a specific name has been declared for a class.

We can use this information to record metadata about the property, as in the following example:

```ts
class Greeter {
    @format("Hello, %s")
    greeting: string;
    
    constructor(message: string) {
        this.greeting = message;
    }
    greet() {
        let formatString = getFormat(this, "greeting");
        return formatString.replace("%s", this.greeting);
    }
}
```

We can then define the `@format` decorator and `getFormat` functions using the following function declarations:

```ts
import "reflect-metadata";

const formatMetadataKey = Symbol("format");

function format(formatString: string) {
    return Reflect.metadata(formatMetadataKey, formatString);
}

function getFormat(target: any, propertyKey: string) {
    return Reflect.getMetadata(formatMetadataKey, target, propertyKey);
}
```

The `@format("Hello, %s")` decorator here is a [Decorator Factory](#decorator-factories).
When `@format("Hello, %s")` is called, it adds a metadata entry for the property using the `Reflect.metadata` function from the `reflect-metadata` library.
When `getFormat` is called, it reads the metadata value for the format.

> This example requires the `reflect-metadata` library.
  See [Metadata](#metadata) for more information about the `reflect-metadata` library.

## Parameter Decorators

A *Parameter Decorator* is declared just before a parameter declaration.
The *Parameter Decorator* is applied to the function for a class constructor or method declaration.
A *Parameter Decorator* cannot be used in a declaration file, an overload, or in any other ambient context (such as in a `declare` class).

The expression for the *Parameter Decorator* will be called as a function at runtime, with the following two arguments:

1. The function containing the decorated parameter.
2. The ordinal index of the parameter in the function's parameter list.

A *Parameter Decorator* can only be used to observe that a parameter has been declared on a method. 

The following is an example of a *Parameter Decorator* (`@required`) applied to `Greeter` class:

```ts
class Greeter {
    greeting: string;

    constructor(message: string) {
        this.greeting = message;
    }
    
    @validate
    greet(@required name: string) {
        return "Hello " + name + ", " + this.greeting;
    }
}
```

We can then define the `@required` and `@validate` decorators using the following function declarations:

```ts
import "reflect-metadata";

const requiredMetadataKey = Symbol("required");

function required(target: Function, parameterIndex: number) {
    Reflect.defineMetadata(requiredMetadataKey, true, target, parameterIndex);
}

function validate(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
    let method = descriptor.value;
    descriptor.value = function () {
        for (let parameterIndex = 0; parameterIndex < method.length; parameterIndex++) {
            if (Reflect.getOwnMetadata(requiredMetadataKey, method, parameterIndex)) {
                if (parameterIndex >= arguments.length || arguments[parameterIndex] === undefined) {
                    throw new Error("Missing required argument.");
                }
            }
        }
        
        return method.apply(this, arguments);
    }
}
```

The `@required` decorator adds a metadata entry that marks the parameter as required.
The `@validate` decorator then wraps the existing `greet` method in a function that validates the arguments before invoking the original method.

> This example requires the `reflect-metadata` library.
  See [Metadata](#metadata) for more information about the `reflect-metadata` library.

## Metadata

Some examples use the `reflect-metadata` library which adds a polyfill for an [experimental metadata API](https://github.com/rbuckton/ReflectDecorators).
This library is not yet part of the JavaScript standard.
However, once Decorators are officially adopted as part of the JavaScript standard these extensions will be proposed for adoption.

You can install this library via npm:

```
npm i reflect-metadata --save
```

TypeScript includes experimental support for emitting certain types of metadata for declarations that have decorators.
To enable this experimental support, you must set the `emitDecoratorMetadata` compiler option either on the commandline or in your `tsconfig.json`.
When enabled, as long as the `reflect-metadata` library has been imported, additional design-time type information will be exposed at runtime.

We can see this in action in the following example:

```ts
import "reflect-metadata";

class Point {
    x: number;
    y: number;
}

class Line {
    private _p0: Point;
    private _p1: Point;
    
    @validate
    set p0(value: Point) { this._p0 = value; }
    get p0() { return this._p0; }
    
    @validate
    set p1(value: Point) { this._p1 = value; }
    get p1() { return this._p1; }
}

function validate<T>(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<T>) {
    let set = descriptor.set;
    descriptor.set = function (value: T) {
        let type = Reflect.getMetadata("design:type", target, propertyKey);
        if (!(value instanceof type)) {
            throw new TypeError("Invalid type.");
        }
    }
}
```

The TypeScript compiler will inject design-time type information using the `@Reflect.metadata` decorator.
You could consider it the equivalent of the following TypeScript:

```ts
class Line {
    private _p0: Point;
    private _p1: Point;
    
    @validate
    @Reflect.metadata("design:type", Point)
    set p0(value: Point) { this._p0 = value; }
    get p0() { return this._p0; }
    
    @validate
    @Reflect.metadata("design:type", Point)
    set p1(value: Point) { this._p1 = value; }
    get p1() { return this._p1; }
}

```

> Decorator Metadata is an experimental feature and may introduce breaking changes in future releases.