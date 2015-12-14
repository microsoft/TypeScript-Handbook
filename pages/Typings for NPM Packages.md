The TypeScript compiler resolves node module names by following the [Node.js module resolution algorithm](https://nodejs.org/api/modules.html#modules_all_together).
The TypeScript compiler can also load typings that are bundled with npm packages.
The compiler will try to discover typings for module `"foo"` using the following set of rules:

1. Try to load the `package.json` file located in the appropriate package folder (`node_modules/foo/`). If present,read the path to the typings file described in the `"typings"` field. For example, in the following `package.json`, the compiler will resolve the typings at `node_modules/foo/lib/foo.d.ts`

   ```JSON
   {
       "name": "foo",
       "author": "Vandelay Industries",
       "version": "1.0.0",
       "main": "./lib/foo.js",
       "typings": "./lib/foo.d.ts"
   }
   ```

2. Try to load a file named `index.d.ts` located in the package folder (`node_modules/foo/`) - this file should contain typings for the package.

The precise algorithm for module resolution can be found [here](https://github.com/Microsoft/TypeScript/issues/2338)

### What my typings file should

* be a `.d.ts` file
* be an external module
* not have triple-slash references

The rationale is that typings should not bring new compilable items to the set of compiled files; otherwise actual implementation files in the package can be overwritten during compilation.
Additionally, **loading typings should not pollute global scope** by bringing potentially conflicting entries from different version of the same library