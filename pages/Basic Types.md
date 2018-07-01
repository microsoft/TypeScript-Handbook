# TypeScript 소개

프로그램을 유용하게 할려면, 가장 간단한 데이터 단위를 사용할 수 있어야 합니다. 숫자, 문자열, 구조체, 참과 거짓 값 같은 것들이 있습니다.
TypeScript에서는 JavaScript에서 사용하는 같은 type을 지원합니다. 편리한 열거?

For programs to be useful, we need to be able to work with some of the simplest units of data: numbers, strings, structures, boolean values, and the like.
In TypeScript, we support much the same types as you would expect in JavaScript, with a convenient enumeration type thrown in to help things along.

# Boolean

가장 기초적인 데이터 타입은 참/거짓 값 입니다. 그리고 JavaScript와 TypeScript에서는 `boolean` 값 이라고 부릅니다.

The most basic datatype is the simple true/false value, which JavaScript and TypeScript call a `boolean` value.

```ts
let isDone: boolean = false;
```

# Number

JavaScript와 같이 TypeScript에서도 모든 숫자는 부동 소수점 값입니다.
부동 소수점 숫자들은 `number` 타입을 가지고 있습니다. 또한 16진수와 10진수 리터럴도 같은 타입을 가집니다.
TypeScript는 ECMAScript 2015에서 소개된 2진수와 8진수 리터럴도 지원 합니다.

As in JavaScript, all numbers in TypeScript are floating point values.
These floating point numbers get the type `number`.
In addition to hexadecimal and decimal literals, TypeScript also supports binary and octal literals introduced in ECMAScript 2015.

```ts
let decimal: number = 6;        //10진수
let hex: number = 0xf00d;       //16진수
let binary: number = 0b1010;    //2진수
let octal: number = 0o744;      //8진수
```

# String

JavaScript에서 웹페이지와 서버를 만드는 같은 일을 할떄, 기본적인 부분은 텍스트 데이터를 사용하는것입니다.
다른 언어와 마찬가지로 `string` 타입으로 텍스트을 참조하기 위해서 사용합니다.
JavaScript 처럼 TypeScript에서도 쌍따옴표 (`"`) 나 작은 따옴표 (`'`) 를 사용하여 문자열 데이터를 감싸서 사용합니다.

Another fundamental part of creating programs in JavaScript for webpages and servers alike is working with textual data.
As in other languages, we use the type `string` to refer to these textual datatypes.
Just like JavaScript, TypeScript also uses double quotes (`"`) or single quotes (`'`) to surround string data.

```ts
let color: string = "blue";
color = 'red';
```

또한 *템플릿 문자열*을 사용하여 여러 줄이나 내장된 표현식을 사용할수 있습니다.
아래 문자열은 역 따옴표/역 인용 부호(`` ` ``) 문자로 감싸서 사용하고 `${ expr }` 으로 내장된 표현식을 상용 합니다.

You can also use *template strings*, which can span multiple lines and have embedded expressions.
These strings are surrounded by the backtick/backquote (`` ` ``) character, and embedded expressions are of the form `${ expr }`.

```ts
let fullName: string = `Bob Bobbington`;
let age: number = 37;
let sentence: string = `Hello, my name is ${ fullName }.

I'll be ${ age + 1 } years old next month.`;
```

이것은 `문장` 을 다음과 같이 선언하는 것과 같습니다.

This is equivalent to declaring `sentence` like so:

```ts
let sentence: string = "Hello, my name is " + fullName + ".\n\n" +
    "I'll be " + (age + 1) + " years old next month.";
