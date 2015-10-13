# Introduction

ECMAScript 2015 modules are a standardized representation of units of code.
TypeScript uses their syntax as the canonical base form for all modules alongside some extensions and affordances for our various alternate module emit options.
There's a number of reasons you may want to leverage module syntax and structure in your program.
Perhaps you want to use a tool like [browserify](http://browserify.org/) or [webpack](https://webpack.github.io/), or perhaps you want to better integrate with other [`node` libaries](https://www.npmjs.com/) - in any case, you may have some existing code, and it may not be structured for the modular world.

# Identifying incompatibilities

TypeScript users may be familiar with a TS construct called `namespace`s (previously detnoted with the `module` keyword).
This construct lends itself to a certain way of organizing programs, and sees considerable use in organizing large applications.
`namespace`s see use in programs and libraries which wish to group similar functions, variables, classes, interfaces, and types in a block with mutual visibility of all members.
This block may be split across many individual `namespace` declarations across many files within a program.

Thinking in terms of ECMAScript modules, `namespace`s would muddle the very explicit module boundaries within a program - anything within a namespace is supposed to have visibility on all the other exported members of the namespace.
This implicit merging can, in turn, result implicit circularities without strict discipline on a developer's part, and can result in load-order dependent behavior in the compiled code.
Part of TypeScript's affordances for modules is an understanding of their _scope_ - that is to say that types defined within a module are confined to the module unless explicitly exported.
This does not bode well for `namespace`s, as it means that there is no easy way to structure your program using `namespace`s within a module-based world.
So how do we migrate away from `namespace`s to the explicit dependencies required by ECMAScript modules?

# Migrating

1. Map namespace boundaries within your program.
  1. Create a file for each namespace.
  2. In each top level namespace file, import its nested namespaces and reexport them as variables:
      ```ts
      import * as foons from "./bar";
      export var Foo = foons;
      ```
  3. Use `export * from "./computer"` notation to import pieces of the former `namespace` into this file and export them as members of the new module-based namespace.
2. Migrate individual files away from namespaces. Example `computer.ts`:
  ```ts
  namespace Foo.Bar {
    export function process(computer: Computer, data: Data): number {
      computer
        .thinkOn(data)
        .thinkOn(data)
        .thinkOn(data)
       // ...
       return 42;
    }
    export class Computer {
      private processor: CentralProcessingUnit;
      private storage: Baz.Storage;
      thinkOn(data: Data): this {
        this.processor.input(data).pipe(this.storage);
        return this;
      }
    }
  }
  ```
  becomes
  ```ts
  import {Data} from "./foo";
  import {CentralProcessingUnit} from "./bar";
  import * as Baz from "./baz";
  export function process(computer: Computer, data: Data): number {
    computer
      .thinkOn(data)
      .thinkOn(data)
      .thinkOn(data)
      // ...
      return 42;
  }
  export class Computer {
    private processor: CentralProcessingUnit;
    private storage: Baz.Storage;
    thinkOn(data: Data): this {
      this.processor.input(data).pipe(this.storage);
      return this;
    }
  }
  ```
  To summarize the changes, we've removed the enclosing `namespace` declaration, and fixed up the (now broken) remaining references by explicitly importing them from the namespace-esque files we made first.
  This step can be troublesome if an individual file makes heavy use of types external to the file but still in its original `namespace`, as the types you wish to import may not yet have been migrated.


# Caveats

When migrating to modules from namespaces, there is no longer a way to perform interface merging across files. If youe program relied on interface merging, you should consider rearchitecting to use generics or composition, rather than interface merging, prior to migrating.

`namespace`s will not merge across files if you choose to retain any inside your modules.
If you have mutually dependent nested namespaces spread across multiple files, consider extracting such structures into sperate files (one per namespace) prior to migrating, then migrating them as above.


For a larger example of a project undergoing a migration like this, see [`tslint`](https://github.com/palantir/tslint/pull/726);