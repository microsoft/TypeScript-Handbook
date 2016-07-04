# 1. Search

Check out [https://aka.ms/types](https://aka.ms/types) to find the package for your favorite library.

> Note: if the declaration file you are searching for is not present, you can always contribute one back and help out the next developer looking for it.
> Please see the DefinitelyTyped [contribution guidelines page](http://definitelytyped.org/guides/contributing.html) for details.

# 2. Download

Getting type declarations in TypeScript 2.0 require no tools apart from npm.

As an example, getting the declarations for a library like lodash will be just an npm command away:

```cmd
npm install --save-dev @types/lodash
```

From there you’ll be able to use lodash in your TypeScript code with no fuss.
This works for both modules and global code.

For example, once you’ve npm install-ed your type declarations, then you can use imports and write

```ts
import * as _ from "lodash";
_.padStart("Hello TypeScript!", 20, " ");
```

or if you’re not using modules, you can just use the global variable `_` if you have a `tsconfig.json` around.

```ts
_.padStart("Hello TypeScript!", 20, " ");
```