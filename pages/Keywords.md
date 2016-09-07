# Keywords

Keyword | Syntax | Category | Description | External links
---|---|---|---|---
| `abstract` | `abstract class` | [Classes](#classes) | [Abstract classes (cannot be instantiated; must be inherited)](Classes.md#abstract-classes) | |
| `abstract` | `abstract` _member_ | [Classes](#classes) | [Inheriting classes must implement this method/property](Classes.md#abstract-classes) | |
| `any` | | [Primitive types](#primitive-types) | [Describes a type unknown at design time](Basic%20Types.md#any) | |
| `as` | | [Type operation](#type-operation) | [Type assertion](Basic%20Types.md#type-assertions) | |
| `as` | `import {`_item_ `as` _name_`} from "`_path_`"`<br>`import * as `_name_` from "` _path_ `"` | [Environment/modules](#environment-modules) | [Module import renaming](Modules.md#import) | |
| `as` | `export as namespace` _namespace_ | [Environment/modules](#environment-modules) | [UMD/isomorphic modules](Modules.md#umd-modules) | |
| `async` | | [Functions](#functions) | Marks function as asynchronous | [ES draft](http://tc39.github.io/ecmascript-asyncawait/), [PR#1664](https://github.com/Microsoft/TypeScript/issues/1664), [spec](https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#68-asynchronous-functions) |
| `await` | | [Functions](#functions) | Waits for value within an asynchronous function | [ES draft](http://tc39.github.io/ecmascript-asyncawait/), [PR#1664](https://github.com/Microsoft/TypeScript/issues/1664), [spec](https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#68-asynchronous-functions) |
| `boolean` | | [Primitive types](#primitive-types) | [`boolean` type](Basic%20Types.md#boolean) | |
| `break` | | [Control flow](#control-flow) | | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/break) |
| `continue` | | [Control flow](#control-flow) | | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/continue) |
| `class` | | [Classes](#classes) | [Class declaration/expression](Classes.md) | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes) |
| `const` | | [Variable declaration](#variable-declaration) | [`const` declaration](Variable%20Declarations.md#const-declarations) | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const) |
| `const` | `const enum` | [User-defined-type modifier](#user-defined-type-modifier) | [Forces a const enum](Enums.md) | |
| `configurable` | | [Property descriptors](#property-descriptors) | Can property descriptor be changed | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) |
| `constructor` | | [Classes](#classes) | [Constructor functions](Classes.md#constructor-functions) | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/constructor) |
| `debugger` | | | | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger) |
| `declare` | | [Environment/modules](#environment-modules) | [Ambient declarations](https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#12-ambients) | |
| `default` | | [Control flow](#control-flow) | Part of `switch...case` | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/default) |
| `default` | `export default` _expr_ | [Environment/modules](#environment-modules) | [Default exports](Modules.md#default-exports) | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) |
| `delete` | | | | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/delete) |
| `do`...`while` | | [Control flow](#control-flow) | | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/do...while) |
| `enum` | | [User-defined type](#user-defined-type) | [Defines a set of named values](Enums.md) | |
| `enumerable` | | [Property descriptors](#property-descriptors) | Is visible when properties are enumerated | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) |
| `export` | | [Environment/modules](#environment-modules) | Allow access to elements from outside the [module](Modules.md#export) or [namespace](Namespaces.md#namespacing) | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) |
| `extends` | | [User-defined-type modifier](#user-defined-type-modifier) | [Inheritance](Classes.md#inheritance) | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/class) |
| `false` | | [Literal](#literal) | | [spec](https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#322-the-boolean-type) |
| `for` | | [Control flow](#control-flow) | | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for) |
| `for`...`in` | | [Control flow](#control-flow) | | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in) |
| `for`...`of` | | [Control flow](#control-flow) | | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of) |
| `from` | `import` _importExpr_ `from "`_path_`"` | [Environment/modules](#environment-modules) | [Location of imported module](Modules.md#import) | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) |
| `function` | | [Functions](#functions) | [Function declaration](Functions.md#functions) | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function) |
| `get` | | [Property descriptors](#property-descriptors) | Getter | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) |
| `get` | | [Classes](#classes) | [Getter](Classes.md#accessors) | |
| `if`...`else` | | [Control flow](#control-flow) | | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else) |
| `implements` | _class_ `implements` _interface_ | [User-defined-type modifier](#user-defined-type-modifier) | [Class must match the shape of the interface](Interfaces.md#implementing-an-interface) | |
| `import` | | [Environment/modules](#environment-modules) | [Enable access to a module's exported elements](Modules.md#import) | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) |
| `import` | `import` _alias_ `=`  _symbol_ | [Environment/modules](#environment-modules) | [Define an alias of _symbol_](Namespaces.md#aliases) | |
| `instanceof` | _expr_ `instanceof` _constructor_ | [Type operation](#type-operation) | | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof) |
| `interface` | | [User-defined type](#user-defined-type) | [Defines a type by its shape (structural typing)](Interfaces.md) | |
| `is` | _parameter_ `is` _type_ | [Type annotation](#type-annotation) | [User-defined type guards](Advanced%20Types.md#user-defined-type-guards) | |
| `let` | | [Variable declaration](#variable-declaration) | [`let` declaration](Variable%20Declarations.md#let-declarations) | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let) |
| `module` | | [Environment/modules](#environment-modules) | [Define an ambient module](Modules.md#ambient-modules) | |
| `namespace` | | [Environment/modules](#environment-modules) | [Associates the contained elements with the specified namespace](Namespaces.md) | |
| `never` | | [Primitive types](#primitive-types) | [`never` type](https://github.com/Microsoft/TypeScript/wiki/What%27s-new-in-TypeScript#the-never-type) | |
| `new` | | | | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new) |
| `new` | | [Type annotation](#type-annotation) | Constructor function type | [spec](https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#389-constructor-type-literals) |
| `null` | | [Literal](#literal) | | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null) |
| `null` | | [Primitive types](#primitive-types) | [`null` type](Basic%20Types.md#null-and-undefined) | |
| `number` | | [Primitive types](#primitive-types) | [`number` type](Basic%20Types.md#number) | |
| `private` | | [Accessibility modifier](#accessibility-modifier) | [Property can be used only from its containing class](Classes.md#understanding-private) | |
| `protected` | | [Accessibility modifier](#accessibility-modifier) | [Property can only be used in its containing class, or by classes which inherit from the containing class](Classes.md#understanding-protected) | |
| `public` | | [Accessibility modifier](#accessibility-modifier) | [Property can be used from outside its containing class](Classes.md#public-by-default) | |
| `readonly` | | [Member modifier](#member-modifier) | [Property's value can be read, but not written to](Classes.md#readonly-modifier) | |
| `require` | `import` _name_ `= require("`_path_`")` | [Environment/modules](#environment-modules) | [Import the custom object defined in a module with `export =`](Modules.md#export--and-import--require) | |
| `return` | | [Functions](#functions) | | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/return) |
| `set` | | [Property descriptors](#property-descriptors) | Setter | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) |
| `set` | | [Classes](#classes) | [Setter](Classes.md#accessors) | |
| `static` | | [Classes](#classes) | [Static properties](Classes.md#static-properties) | |
| `string` | | [Primitive types](#primitive-types) | [`string` type](Basic%20Types.md#string) | |
| `super` | | [Classes](#classes) | Reference to properties / constructor of the base class | [spec](https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#49-the-super-keyword), [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes#Super_class_calls_with_super) |
| `switch...case` | | [Control flow](#control-flow) | | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch) |
| `symbol` | | [Primitive types](#primitive-types) | [`symbol` type](Symbols.md) | |
| `this` | | [Functions](#functions) | | [spec](https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#42-the-this-keyword), [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this) |
| `this` | | [Type annotation](#type-annotation) | Represents the actual type ([derived or implemented](Advanced%20Types.md#polymorphic-this-types)) within a (base) class or interface | |
| `this` | `(this: ` _annotation_) | [Functions](#functions) | [`this` parameter](Functions.md#this-parameters) | |
| `this` | `this is` _T_ | [Classes](#classes) | [`this`-based type guards](https://github.com/Microsoft/TypeScript/wiki/What%27s-new-in-TypeScript#this-based-type-guards) | |
| `true` | | [Literal](#literal) | | [spec](https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#322-the-boolean-type) |
| `try`...`catch`...`finally` | | [Control flow](#control-flow) | | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch) |
| `type` | | [User-defined type](#user-defined-type) | [Type alias](Advanced%20Types.md#type-aliases) | |
| `typeof` | | [Type operation](#type-operation) | | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof) |
| `typeof` | | [Type annotation](#type-annotation) | Copies the type of an existing identifier | [spec](https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#3810-type-queries) |
| `undefined` | | [Literal](#literal) | | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined) |
| `undefined` | | [Primitive types](#primitive-types) | [`undefined` type](Basic%20Types.md#null-and-undefined) | |
| `value` | | [Property descriptors](#property-descriptors) | Value associated with a property | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) |
| `var` | | [Variable declaration](#variable-declaration) | [`var` declaration](Variable%20Declarations.md#var-declarations) | |
| `void` | | | Evaluates expression but returns `undefined` | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/void) |
| `void` | | [Primitive types](#primitive-types) | [`void` type](Basic%20Types.md#void) | |
| `while` | | [Control flow](#control-flow) | | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/while) |
| `writable` | | [Property descriptors](#property-descriptors) | Can property be written to | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) |
| `yield` | | [Functions](#functions) | Returns next value of generator function | [PR#2783](https://github.com/Microsoft/TypeScript/issues/2873), [spec](https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#67-generator-functions) |

---

### By category

Category | Keyword | Syntax | Description | External links
---|---|---|---|---
| <div id="literal">Literal</div> | `false` |  |  | [spec](https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#322-the-boolean-type) |
| Literal | `null` |  |  | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null) |
| Literal | `true` |  |  | [spec](https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#322-the-boolean-type) |
| Literal | `undefined` |  |  | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined) |
| <div id="variable-declaration">Variable declaration</div> | `const` |  | [`const` declaration](Variable%20Declarations.md#const-declarations) | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const) |
| Variable declaration | `let` |  | [`let` declaration](Variable%20Declarations.md#let-declarations) | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let) |
| Variable declaration | `var` |  | [`var` declaration](Variable%20Declarations.md#var-declarations) |  |
| <div id="control-flow">Control flow</div> | `break` |  |  | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/break) |
| Control flow | `continue` |  |  | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/continue) |
| Control flow | `default` |  | Part of `switch...case` | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/default) |
| Control flow | `do`...`while` |  |  | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/do...while) |
| Control flow | `for` |  |  | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for) |
| Control flow | `for`...`in` |  |  | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in) |
| Control flow | `for`...`of` |  |  | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of) |
| Control flow | `if`...`else` |  |  | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else) |
| Control flow | `switch...case` |  |  | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch) |
| Control flow | `try`...`catch`...`finally` |  |  | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch) |
| Control flow | `while` |  |  | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/while) |
| <div id="functions">Functions</div> | `async` |  | Marks function as asynchronous | [ES draft](http://tc39.github.io/ecmascript-asyncawait/), [PR#1664](https://github.com/Microsoft/TypeScript/issues/1664), [spec](https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#68-asynchronous-functions) |
| Functions | `await` |  | Waits for value within an asynchronous function | [ES draft](http://tc39.github.io/ecmascript-asyncawait/), [PR#1664](https://github.com/Microsoft/TypeScript/issues/1664), [spec](https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#68-asynchronous-functions) |
| Functions | `function` |  | [Function declaration](Functions.md#functions) | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function) |
| Functions | `return` |  |  | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/return) |
| Functions | `this` |  |  | [spec](https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#42-the-this-keyword), [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this) |
| Functions | `this` | `(this: ` _annotation_) | [`this` parameter](Functions.md#this-parameters) |  |
| Functions | `yield` |  | Returns next value of generator function | [PR#2783](https://github.com/Microsoft/TypeScript/issues/2873), [spec](https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#67-generator-functions) |
| <div id="property-descriptors">Property descriptors</div> | `configurable` |  | Can property descriptor be changed | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) |
| Property descriptors | `enumerable` |  | Is visible when properties are enumerated | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) |
| Property descriptors | `get` |  | Getter | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) |
| Property descriptors | `set` |  | Setter | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) |
| Property descriptors | `value` |  | Value associated with a property | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) |
| Property descriptors | `writable` |  | Can property be written to | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) |
|  | `debugger` |  |  | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger) |
|  | `delete` |  |  | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/delete) |
|  | `new` |  |  | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new) |
|  | `void` |  | Evaluates expression but returns `undefined` | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/void) |
| <div id="primitive-types">Primitive types</div> | `any` |  | [Describes a type unknown at design time](Basic%20Types.md#any) |  |
| Primitive types | `boolean` |  | [`boolean` type](Basic%20Types.md#boolean) |  |
| Primitive types | `never` |  | [`never` type](https://github.com/Microsoft/TypeScript/wiki/What%27s-new-in-TypeScript#the-never-type) |  |
| Primitive types | `null` |  | [`null` type](Basic%20Types.md#null-and-undefined) |  |
| Primitive types | `number` |  | [`number` type](Basic%20Types.md#number) |  |
| Primitive types | `string` |  | [`string` type](Basic%20Types.md#string) |  |
| Primitive types | `symbol` |  | [`symbol` type](Symbols.md) |  |
| Primitive types | `undefined` |  | [`undefined` type](Basic%20Types.md#null-and-undefined) |  |
| Primitive types | `void` |  | [`void` type](Basic%20Types.md#void) |  |
| <div id="type-annotation">Type annotation</div> | `is` | _parameter_ `is` _type_ | [User-defined type guards](Advanced%20Types.md#user-defined-type-guards) |  |
| Type annotation | `new` |  | Constructor function type | [spec](https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#389-constructor-type-literals) |
| Type annotation | `this` |  | Represents the actual type ([derived or implemented](Advanced%20Types.md#polymorphic-this-types)) within a (base) class or interface |  |
| Type annotation | `typeof` |  | Copies the type of an existing identifier | [spec](https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#3810-type-queries) |
| <div id="type-operation">Type operation</div> | `as` |  | [Type assertion](Basic%20Types.md#type-assertions) |  |
| Type operation | `instanceof` | _expr_ `instanceof` _constructor_ |  | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof) |
| Type operation | `typeof` |  |  | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof) |
| <div id="environment-modules">Environment/modules</div> | `as` | `import {`_item_ `as` _name_`} from "`_path_`"`<br>`import * as `_name_` from "` _path_ `"` | [Module import renaming](Modules.md#import) |  |
| Environment/modules | `as` | `export as namespace` _namespace_ | [UMD/isomorphic modules](Modules.md#umd-modules) |  |
| Environment/modules | `declare` |  | [Ambient declarations](https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#12-ambients) |  |
| Environment/modules | `default` | `export default` _expr_ | [Default exports](Modules.md#default-exports) | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) |
| Environment/modules | `export` |  | Allow access to elements from outside the [module](Modules.md#export) or [namespace](Namespaces.md#namespacing) | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) |
| Environment/modules | `from` | `import` _importExpr_ `from "`_path_`"` | [Location of imported module](Modules.md#import) | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) |
| Environment/modules | `import` |  | [Enable access to a module's exported elements](Modules.md#import) | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) |
| Environment/modules | `import` | `import` _alias_ `=`  _symbol_ | [Define an alias of _symbol_](Namespaces.md#aliases) |  |
| Environment/modules | `module` |  | [Define an ambient module](Modules.md#ambient-modules) |  |
| Environment/modules | `namespace` |  | [Associates the contained elements with the specified namespace](Namespaces.md) |  |
| Environment/modules | `require` | `import` _name_ `= require("`_path_`")` | [Import the custom object defined in a module with `export =`](Modules.md#export--and-import--require) |  |
| <div id="user-defined-type">User-defined type</div> | `enum` |  | [Defines a set of named values](Enums.md) |  |
| User-defined type | `interface` |  | [Defines a type by its shape (structural typing)](Interfaces.md) |  |
| User-defined type | `type` |  | [Type alias](Advanced%20Types.md#type-aliases) |  |
| <div id="user-defined-type-modifier">User-defined-type modifier</div> | `const` | `const enum` | [Forces a const enum](Enums.md) |  |
| User-defined-type modifier | `extends` |  | [Inheritance](Classes.md#inheritance) | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/class) |
| User-defined-type modifier | `implements` | _class_ `implements` _interface_ | [Class must match the shape of the interface](Interfaces.md#implementing-an-interface) |  |
| <div id="classes">Classes</div> | `abstract` | `abstract class` | [Abstract classes (cannot be instantiated; must be inherited)](Classes.md#abstract-classes) |  |
| Classes | `abstract` | `abstract` _member_ | [Inheriting classes must implement this method/property](Classes.md#abstract-classes) |  |
| Classes | `class` |  | [Class declaration/expression](Classes.md) | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes) |
| Classes | `constructor` |  | [Constructor functions](Classes.md#constructor-functions) | [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/constructor) |
| Classes | `get` |  | [Getter](Classes.md#accessors) |  |
| Classes | `set` |  | [Setter](Classes.md#accessors) |  |
| Classes | `static` |  | [Static properties](Classes.md#static-properties) |  |
| Classes | `super` |  | Reference to properties / constructor of the base class | [spec](https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#49-the-super-keyword), [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes#Super_class_calls_with_super) |
| Classes | `this` | `this is` _T_ | [`this`-based type guards](https://github.com/Microsoft/TypeScript/wiki/What%27s-new-in-TypeScript#this-based-type-guards) |  |
| <div id="accessibility-modifier">Accessibility modifier</div> | `private` |  | [Property can be used only from its containing class](Classes.md#understanding-private) |  |
| Accessibility modifier | `protected` |  | [Property can only be used in its containing class, or by classes which inherit from the containing class](Classes.md#understanding-protected) |  |
| Accessibility modifier | `public` |  | [Property can be used from outside its containing class](Classes.md#public-by-default) |  |
| <div id="member-modifier">Member modifier</div> | `readonly` |  | [Property's value can be read, but not written to](Classes.md#readonly-modifier) |  |