# Typescript Keywords

The following keywords have the same meaning in Typescript as they do in Javascript:

Keyword | Notes
---|---
async, await | [ES draft](http://tc39.github.io/ecmascript-asyncawait/)
break | |
continue | |
class, extends, constructor, super | `extends` can also be used with `interface` |
const, let, var | `const`can also be used as a modifier for `enum`|
debugger | |
delete | |
do, while | |
export, import | |
for, each, in, of | |
function, return | |
get, set | |
if, else | |
instanceof, typeof | |
null, undefined | Can also refer to the `null` and `undefined` types|
switch, case, default | |
this | |
true, false | |
try, catch, finally | |
void | Can also refer to the `void` type |
yield | |

Unless otherwise noted, more information can be found on the [Mozilla Developer Network](https://developer.mozilla.org/en-US/docs/Web/JavaScript) or on [MSDN](https://msdn.microsoft.com/en-us/library/d1et7k7c%28v=vs.94%29.aspx)

---

The following keywords are used for [basic type annotations](http://www.typescriptlang.org/docs/handbook/basic-types.html):

Keyword | Description
---|---
any | [Describes a type unknown at design time](basic%20types.md#any)
boolean | [boolean](basic%20types.md#boolean)
never | _Missing link_
null | [null](Basic%20Types.md#null-and-undefined)
number | [number](basic%20types.md#number)
string | [string](basic%20types.md#string)
symbol | [Symbol](symbols.md)
undefined | [undefined](Basic%20Types.md#null-and-undefined)
void | [void](Basic%20Types.md#void)

Other basic type-related keywords:

Keyword | Description
---|---
as | [Type assertion](basic%20types.md#type-assetions)
is | [User-defined type guards](advanced%20types.md#user-defined-type-guards)

User-defined types:

Keyword | Description
---|---
enum | [Defines an enum - a set of named values](enums.md)
type | [Type alias](advanced%20types.md#type-aliases)
interface | [Defines a type by its shape (structural typing)](interfaces.md)

Modifiers on user-defined type:

Keyword | Description | Applies to
---|---|---
abstract | [Abstract classes (cannot be instantiated; must be inherited)](classes.md#abstract-classes) | class
const | [Forces a const enum](enums.md) | enum
implements | [Defines a class as implementing a given interface](interfaces.md#implementing-an-interface) | class

Modifiers on **members** of class/interface definitions:

Keyword | Description
---|---
abstract | [Inheriting classes must implement this method](classes.md#abstract-classes)
static | [Defines a member on the class, and not on the instance](classes.md#static-properties)
readonly | [Property's value can be read, but not written to](https://github.com/Microsoft/TypeScript/pull/6532)
private | [Property can be used only from its containing class](classes.md#understanding-private)
protected | [Property can only be used in its containing class, or by classes which inherit from the containing class](classes.md#understanding-protected)
public | [Property can be used from outside its containing class](classes.md#public-by-default)

Code organization and environment:

Keyword | Description
---|---
as | [Module import renaming(Spec)](https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#1132-import-declarations)
declare | [Ambient declarations -- elements created by the environment or other scripts](Missing link)
from | [Import declarations (spec)](https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#1132-import-declarations)
module | [Define an ambient module](modules.md#ambient-modules)
namespace | [Associates the contained types with the specified namespace](namespaces.md)
require | [Missing description](modules.md#export--and-import--require)

---

Unknown:

Keyword |
---|
of|
package|
