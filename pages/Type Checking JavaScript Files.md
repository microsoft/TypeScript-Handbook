TypeScript 2.3 and later support a mode of type-checking and reporting errors in `.js` files with `--checkJs`.

You can skip checking some files by adding `// @ts-nocheck` comment to them; conversely you can choose to check only a few `.js` files by adding `// @ts-check` comment to them without setting `--checkJs`.
You can also ignore errors on specific lines by adding `// @ts-ignore` on the preceding line.

Here are some notable differences on how checking work in `.js` file from `.ts` file:

## Using types in JSDoc

In a `.js` file, types can often be inferred just like in `.ts` files.
Likewise, when types can't be inferred, they can be specified using JSDoc the same way that type annotations do in a `.ts` file. 

JSDoc annotations adorning a declaration will be used to set the type of that declaration. For example:

```js
/** @type {number} */
var x;

x = 0;      // OK
x = false;  // Error: boolean is not assignable to number
```

You can find the full list of supported JSDoc patterns in the [JSDoc support in JavaScript documentation](https://github.com/Microsoft/TypeScript/wiki/JSDoc-support-in-JavaScript).

## Property declaration inferred from assignments in class bodies

ES2015/ES6 does not have a means for declaring properties on classes. Properties are dynamically assigned, just like in the case of object literals. 

In a `.js` file property declarations are inferred from assignments to the properties inside the class body. The type of properties is the union of the types of all the right-hand values in these assignments. Properties defined in the constructor are always assumed to exist, where as ones defined in methods, getters, or setters are considered optional.

Adorn property assignments with JSDoc to specify the type of the property as needed. For instance:

```js
class C {
    constructor() {
        /** @type {number | undefined} */
	this.prop = undefined;
    }
}


let c = new C();
c.prop = 0;         // OK
c.prop = "string";  // Error: string is not assignable to number|undefined
```

If properties are never set in the class body, they are considered unknown. If your class has properties that are only read from, consider adding an initialization in the constructor to undefined, e.g. `this.prop = undefined;`.

## CommonJS module input support

In a `.js` files CommonJS module format is allowed as an input module format. Assignments to `exports`, and `module.exports` are recognized as export declarations. Similarly, `require` function calls are recognized as module imports. For example:

```ts
// import module "fs"
const fs = require("fs");


// export function readFile
module.exports.readFile = function(f) {
    return fs.readFileSync(f);	
}
```

## Object literals are open-ended

By default object literals in variable declarations provide the type of a declaration. No new members can be added that were not specified in the original initialization. This rule is relaxed in a `.js` file; object literals have an open-ended type, allowing adding and looking up properties that were not defined originally. For instance:

```js
var obj = { a: 1 };
obj.b = 2;  // Allowed
```

Object literals get a default index signature `[x:string]: any` that allows them to be treated as open maps instead of closed objects.

Similar to other special JS checking behaviors, this behavior can be changed by specifying a JSDoc type for the variable. For example:

```js
/** @type {{a: number}} */
var obj = { a: 1 };
obj.b = 2;  // Error, type {a: number} does not have property b
```


## Function parameters are optional by default

Since there is no way to specify optionality on parameters in JS (without specifying a default value), all function parameters in `.js` file are considered optional. Calls with fewer arguments are allowed. 

It is important to note that it is an error to call a function with too many arguments.

For instance:

```js
function bar(a, b){
    console.log(a + " " + b);
}

bar(1);       // OK, second argument considered optional
bar(1, 2);
bar(1, 2, 3); // Error, too many arguments
```

JSDoc annotated functions are excluded from this rule. Use JSDoc optional parameter syntax to express optionality. e.g.:

```js
/**
 * @param {string} [somebody] - Somebody's name.
 */
function sayHello(somebody) {
    if (!somebody) {
        somebody = 'John Doe';
    }
    alert('Hello ' + somebody);
}

sayHello();
```

## Var-args parameter declaration inferred from use of `arguments`

A function whose body has a reference to the `arguments` reference is implicitly considered to have a var-arg parameter (i.e. `(...arg: any[]) => any`). Use JSDoc var-arg syntax to specify the type of the arguments.


## Unspecified type parameters default to `any`

An unspecified generic type parameter defaults to `any`. There are few places where this happens:

#### In extends clause:

For instance, `React.Component` is defined to have two generic type parameters, `Props` and `State`. 
In a `.js` file, there is no legal way to specify these in the extends clause. By default the type arguments will be `any`:

```js
import { Component } from "react";

class MyComponent extends Component {
    render() {
       this.props.b; // Allowed, since this.props is of type any
    }
}
```

Use JSDoc `@augments` to specify the types explicitly. for instance:

```js
import { Component } from "react";

/**
 * @augments {Component<{a: number}, State>}
 */
class MyComponent extends Component {
    render() {
        this.props.b; // Error: b does not exist on {a:number}
    }
}
```

#### In JSDoc references

An unspecified generic type argument in JSDoc defaults to any:

```js
/** @type{Array} */
var x = [];

x.push(1);        // OK
x.push("string"); // OK, x is of type Array<any>


/** @type{Array.<number>} */
var y = [];

y.push(1);        // OK
y.push("string"); // Error, string is not assignable to number

```

#### In function calls

A call to generic functions uses arguments to infer the generic type parameters. Sometimes this process fails to infer any types, mainly because of lack on inference sources; in these cases, the generic type parameters will default to `any`. For example:

```js
var p = new Promise((resolve, reject) => { reject() });

p; // Promise<any>;
```
