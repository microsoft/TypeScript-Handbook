## Speed improvements

TypeScript 3.5 introduces several optimizations around type-checking and incremental builds.

### Type-checking speed-ups

TypeScript 3.5 contains certain optimizations over TypeScript 3.4 for type-checking more efficiently.
These improvements are significantly more pronounced in editor scenarios where type-checking drives operations like code completion lists.

### `--incremental` improvements

TypeScript 3.5 improves on 3.4's `--incremental` build mode, by saving information about how the state of the world was calculated - compiler settings, why files were looked up, where files were found, etc.
In scenarios involving hundreds of projects using TypeScript's project references in `--build` mode, [we've found that the amount of time rebuilding can be reduced by as much as 68% compared to TypeScript 3.4](https://github.com/Microsoft/TypeScript/pull/31101)!

For more details, you can see the pull requests to

* [cache module resolution](https://github.com/Microsoft/TypeScript/pull/31100)
* [cache settings calculated from `tsconfig.json`](https://github.com/Microsoft/TypeScript/pull/31101)

## The `Omit` helper type

TypeScript 3.5 introduces the new `Omit` helper type, which creates a new type with some properties dropped from the original.

```ts
type Person = {
    name: string;
    age: number;
    location: string;
};

type QuantumPerson = Omit<Person, "location">;

// equivalent to
type QuantumPerson = {
    name: string;
    age: number;
};
```

Here we were able to copy over all the properties of `Person` except for `location` using the `Omit` helper.

For more details, [see the pull request on GitHub to add `Omit`](https://github.com/Microsoft/TypeScript/pull/30552), as well as [the change to use `Omit` for object rest](https://github.com/microsoft/TypeScript/pull/31134).

### Improved excess property checks in union types

In TypeScript 3.4 and earlier, certain excess properties were allowed in situations where they really shouldn't have been.
For instance, TypeScript 3.4 permitted the incorrect `name` property in the object literal even though its types don't match between `Point` and `Label`.

```ts
type Point = {
    x: number;
    y: number;
};

type Label = {
    name: string;
};

const thing: Point | Label = {
    x: 0,
    y: 0,
    name: true // uh-oh!
};
```

Previously, a non-disciminated union wouldn't have *any* excess property checking done on its members, and as a result, the incorrectly typed `name` property slipped by.

In TypeScript 3.5, the type-checker at least verifies that all the provided properties belong to *some* union member and have the appropriate type, meaning that the sample above correctly issues an error.

Note that partial overlap is still permitted as long as the property types are valid.

```ts
const pl: Point | Label = {
    x: 0,
    y: 0,
    name: "origin" // okay
};
```

## The `--allowUmdGlobalAccess` flag

In TypeScript 3.5, you can now reference UMD global declarations like

```
export as namespace foo;
```

from anywhere - even modules - using the new `--allowUmdGlobalAccess` flag.

This mode adds flexibility for mixing and matching the way 3rd party libraries, where globals that libraries declare can always be consumed, even from within modules.

For more details, [see the pull request on GitHub](https://github.com/Microsoft/TypeScript/pull/30776/files).

## Smarter union type checking

In TypeScript 3.4 and prior, the following example would fail:

```ts
type S = { done: boolean, value: number }
type T =
    | { done: false, value: number }
    | { done: true, value: number };

declare let source: S;
declare let target: T;

target = source;
```

That's because `S` isn't assignable to `{ done: false, value: number }` nor `{ done: true, value: number }`.
Why?
Because the `done` property in `S` isn't specific enough - it's `boolean` whereas each constituent of `T` has a `done` property that's specifically `true` or `false`.
That's what we meant by each constituent type being checked in isolation: TypeScript doesn't just union each property together and see if `S` is assignable to that.
If it did, some bad code could get through like the following:

```ts
interface Foo {
    kind: "foo";
    value: string;
}

interface Bar {
    kind: "bar";
    value: number;
}

function doSomething(x: Foo | Bar) {
    if (x.kind === "foo") {
        x.value.toLowerCase();
    }
}

// uh-oh - luckily TypeScript errors here!
doSomething({
    kind: "foo",
    value: 123,
});
```

However, this was a bit overly strict for the original example.
If you figure out the precise type of any possible value of `S`, you can actually see that it matches the types in `T` exactly.

In TypeScript 3.5, when assigning to types with discriminant properties like in `T`, the language actually *will* go further and decompose types like `S` into a union of every possible inhabitant type.
In this case, since `boolean` is a union of `true` and `false`, `S` will be viewed as a union of `{ done: false, value: number }` and `{ done: true, value: number }`.

For more details, you can [see the original pull request on GitHub](https://github.com/microsoft/TypeScript/pull/30779).

## Higher order type inference from generic constructors

In TypeScript 3.4, we improved inference for when generic functions that return functions like so:

```ts
function compose<T, U, V>(
    f: (x: T) => U, g: (y: U) => V): (x: T) => V {
    
    return x => g(f(x))
}
```

took other generic functions as arguments, like so:

```ts
function arrayify<T>(x: T): T[] {
    return [x];
}

type Box<U> = { value: U }
function boxify<U>(y: U): Box<U> {
    return { value: y };
}

let newFn = compose(arrayify, boxify);
```

Instead of a relatively useless type like `(x: {}) => Box<{}[]>`, which older versions of the language would infer, TypeScript 3.4's inference allows `newFn` to be generic.
Its new type is `<T>(x: T) => Box<T[]>`.

TypeScript 3.5 generalizes this behavior to work on constructor functions as well.

```ts
class Box<T> {
    kind: "box";
    value: T;
    constructor(value: T) {
        this.value = value;
    }
}

class Bag<U> {
    kind: "bag";
    value: U;
    constructor(value: U) {
        this.value = value;
    }
}


function composeCtor<T, U, V>(
    F: new (x: T) => U, G: new (y: U) => V): (x: T) => V {
    
    return x => new G(new F(x))
}

let f = composeCtor(Box, Bag); // has type '<T>(x: T) => Bag<Box<T>>'
let a = f(1024); // has type 'Bag<Box<number>>'
```

In addition to compositional patterns like the above, this new inference on generic constructors means that functions that operate on class components in certain UI libraries like React can more correctly operate on generic class components.

```ts
type ComponentClass<P> = new (props: P) => Component<P>;
declare class Component<P> {
    props: P;
    constructor(props: P);
}

declare function myHoc<P>(C: ComponentClass<P>): ComponentClass<P>;

type NestedProps<T> = { foo: number, stuff: T };

declare class GenericComponent<T> extends Component<NestedProps<T>> {
}

// type is 'new <T>(props: NestedProps<T>) => Component<NestedProps<T>>'
const GenericComponent2 = myHoc(GenericComponent);
```

To learn more, [check out the original pull request on GitHub](https://github.com/microsoft/TypeScript/pull/31116).