```

# Array

TypeScript에서 JavaScript처럼 값을 배열하여 사용할 수 있습니다.
배열 타입은 두가지 방법 중 하나를 선택하여 작성할 수 있습니다.
첫번째 방법은 `[]`를 타입뒤에 선언하여 배열을 선언 할 수 있습니다..

TypeScript, like JavaScript, allows you to work with arrays of values.
Array types can be written in one of two ways.
In the first, you use the type of the elements followed by `[]` to denote an array of that element type:

```ts
let list: number[] = [1, 2, 3];
```

두번째 방법은 일반적인 배열 타입인 `Array<elemType>` 사용하는 것 입니다.

The second way uses a generic array type, `Array<elemType>`:

```ts
let list: Array<number> = [1, 2, 3];
```

# Tuple

Tuple 타입은 배열에서 다른 타입이 필요할때, 배열 위치에 타입을 고정하여 표현할 수 있습니다.
예시로 `string` 과 `number` 두 가지 값이 필요할 수 있습니다. 

Tuple types allow you to express an array where the type of a fixed number of elements is known, but need not be the same.
For example, you may want to represent a value as a pair of a `string` and a `number`:

```ts
// Declare a tuple type
let x: [string, number];
// Initialize it
x = ["hello", 10]; // OK
// Initialize it incorrectly
x = [10, "hello"]; // Error
```

고정된 위치에 접근을 하면 알맞은 타입을 찾습니다.

When accessing an element with a known index, the correct type is retrieved:

```ts
console.log(x[0].substr(1)); // OK
console.log(x[1].substr(1)); // Error, 'number' does not have 'substr'
```

고정된 위치 밖으로 접근하면 union 타입이 대신 사용됨니다.

When accessing an element outside the set of known indices, a union type is used instead:

```ts
x[3] = "world"; // OK, 'string' can be assigned to 'string | number'

console.log(x[5].toString()); // OK, 'string' and 'number' both have 'toString'

x[6] = true; // Error, 'boolean' isn't 'string | number'
```

Union 타입은 이후 Advanced Types장에서 다루는 고급 주제입니다.

Union types are an advanced topic that we'll cover in a later chapter.

# Enum

표준 데이터 타입을 JavaScript에서 유용하게 추가하는 방법은 `enum`입니다.
C#과 같이 enum은 친근한 이름으로 숫자값을 설정할 수 있는 방법입니다. 

A helpful addition to the standard set of datatypes from JavaScript is the `enum`.
As in languages like C#, an enum is a way of giving more friendly names to sets of numeric values.

```ts
enum Color {Red, Green, Blue}
let c: Color = Color.Green;
```

기본적으로 enum은 0부터 시작하여 번호를 매깁니다.
하나의 값을 지정하여 자동으로 번호 매기는 방법을 바꿀 수 있습니다.
예로 이전 예제를 `0` 대신 `1` 부터 번호가 시작 되도록 할수 있습니다.

By default, enums begin numbering their members starting at `0`.
You can change this by manually setting the value of one of its members.
For example, we can start the previous example at `1` instead of `0`:

```ts
enum Color {Red = 1, Green, Blue}
let c: Color = Color.Green;
```

혹은 enum에 값을 모두 지정하여 사용 할 수 있습니다.

Or, even manually set all the values in the enum:

```ts
enum Color {Red = 1, Green = 2, Blue = 4}
let c: Color = Color.Green;
```

enum의 편리한 기능은 숫자 값으로 enum안의 이름 값을 가져올 수 있습니다.
예로 `2`라는 값이 있으나 `Color`에서 무엇과 매핑이 되는지 확신할 수 없을때, 위 enum 값에서 동일한 이름을 찾을 수 있습니다.

A handy feature of enums is that you can also go from a numeric value to the name of that value in the enum.
For example, if we had the value `2` but weren't sure what that mapped to in the `Color` enum above, we could look up the corresponding name:

```ts
enum Color {Red = 1, Green, Blue}
let colorName: string = Color[2];

