# Variable Declarations

`let` and `const` are two variable declarations that are new to ECMAScript 2015 (also known as ECMAScript 6).
As we mentioned earlier, `let` is similar to `var`, but helps you avoid some of the common "gotchas" of `var`.
`const` is an augmentation of `let` that prevents re-assignment to a variable.

Since TypeScript is a superset of JavaScript, it naturally supports `let` and `const`.
Here we'll elaborate more on these new declarations and why they're preferable to `var`.
If you know all the quirks of `var` in JavaScript, you might want to skip ahead.

# `var` declarations

Before version 6, you declared a variable in JavaScript with the `var` keyword.

```ts
var a = 10;
```

We can also declare a variable inside of a function:

```ts
function f() {
    var message = "Hello, world!";

    return message;
}
```

and we can also access those same variables within nested functions:

```ts
function f() {
    var a = 10;
    return function g() {
        var b = a + 1;
        return b;
    }
}

var g = f();
g(); // returns 11;
```

In this above example, `g` captured the variable `a` declared in `f`.
At any point that `g` gets called, the value of `a` will be tied to the value of `a` in `f`.
Even if `g` is called once `f` is done running, it will be able to access and modify `a`.

```ts
function f() {
    var a = 1;

    a = 2;
    var b = g();
    a = 3;

    return b;

    function g() {
        return a;
    }
}

f(); // returns 2
```

## Scoping rules

Unfortunately, `var` declarations have some odd scoping rules.
Take the following example:

```ts
function f(shouldInitialize: boolean) {
    if (shouldInitialize) {
        var x = 10;
    }

    return x;
}

f(true);  // returns '10'
f(false); // returns 'undefined'
```

It's okay if you do a double-take at this example.
The variable `x` was declared *within the `if` block*, and yet we were able to access it from outside that block.
That's because `var` declarations are accessible anywhere within their containing function, module, namespace, or global scope -- all of which we'll go over later on -- regardless of the containing block.
Some people call this *`var`-scoping* or *function-scoping*.
Parameters are also function scoped.

These scoping rules can cause several types of mistakes.
One problem they exacerbate is the fact that it is not an error to declare the same variable multiple times:

```ts
function sumMatrix(matrix: number[][]) {
    var sum = 0;
    for (var i = 0; i < matrix.length; i++) {
        var currentRow = matrix[i];
        for (var i = 0; i < currentRow.length; i++) {
            sum += currentRow[i];
        }
    }

    return sum;
}
```

In case you missed it, the inner `for`-loop accidentally overwrites the variable `i` because `i` refers to the same function-scoped variable.
That's an extremely subtle bug -- the kind that slip through code reviews and cause endless frustration.

## Variable capturing quirks

Take a quick second to guess what the output of the following snippet is:

```ts
for (var i = 0; i < 10; i++) {
    setTimeout(function() {console.log(i); }, 100 * i);
}
```

`setTimeout` tries to execute a function after a certain number of milliseconds (after waiting for anything else to stop running).

Ready? Take a look:

```text
10
10
10
10
10
10
10
10
10
10
```

Many JavaScript developers know about this, but if you're surprised, you're certainly not alone.
Most people expect the output to be:

```text
0
1
2
3
4
5
6
7
8
9
```

Remember variable capture from earlier?

> At any point that `g` gets called, the value of `a` will be tied to the value of `a` in `f`.

Let's take a minute to consider that in this context.
`setTimeout` will run a function after some number of milliseconds -- *after* the `for` loop has stopped executing.
By the time the `for` loop has stopped executing, the value of `i` is `10`.
So each time the given function gets called, it will print out `10`!

A common work around is to use an IIFE - an Immediately Invoked Function Expression - to capture `i` at each iteration:

```ts
for (var i = 0; i < 10; i++) {
    // capture the current state of 'i'
    // by invoking a function with its current value
    (function(i) {
        setTimeout(function() { console.log(i); }, 100 * i);
    })(i);
}
```

This odd-looking pattern is actually commonplace.
The parameter `i` actually shadows the `i` declared in the `for` loop, but since we named it the same, we didn't have to modify the loop body too much.

# `let` declarations

By now you've seen that `var` has some problems.
Let addresses precisely those problems., which is precisely why `let` statements are a new way to declare variables.
Apart from the keyword used, `let` statements are written the same way `var` statements are.

```ts
let hello = "Hello!";
```

The key difference is not in the syntax, but in the semantics, which we'll now dive into.

## Block-scoping

When a variable is declared using `let`, it uses *lexical scope*.
Unlike `var` whose variables leak out to their containing function, lexically-scoped variables are not visible outside of their nearest containing block or `for`-loop.

