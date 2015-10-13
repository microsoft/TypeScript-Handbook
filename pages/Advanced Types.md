# Introduction

TODO

# Union Types

Occasionally, you'll run into a library that expects or gives back a `number` or `string`.
For instance, take the following function:

```TypeScript
/**
 * Takes a string and adds "padding" to the left.
 * If 'padding' is a string, then 'padding' is appended to the left side.
 * If 'padding' is a number, then that number of spaces is added to the left side.
 */
function padLeft(value: string, padding: any) {
    // ...
}
```

The problem with `padLeft` is that its `padding` parameter is typed as `any`.
That means that we can call it with an argument that's neither a `number` nor a `string`, but TypeScript will be okay with it.

```TypeScript
let indentedString = padLeft("Hello world", true); // passes at compile time, fails at runtime.
```

Instead of `any`, we can use a *union type* for `padding`:

```TypeScript
/**
 * Takes a string and adds "padding" to the left.
 * If 'padding' is a string, then 'padding' is appended to the left side.
 * If 'padding' is a number, then that number of spaces is added to the left side.
 */
function padLeft(value: string, padding: any) {
    // ...
}

let indentedString = padLeft("Hello world", true); // errors during compilation
```

A union type describes a value that can be one of several types.
We use the vertical bar (`|`) to separate each type, so `number | string | boolean` is the type of a value that can be a `number`, a `string`, or a `boolean`.

If we have a value that has a union type, we can only access members that are common to all types in the union. 
 
```TypeScript
interface Bird {
    fly();
    layEggs();
}

interface Fish {
    swim();
    layEggs();
}

function getSmallPet(): Fish | Bird {
    // ...
}

let pet = getSmallPet();
pet.layEggs(); // okay
pet.swim();    // errors
```

Union types can be a bit tricky here, but it just takes a bit of intuition to get used to.
If a value has the type `A | B`, we only know for *certain* that it has members that both `A` *and* `B` have.
On the other hand, in the example above `Bird` has a member named `fly`.
We can't be sure whether a variable typed as `Bird | Fish` has a `fly` method.
If the variable is really a `B` at runtime, then calling `pet.fly()` will fail.  

# Type Guards

TODO

# Type Aliases

Type aliases create a new name for a type.
Type aliases are sometimes similar to interfaces, but can name primitives, unions, tuples, and any other types that you'd otherwise have to write by hand.

```TypeScript
type XCoord = number;
type YCoord = number;
type Coordinate = { x: XCoord; y: YCoord };
type CoordList = Coordinate[];

let coord: CoordList = [{ x: 10, y: 10}, { x: 0, y: 42 }];
```

Aliasing `number` like in the above example doesn't actually create a new type - it creates a new *name* to refer to that type.
So `10` is a perfectly valid `XCoord` and `YCoord` (and perhaps dangerously, `XCoord` is a perfectly valid `YCoord`).
Aliasing a primitive is not terribly useful, though it can be used as a form of documentation.

Just like interfaces, type aliases can also be generic - we can just add type parameters and use them on the right side of the alias declaration:

```TypeScript
type Container<T> = { value: T };
```

We can also have a type alias refer to itself in a property, 

```TypeScript
type Tree<T> = {
    value: T;
    left: Tree<T>;
    right: Tree<T>;
}
```

Unfortunately, it's not possible for a type alias to appear anywhere else on the right side of the declaration:

```TypeScript
type Yikes = Array<Yikes>; // errors
```

## Interfaces vs. Type Aliases

As we mentioned, type aliases can act sort of like interfaces; however, there are some subtle differences.

One important difference is that type aliases cannot be extended or implemented from (nor can they extend/implement).
Because you should usually try to leave your types open to extension, you should always use an interface over a type alias if possible.

On the other hand, if you can't express some shape with an interface and you need to use a union or tuple type, type aliases are usually the way to go.