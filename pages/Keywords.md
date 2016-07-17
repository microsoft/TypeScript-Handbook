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
any | [Describes a type unknown at design time](http://www.typescriptlang.org/docs/handbook/basic-types.html#any)
boolean | [Boolean](http://www.typescriptlang.org/docs/handbook/basic-types.html#boolean)
null | _Missing Handbook link_ ([Spec](https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#326-the-null-type))
number | [Number](http://www.typescriptlang.org/docs/handbook/basic-types.html#number)
string | [String](http://www.typescriptlang.org/docs/handbook/basic-types.html#string)
symbol | [Symbol](http://www.typescriptlang.org/docs/handbook/symbols.html)
undefined | _Missing Handbook link_ ([Spec](https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#327-the-undefined-type))
void | _Missing Handbook link_ ([Spec](https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#325-the-void-type))

Other basic type-related keywords:

Keyword | Description
---|---
as | [Type assertion](http://www.typescriptlang.org/docs/handbook/basic-types.html#type-assetions)
is | _Missing link_

User-defined types:

Keyword | Description
---|---
enum | [Defines an enum - a set of named values](http://www.typescriptlang.org/docs/handbook/enums.html)
type | [Type alias](http://www.typescriptlang.org/docs/handbook/advanced-types.html#type-aliases)
interface | [Defines a type by its shape (structural typing)](http://www.typescriptlang.org/docs/handbook/interfaces.html)

Modifiers on user-defined type:

Keyword | Description | Applies to
---|---|---
abstract | [Abstract classes (cannot be instantiated; must be inherited)](http://www.typescriptlang.org/docs/handbook/classes.html#abstract-classes) | class
const | [Forces a const enum](http://www.typescriptlang.org/docs/handbook/enums.html) | enum
implements | [Defines a class as implementing a given interface](http://www.typescriptlang.org/docs/handbook/interfaces.html#implementing-an-interface) | class

Modifiers on **members** of class/interface definitions:

Keyword | Description
---|---
abstract | [Inheriting classes must implement this method](http://www.typescriptlang.org/docs/handbook/classes.html#abstract-classes)
static | [Defines a member on the class, and not on the instance](http://www.typescriptlang.org/docs/handbook/classes.html#static-properties)
readonly | [Property's value can be read, but not written to](https://github.com/Microsoft/TypeScript/pull/6532)
private | [Property can be used only from its containing class](https://www.typescriptlang.org/docs/handbook/classes.html#understanding-private)
protected | [Property can only be used in its containing class, or by classes which inherit from the containing class](https://www.typescriptlang.org/docs/handbook/classes.html#understanding-protected)
public | [Property can be used from outside its containing class](https://www.typescriptlang.org/docs/handbook/classes.html#public-by-default)

Code organization and environment:

Keyword | Description
---|---
declare | [Ambient declarations -- elements created by the environment or other scripts](Missing link)
module | [Define an ambient module](http://www.typescriptlang.org/docs/handbook/modules.html#ambient-modules)
namespace | [Associates the contained types with the specified namespace](http://www.typescriptlang.org/docs/handbook/namespaces.html)
require | [Missing description](http://www.typescriptlang.org/docs/handbook/modules.html#export--and-import--require)

---

Unknown:

Keyword |
---|
from|
of|
package|
