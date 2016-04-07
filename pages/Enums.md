# Enums

Enums allow us to define a set of named numeric constants.
An enum can be defined using the `enum` keyword.

```ts
enum Direction {
    Up = 1,
    Down,
    Left,
    Right
}
```

The body of an enum consists of zero or more enum members.
Enum members have numeric value associated with them and can be either *constant* or *computed*.
An enum member is considered constant if:

* It does not have an initializer and the preceding enum member was constant.
    In this case the value of the current enum member will be the value of the preceding enum member plus one.
    One exception to this rule is the first element on an enum.
    If it does not have initializer it is assigned the value `0`.
* The enum member is initialized with a constant enum expression.
    A constant enum expression is a subset of TypeScript expressions that can be fully evaluated at compile time.
    An expression is a constant enum expression if it is either:
    * numeric literal
    * reference to previously defined constant enum member (it can be defined in different enum).
        If member is defined in the same enum it can be referenced using unqualified name.
    * parenthesized constant enum expression
    * `+`, `-`, `~` unary operators applied to constant enum expression
    * `+`, `-`, `*`, `/`, `%`, `<<`, `>>`, `>>>`, `&`, `|`, `^` binary operators with constant enum expressions as operands
    It is a compile time error for constant enum expressions to be evaluated to `NaN` or `Infinity`.

In all other cases enum member is considered computed.

```ts
enum FileAccess {
    // constant members
    None,
    Read    = 1 << 1,
    Write   = 1 << 2,
    ReadWrite  = Read | Write,
    // computed member
    G = "123".length
}
```

Enums are real objects that exist at runtime.
One reason is the ability to maintain a reverse mapping from enum values to enum names.

```ts
enum Enum {
    A
}
let a = Enum.A;
let nameOfA = Enum[Enum.A]; // "A"
```

is compiled to:

```js
var Enum;
(function (Enum) {
    Enum[Enum["A"] = 0] = "A";
})(Enum || (Enum = {}));
var a = Enum.A;
var nameOfA = Enum[Enum.A]; // "A"
```

In generated code an enum is compiled into an object that stores both forward (`name` -> `value`) and reverse (`value` -> `name`) mappings.
References to enum members are always emitted as property accesses and never inlined.
In lots of cases this is a perfectly valid solution.
However sometimes requirements are tighter.
To avoid paying the cost of extra generated code and additional indirection when accessing enum values it is possible to use const enums.
Const enums are defined using the `const` modifier that precedes the `enum` keyword.

```ts
const enum Enum {
    A = 1,
    B = A * 2
}
```

Const enums can only use constant enum expressions and unlike regular enums they are completely removed during compilation.
Const enum members are inlined at use sites.
This is possible since const enums cannot have computed members.

```ts
const enum Directions {
    Up,
    Down,
    Left,
    Right
}

let directions = [Directions.Up, Directions.Down, Directions.Left, Directions.Right]
```

in generated code will become

```js
var directions = [0 /* Up */, 1 /* Down */, 2 /* Left */, 3 /* Right */];
```

# Ambient enums

Ambient enums are used to describe the shape of already existing enum types.

```ts
declare enum Enum {
    A = 1,
    B,
    C = 2
}
```

One important difference between ambient and non-ambient enums is that, in regular enums, members that don't have an initializer are considered constant members.
For non-const ambient enums member that does not have initializer is considered computed.