```ts
function f(input: boolean) {
    let a = 100;

    if (input) {
        // Still okay to reference 'a'
        let b = a + 1;
        return b;
    }

    // Error: 'b' doesn't exist here
    return b;
}
```

Here, we have two local variables `a` and `b`.
`a`'s scope is limited to the body of `f` while `b`'s scope is limited to the containing `if` statement's block.

Variables declared in a `catch` clause also have similar scoping rules.

```ts
try {
    throw "oh no!";
}
catch (e) {
    console.log("Oh well.");
}

// Error: 'e' doesn't exist here
console.log(e);
```

Another property of block-scoped variables is that they can't be read or written to before they're declared.
While these variables are "present" throughout their scope, all points up until their declaration are part of their *temporal dead zone*.
This is just a sophisticated way of saying you can't access them before the `let` statement, and luckily TypeScript will tell you that.

```ts
a++; // illegal to use 'a' before it's declared;
let a;
```

Something to note is that you can still *capture* a block-scoped variable before it's declared.
The only catch is that it's illegal to call that function before the declaration.
If you target ES2015, an ES2015 (or higher) runtime will throw an error; however, right now TypeScript is permissive and won't report this as an error.

```ts
function foo() {
    // okay to capture 'a'
    return a;
}

// illegal to call 'foo' before 'a' is declared
// runtimes should throw an error here
// TypeScript does not catch this error
foo();

let a;
```