console.log(colorName); // Displays 'Green' as its value is 2 above
```

# Any

어플리케이션에서 변수의 타입을 알 수 없을 수 도 있습니다.
예로 외부 라이브러리를 사용하거나 유저에게서 값이 올 경우 입니다. 이런 값들은 동적으로 올 수 있습니다.
이런 경우에는 타입 검사를 컴파일 시에 통과하도록 설정 해야 합니다.
그렇게 하기 위해서 `any` 타입으로 명시합니다.

We may need to describe the type of variables that we do not know when we are writing an application.
These values may come from dynamic content, e.g. from the user or a 3rd party library.
In these cases, we want to opt-out of type-checking and let the values pass through compile-time checks.
To do so, we label these with the `any` type:

```ts
let notSure: any = 4;
notSure = "maybe a string instead";
notSure = false; // okay, definitely a boolean
```

`any` 타입은 JavaScript에서 존제하는 강력한 방법 입니다
비슷한 밥벅으로 `Object`와 같이 기대할 수 있습니다. 다른 언어들 처럼
그러나 `Object`타입의 변수는 

The `any` type is a powerful way to work with existing JavaScript, allowing you to gradually opt-in and opt-out of type-checking during compilation.
You might expect `Object` to play a similar role, as it does in other languages.
But variables of type `Object` only allow you to assign any value to them - you can't call arbitrary methods on them, even ones that actually exist:

```ts
let notSure: any = 4;
notSure.ifItExists(); // okay, ifItExists might exist at runtime
notSure.toFixed(); // okay, toFixed exists (but the compiler doesn't check)

let prettySure: Object = 4;
prettySure.toFixed(); // Error: Property 'toFixed' doesn't exist on type 'Object'.
```

The `any` type is also handy if you know some part of the type, but perhaps not all of it.
For example, you may have an array but the array has a mix of different types:

```ts
let list: any[] = [1, true, "free"];

list[1] = 100;
```

# Void

`void`는 조금 `any`와 비슷한 기능을 가지고 있으나 any타입의 기능을 모두 가지고 있지는 않습니다.
주로 함수에서 리턴 값이 없을때 주로 볼 수 있습니다.

`void` is a little like the opposite of `any`: the absence of having any type at all.
You may commonly see this as the return type of functions that do not return a value:

```ts
function warnUser(): void {
    console.log("This is my warning message");
}
```

`void`타입의 변수가 선언되는 것은 유용하지 않습니다. `undefined`나 `null`로 할당되기 때문입니다.

Declaring variables of type `void` is not useful because you can only assign `undefined` or `null` to them:

```ts
let unusable: void = undefined;
```

# Null 과 Undefined

TypeScript에서 `undefined` 와 `null`은 사실 각각 자신 이름의 타입을 가지고 있습니다.
`void`랑 비슷하나 이 둘은 매우 유용하지 않습니다.

In TypeScript, both `undefined` and `null` actually have their own types named `undefined` and `null` respectively.
Much like `void`, they're not extremely useful on their own:

```ts
// Not much else we can assign to these variables!
let u: undefined = undefined;
let n: null = null;
```

기본적으로 `null` 과 `undefined` 는 다른 모든 타입의 기본이 됩니다.
이 의미는 `number`에 `null`이나 `undefined`를 할당할수 있습니다.

By default `null` and `undefined` are subtypes of all other types.
That means you can assign `null` and `undefined` to something like `number`.

그러나 `--strictNullChecks` 선언이 되면 `undefined` 와 `null` 은 `void`와 각각 자신의 타입에만 할당할수 있습니다.
이것은 *많은* 오류를 피할수 있습니다.
이런경우에는 `string` `null` `undefined`
Union 타입에 대한 자세한 내용은 나중에 나와잇습니다.

However, when using the `--strictNullChecks` flag, `null` and `undefined` are only assignable to `void` and their respective types.
This helps avoid *many* common errors.
In cases where you want to pass in either a `string` or `null` or `undefined`, you can use the union type `string | null | undefined`.
Once again, more on union types later on.

> 주의사항: 가능하면 `--strictNullChecks`를 사용하는것을 권장합니다. 그러나 handbook 목정 상 옵션이 꺼져있다고 가정합니다.

> As a note: we encourage the use of `--strictNullChecks` when possible, but for the purposes of this handbook, we will assume it is turned off.

# Never

`never` 타입은 절대로 발생하지 않는 값을 나타냅니다.
예시로 `never`은 함수 표현식 이거나 언제나 예외를 던지는 화살표 함수 이거나 절대로 반환되지 않는 표현식입니다.
변수 또한 `never` 타입을 가질 수 있으나 타입 보호에 의해 값이 할당되지 않습니다.

The `never` type represents the type of values that never occur.
For instance, `never` is the return type for a function expression or an arrow function expression that always throws an exception or one that never returns;
Variables also acquire the type `never` when narrowed by any type guards that can never be true.

`never` 타입은 모든 타입의 서브 타입이며, 모든 타입에 할당이 가능합니다. 그러나 반대로 `never` 에 할당하거나 서브 타입이 될수 없습니다 (`never` 스스로 제외하고)
`never`에는 `any` 조차 할당 될 수 없습니다.

The `never` type is a subtype of, and assignable to, every type; however, *no* type is a subtype of, or assignable to, `never` (except `never` itself).
Even `any` isn't assignable to `never`.

함수가 `never`을 변환하는 몇 가지 예시 입니다.

Some examples of functions returning `never`:

```ts
// 함수가 never를 변환 할려면 반드시 종점에 도달할 수 없어야 합니다.
// Function returning never must have unreachable end point
function error(message: string): never {
    throw new Error(message);
}

