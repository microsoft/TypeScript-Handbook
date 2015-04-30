# Introduction

Some of the unique concepts in TypeScript come from the need to describe what is happening to the shape of JavaScript objects at the type level. One example that is especially unique to TypeScript is the concept of 'declaration merging'. Understanding this concept will give you an advantage when working with existing JavaScript in your TypeScript. It also opens the door to more advanced abstraction concepts.

First, before we get into how declarations merge, let's first describe what we mean by 'declaration merging'.

For the purposes of this article, declaration merging specifically means that the compiler is doing the work of merging two separate declarations declared with the same name into a single definition. This merged definition has the features of both of the original declarations. Declaration merging is not limited to just two declarations, as any number of declarations can be merged.

# Basic Concepts

In TypeScript, a declaration exists in one of three groups: namespace/module, type, or value. Declarations that create a namespace/module are accessed using a dotted notation when writing a type. Declarations that create a type do just that, create a type that is visible with the declared shape and bound to the given name. Lastly, declarations create a value are those that are visible in the output JavaScript (e.g. functions and variables).

| Declaration Type | Namespace | Type | Value |
|------------------|:---------:|:----:|:-----:|
| Module           |     X     |      |   X   |
| Class            |           |   X  |   X   |
| Interface        |           |   X  |       |
| Function         |           |      |   X   |
| Variable         |           |      |   X   |

Understanding what is created with each declaration will help you understand what is merged when you perform a declaration merge.

# Merging Interfaces

The simplest, and perhaps most common, type of declaration merging is interface merging. At the most basic level, the merge mechanically joins the members of both declarations into a single interface with the same name.

```TypeScript
interface Box {
    height: number;
    width: number;
}

interface Box {
    scale: number;
}

var box: Box = {height: 5, width: 6, scale: 10};
```

Non-function members of the interfaces must be unique. The compiler will issue an error if the interfaces both declare a non-function member of the same name.

For function members, each function member of the same name is treated as describing an overload of the same function. Of note, too, is that in the case of interface `A` merging with later interface `A` (here called `A'`), the overload set of `A'` will have a higher precedence than that of interface `A`.

That is, in the example:

```TypeScript
interface Document {
    createElement(tagName: any): Element;
}
interface Document {
    createElement(tagName: string): HTMLElement;
}
interface Document {
    createElement(tagName: "div"): HTMLDivElement;
    createElement(tagName: "span"): HTMLSpanElement;
    createElement(tagName: "canvas"): HTMLCanvasElement;
}
```

The two interfaces will merge to create a single declaration. otice that the elements of each group maintains the same order, just the groups themselves are merged with later overload sets coming first:

```TypeScript
interface Document {
    createElement(tagName: "div"): HTMLDivElement;
    createElement(tagName: "span"): HTMLSpanElement;
    createElement(tagName: "canvas"): HTMLCanvasElement;
    createElement(tagName: string): HTMLElement;
    createElement(tagName: any): Element;
}
```


# Merging Modules

Similarly to interfaces, modules of the same name will also merge their members. Since modules create both a namespace and a value, we need to understand how both merge.

To merge the namespaces, type definitions from exported interfaces declared in each module are themselves merged, forming a single namespace with merged interface definitions inside.

To merge the value, at each declaration site, if a module already exists with the given name, it is further extended by taking the existing module and adding the exported members of the second module to the first.

The declaration merge of `Animals` in this example:

```TypeScript
module Animals {
    export class Zebra { }
}

module Animals {
    export interface Legged { numberOfLegs: number; }
    export class Dog { }
}
```

is equivalent to:

```TypeScript
module Animals {
    export interface Legged { numberOfLegs: number; }

    export class Zebra { }
    export class Dog { }
}
```

This model of module merging is a helpful starting place, but to get a more complete picture we need to also understand what happens with non-exported members. on-exported members are only visible in the original (un-merged) module. This means that after merging, merged members that came from other declarations can not see non-exported members.

We can see this more clearly in this example:

```TypeScript
module Animal {
    var haveMuscles = true;

    export function animalsHaveMuscles() {
        return haveMuscles;
    }
}

module Animal {
    export function doAnimalsHaveMuscles() {
        return haveMuscles;  // <-- error, haveMuscles is not visible here
    }
}
```

Because `haveMuscles` is not exported, only the `animalsHaveMuscles` function that shares the same un-merged module can see the symbol. The `doAnimalsHaveMuscles` function, even though it's part of the merged Animal module can not see this un-exported member.

# Merging Modules with Classes, Functions, and Enums

Modules are flexible enough to also merge with other types of declarations. To do so, the module declaration must follow the declaration it will merge with. The resulting declaration has properties of both declaration types. TypeScript uses this capability to model some of patterns in JavaScript as well as other programming languages.

The first module merge we'll cover is merging a module with a class. This gives the user a way of describing inner classes.

```TypeScript
class Album {
    label: Album.AlbumLabel;
}
module Album {
    export class AlbumLabel { }
}
```

The visibility rules for merged members is the same as described in the 'Merging Modules' section, so we must export the AlbumLabel class for the merged class to see it. The end result is a class managed inside of another class. You can also use modules to add more static members to an existing class.

In addition to the pattern of inner classes, you may also be familiar with JavaScript practice of creating a function and then extending the function further by adding properties onto the function. TypeScript uses declaration merging to build up definitions like this in a type-safe way.

```TypeScript
function buildLabel(name: string): string {
    return buildLabel.prefix + name + buildLabel.suffix;
}

module buildLabel {
    export var suffix = "";
    export var prefix = "Hello, ";
}

alert(buildLabel("Sam Smith"));
```

Similarly, modules can be used to extend enums with static members:

```TypeScript
enum Color {
    red = 1,
    green = 2,
    blue = 4
}

module Color {
    export function mixColor(colorName: string) {
        if (colorName == "yellow") {
            return Color.red + Color.green;
        }
        else if (colorName == "white") {
            return Color.red + Color.green + Color.blue;
        }
        else if (colorName == "magenta") {
            return Color.red + Color.blue;
        }
        else if (colorName == "cyan") {
            return Color.green + Color.blue;
        }
    }
}
```

# Disallowed Merges

Not all merges are allowed in TypeScript. Currently, classes can not merge with other classes, variables and classes can not merge, nor can interfaces and classes. For information on mimicking classes merging, see the [Mixins in TypeScript] section.