For more information on temporal dead zones, see [relevant content on the Mozilla Developer Network](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let#Temporal_dead_zone_and_errors_with_let).

## Re-declarations and Shadowing

With `var` declarations, it doesn't matter how many times you declare your variables; you only get one.

```ts
function f(x) {
    var x;
    var x;

    if (true) {
        var x;
    }
}
```

In the above example, all declarations of `x` actually refer to the *same* `x`, and this is perfectly valid.
This often ends up being a source of bugs.
Thankfully, `let` declarations are not as forgiving.

```ts
let x = 10;
let x = 20; // error: can't re-declare 'x' in the same scope
```

The variables don't all need to be block-scoped for TypeScript to tell us that there's a problem.

```ts
function f(x) {
    let x = 100; // error: interferes with parameter declaration
}

function g() {
    let x = 100;
    var x = 100; // error: can't have both declarations of 'x'
}
```

That's not to say that you can never declare a block-scoped variable with a function-scoped variable.
The block-scoped variable just needs to be declared within a distinctly different block.

```ts
function f(condition, x) {
    if (condition) {
        let x = 100;
        return x;
    }

    return x;
}

f(false, 0); // returns 0
f(true, 0);  // returns 100
```

Introducing a new name in a more nested scope is called *shadowing*.
It is a double-edged sword: you can accidentally shadow variables, but shadowing can prevent certain bugs.
For instance, imagine we had written our earlier `sumMatrix` function using `let` variables.

```ts
function sumMatrix(matrix: number[][]) {
    let sum = 0;
    for (let i = 0; i < matrix.length; i++) {
        var currentRow = matrix[i];
        for (let i = 0; i < currentRow.length; i++) {
            sum += currentRow[i];
        }
    }

    return sum;
}
```

This version of the loop performs the summation correctly because the inner loop's `i` shadows `i` from the outer loop.

However, shadowing should *usually* be avoided in the interest of writing clearer code.

## Block-scoped variable capturing

When we first discussed variable capture with `var`, we briefly covered how captured variables work.
To give more detail, each time a scope is run, it creates an "environment" of variables.
That environment can exist even after the code within its scope has finished executing.

```ts
function theCityThatAlwaysSleeps() {
    let getCity;

    if (true) {
        let city = "Seattle";
        getCity = function() {
            return city;
        }
    }

    return getCity();
}
```

Because we capture `city` inside `getCity`, we're still able to access it despite the fact that the `if` block finished executing.

Recall that with our earlier `setTimeout` example, we ended up needing to use an IIFE to capture the state of a variable for every iteration of the `for` loop.
In effect, what we were doing was creating a new variable environment for our captured variables.
What a pain!
Luckily, you'll never have to do that again in TypeScript.

`let` declarations have drastically different behavior when declared as part of a loop.
They create a new scope *per iteration*, basically the same as we did with the IIFE in the `var` example.
So we can change our old `setTimeout` example to just use a `let` declaration.

```ts
for (let i = 0; i < 10 ; i++) {
    setTimeout(function() {console.log(i); }, 100 * i);
}
```

and as expected, this will print out

```text
0
1
2
3
4
5
6
7
8
9
```

# `const` declarations

`const` declarations are another way of declaring variables.

```ts
const numLivesForCat = 9;
```

They are like `let` declarations but, as their name implies, their value cannot be changed once they are bound.
In other words, they have the same scoping rules as `let`, but you can't re-assign to them.

This should not be confused with the idea that the values they refer to are *immutable*.
The values are still normal JavaScript values, which are mutable.

```ts
const numLivesForCat = 9;
const kitty = {
    name: "Aurora",
    numLives: numLivesForCat,
}

// Error
kitty = {
    name: "Danielle",
    numLives: numLivesForCat
};

// all "okay"
kitty.name = "Rory";
kitty.name = "Kitty";
kitty.name = "Cat";
kitty.numLives--;
```

Unless you take specific measures to avoid it, the internal state of a `const` variable is still modifiable.

# `let` vs. `const`

Given that we have two similar types of declaration, which one should you use?
Like most broad questions, the answer is: it depends.

Applying the [principle of least privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege), all declarations other than those you plan to modify should use `const`.
If a variable doesn't need to get updated, others working on the same codebase shouldn't automatically be able to write to the object, and will need to consider whether they really need to re-assign to the variable.
Using `const` also makes code more predictable when reasoning about flow of data.

On the other hand, `let` is not any longer to write out than `var`, and you may prefer its brevity.
The majority of this handbook uses `let` declarations because of that.

# Destructuring

Another ECMAScript 2015 feature that TypeScript has is destructuring.
For a complete reference, see [the article on the Mozilla Developer Network](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment).
In this section, we'll give a short overview.

## Array destructuring

The simplest form of destructuring is destructuring array assignment:

```ts
let input = [1, 2];
let [first, second] = input;
console.log(first); // outputs 1
console.log(second); // outputs 2
```

This binds two new variables named `first` and `second`.
This is equivalent to using indexing, but much more convenient:

```ts
first = input[0];
second = input[1];
```

Destructuring works with already-declared variables as well:

```ts
[first, second] = input;
```

And with parameters to a function:

```ts
function f([first, second]: [number, number]) {
    console.log(first);
    console.log(second);
}
f(input);
```

You can bind a variable to remaining items in a list using the syntax `...name`:

```ts
let [first, ...rest] = [1, 2, 3, 4];
console.log(first); // outputs 1
console.log(rest); // outputs [ 2, 3, 4 ]
```

Of course, since this is JavaScript, you can just ignore trailing elements you don't care about:

```ts
let [first] = [1, 2, 3, 4];
console.log(first); // outputs 1
```

Or other elements:

```ts
let [, second, , fourth] = [1, 2, 3, 4];
```

## Object destructuring

You can also destructure objects:

```ts
let o = {
    a: "foo",
    b: 12,
    c: "bar"
}
let { a: newName1, b: newName2 } = o;
```

This is even more convenient than array destructuring, but the directionality is confusing.
For each pair, the identifier on the left side of the colon is the property name from the object, and the identifier on the right side of the colon is the newly bound variable.
The direction is left-to-right:
For example, `{ a: newName1 }` means bind the property 'a' to the variable 'newName1'.

This direction is important to remember because of two additional features: shortcut names and default values.

Shortcut names let you drop the new name identifier.
This is the most common form of object destructuring that you will see:

```ts
let { a, b } = o;
// same as
let { a: a, b: b } = o;
```

Default values let you specify a default value in case a property is undefined:

```ts
o = { a: "foo", c: "bar" }
let { a: newName1, b: newName2 = 1001 } = o;
```

Here the directionality of the syntax becomes quite confusing.
In `b: newName2 = 1001`, the new variable is `newName2`, and its value is `o.b` unless `o.b` is undefined, in which case it is `1001`.
Use default values with care.

## Complex example

All the above features can be nested and used anywhere JavaScript assigns values to variables, like `for` loops and function calls.
Here's a more complex example:

```ts
let objects: { a: number, b?: number[] }[] = [
  { "a": 12, "b": [3, 4] },
  { "a": 21 },
  { "a": 11, "b": [4, 3] }];
for (let { b: [first] = [0] } of objects) {
    // code goes here ...
}
```

This binds `first` to the first element of the property `b` in each object in `objects`.
If `b` is not defined, we provide `[0]` as the default value, meaning that `first = 0` in that case.

As confusing as this is, we didn't prevent `first` from being `undefined` in some cases!
If `b` is *defined*, but is a zero-length array, then `first` will be undefined:

```ts
let o = { "a": 21, "b": [] };
let { b: [first] = [0] } = o;
console.log(first); // prints 'undefined'
```

You can fix this by adding another default inside the list destructuring, but you are better off writing a more explicit set of imperative checks:

```ts
// Fix 1: Redundant defaults
for (let { b: [first = 0] = [0] } of objects) {
    // code goes here ..
}

// Fix 2: Explicit code
for (let { b } of objects) {
    if (b && b.length > 0) {
        let first = b[0];
        // code goes here ...
    }
}
```