// 리턴 타입은 never로 추론됩니다.
// Inferred return type is never
function fail() {
    return error("Something failed");
}

// 함수는 반복문에의해 반복되에 끝나지 안습니다.
// Function returning never must have unreachable end point
function infiniteLoop(): never {
    while (true) {
    }
}
```

# Object

`object` 는 기본적으로 표시되는 타입이 아닙니다. 즉 `number` `string` `boolean` `symbol` `null` `undefined` 같은 것이 아닙니다.

`object` 타입과 APIs는 `Object.create` 로 좀더 좋게 표현할 수 있습니다. 예시로:

`object` is a type that represents the non-primitive type, i.e. any thing that is not `number`, `string`, `boolean`, `symbol`, `null`, or `undefined`.

With `object` type, APIs like `Object.create` can be better represented. For example:

```ts
declare function create(o: object | null): void;

create({ prop: 0 }); // OK
create(null); // OK

create(42); // Error
create("string"); // Error
create(false); // Error
create(undefined); // Error
```

# Type 명시

때로는 TypeScript의 보다 더 많은 것을 알게되는 상황이 올것입니다.


Sometimes you'll end up in a situation where you'll know more about a value than TypeScript does.
Usually this will happen when you know the type of some entity could be more specific than its current type.

"날 믿어, 난 내가 뭘하는지 알아"
*Type assertions* are a way to tell the compiler "trust me, I know what I'm doing."
A type assertion is like a type cast in other languages, but performs no special checking or restructuring of data.
It has no runtime impact, and is used purely by the compiler.
TypeScript assumes that you, the programmer, have performed any special checks that you need.

타입 명시하는 방법은 두 가지 형태가 있습니다.
하나는 "꺽쇠 괄호" 구문 입니다.

Type assertions have two forms.
One is the "angle-bracket" syntax:

```ts
let someValue: any = "this is a string";

let strLength: number = (<string>someValue).length;
```

그리고 다른 하나는 `as` 구문입니다.

And the other is the `as`-syntax:

```ts
let someValue: any = "this is a string";

let strLength: number = (someValue as string).length;
```

두 예시는 동일합니다.
선호에 따라 하나를 선택하여 사용하면 됩니다. 그러나 TypeScript를 JSX와 같이 사용한다면 `as` 형태의 명시만 허용됩니다.

The two samples are equivalent.
Using one over the other is mostly a choice of preference; however, when using TypeScript with JSX, only `as`-style assertions are allowed.

# `let` 에 대한 공지

이미 알고 계시겠지만, JavaScript의 `var` 키워드를 사용하는 것 대신`let`을 사용하는것이 좀더 익숙할것입니다.
`let` 키워드는 사실 TypeScript에서 사용할수 있는 JavaScript 최신 구문입니다.
자세한건 나중에 다루겠습니다, 그러나 많은 JavaScript의 주된 문제는 `let` 을 사용하는것으로 해결됨니다. 그레서 가능하면 언제든지 `var` 대신 사용해야 합니다.

You may've noticed that so far, we've been using the `let` keyword instead of JavaScript's `var` keyword which you might be more familiar with.
The `let` keyword is actually a newer JavaScript construct that TypeScript makes available.
We'll discuss the details later, but many common problems in JavaScript are alleviated by using `let`, so you should use it instead of `var` whenever possible.
