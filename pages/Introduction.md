# What is TypeScript?

TypeScript is a superset of JavaScript (meaning that all valid JavaScript is valid TypeScript) that allows a developer to add a compile step to their JavaScript code in order to have stronger typings. This means that you'll need to run the TypeScript compiler (or a build process that calls the compiler) in order to run the generated JavaScript in a supported environment. Because TypeScript code turns into JavaScript after the compilation, does not alter the behavior of JavaScript outside of providing this additional typing information. This means that everything you see in this guidebook assumes a certain amount of knowledge of JavaScript and that nothing you see in TypeScript code alters runtime JavaScript behavior as expected.

# Why TypeScript?

Why use TypeScript if it doesn't change the runtime behavior of your code? There can be a few reasons you may want to integrate TypeScript in your project such as the following.

## Type Safety

While JavaScript has the concept of types (in the form of the 6 [primitive types](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Data_types)), it does a little to prevent you from making mistakes. Let's take the following code for example:

```js
function addFive(input) {
    return input + 5;
}
addFive('5');
```

Reading through this code quickly, you might be able to spot the problem. Because we passed in a string, rather than a number, we get the result of `'55'` rather than the (likely) expected result of `10`. This is the kind of unintentional code safety concern that TypeScript fixes. Using TypeScript, we are able to check the properties passed into `addFive` during compile time in order to warn a developer about these mistakes.

```ts
function addFive(input: number) {
    return input + 5;
}
addFive('5');
```

Will now output:

```sh
>tsc test.ts
test.ts:5:9 - error TS2345: Argument of type '"5"' is not assignable to parameter of type 'number'.
5 addFive('5');
```

In a smaller codebase, such as the given example, it can be easy to miss how important type checking is. Detecting the error in this small length of code is often trivial; however, it can be much more difficult to do so in larger codebases or when utilizing code that might not be from your project, such as a library or framework. In these use cases, it can be much easier to identify an edge case where changing a function's parameters would break another part of the codebase. Likewise, being able to quickly identify implementation errors when using a library is a significant factor in identifying problems effectively.

### Logic != Typings

TypeScript will not find all your errors. TypeScript is only as useful as your typings are. If you keep `addFive`'s `input` parameter as a blank type type, it will try to do it's best to detect the type based on the operations you run on the value. Oftentimes, however, it has difficulty doing so which is why manually assigning types is best. If it couldn't properly detect a type for the value in this example, it does nothing to prevent strings from being passed as the parameter value.

Although examples like this are simple, strict typings can also become fairly complex (see the #Advanced section) in order to maintain maximum type strictness.
Also, because typings do nothing to test against the logic of your program, they should not be seen as a replacement for testing, but rather a companion to them. With strict typings and proper testing, regressions can be severely limited and improve code quality of life.

## Developer Quality of Life

### Improved Tooling Support

Historically, having the ability to make assumptions about code in order to provide developer niceties (such as autocomplete code suggestions) in loosely typed languages such as JavaScript has been incredibly hard to do. As time has gone on, support for these types of actions have gotten better, but due to the nature of JavaScript's type system, there will likely always be limitations on how effectively this can be done. TypeScript, however, can provide much of the data needed for tools to be able to utilize data about the code in order to provide those niceties that are otherwise tricky to get working otherwise. TypeScript even provides a layer to communicate directly to these tools so that the work on their part to integrate these niceties are much more trivial than they otherwise would be. This is why many changelogs for TypeScript releases mentions changes to editors such as [Visual Studio Code](https://code.visualstudio.com).

#### 3rd Party Library Support

Because of JavaScript's awesome engineering diversity, many widely used projects do not use TypeScript. However, there are ways we can still utilize TypeScript's tooling capabilities without porting the code. If you have a good understanding of the given project's codebase and TypeScript, you can write a definition file which sits separated from the rest of the codebase. These definition files allow you many of the same tooling abilities native TypeScript code allows. Additionally, because TypeScript has a well established and widely used install-base, there are already many different definition files in the wild for supporting non-TypeScript supporting projects. One of the more extensive collections of these typings lives at the [DefinitelyTyped repository](https://github.com/DefinitelyTyped/DefinitelyTyped), which publishes the typings of their typings under the package names `@types/your-package-name` (where `your-package-name` is the name of the project you're looking for typings of) that you can look for on your package manager.

##### Typing Mishaps Happen

Remember, because typings are kept separately from the project's logic code, typings can be misleading, incomplete, or otherwise incorrect. While this can also happen with TypeScript logic code, it tends to be more actively mitigated as a project's ability to compile (and therefore redistribute) relies on that typing information. This isn't to say that you should immediately mistrust typings, but simply a reminder that they too may have their flaws - just as any other codebase.

### Documented types

When working on projects with objects that contain many properties that are used variously across files and functions, it can be difficult to track down what properties and methods are available to you without having to refer to the documentation of that scope in your application. With types being referred within a scope, you're able to reference that type (often with a "jump to declaration" shortcut feature that is present in many IDEs) to quickly and safely use that typed value.

#### Don't Forget To Document

Just as typings shouldn't replace tests, typings should also not replace documentation or comments. Typings can help understand what inputs and outputs you're expecting, but just the same as with testing: it doesn't explain what the logic does or provide context as to why the data types have specific properties, what the properties are used for, and so forth. Additionally, typings often do little to help explain how to contribute in the larger scale or the design principles that may be applied in the design of the application.

## Type Information

Although it's a much more complex and highly experimental feature of TypeScript, you are also able to use the typing data from your program in order to do other operations without explicitly duplicating the type data. This could be used in a situation where you might want to generate a JSON schema based on a class declaration in a TypeScript file or when using ORMs and mapping TypeScript types to the databases' native type. This potentially allows you to preserve both the database typing and the TypeScript compile type within the same file so you don't have to do duplicate checks against either. This is being built with and on top of features that are being proposed for a future version of JavaScript (commonly referred to as ESNext).
