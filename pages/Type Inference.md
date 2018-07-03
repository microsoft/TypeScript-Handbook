# Introduction

In this section, we will cover type inference in TypeScript. Namely, we'll discuss where and how types are inferred.

이 섹션에서는, 우리는 TypeScript 에서의 타입 추론을 탐구할것이다. 말그대로, 우리는 어디서 , 어떻게 타입들이 추론이 되어지에 대해서 이야기할것이다.

# Basics(기본)

In TypeScript, there are several places where type inference is used to provide type information when there is no explicit type annotation. For example, in this code

TypeScript에서 , 타입 어노테이션이 명시적이지 않는 곳이 있을때 , 타입 추론이 타입 정보를 제공해주는 몇명 곳에서 있다. 예를들면, 이 코드에서. 


```ts
let x = 3;
```

The type of the `x` variable is inferred to be `number`.
This kind of inference takes place when initializing variables and members, setting parameter default values, and determining function return types.

`x` 변수의 타입은 `number`로 추론되어진다.
이런 종류의 추론은 변수나 멤버들, 기본값 파라미터를 세팅하거나, 함수의 리턴 타입을 결정할때 일어난다.

In most cases, type inference is straightforward.
In the following sections, we'll explore some of the nuances in how types are inferred.

많은 경우에서, 타입추론은 아주쉽게 일어난다.
다은 섹션에서, 우리는 어덯게 타입이 되어지는 것에 대한 몇몇 미묘한 부분들에 대해서 볼것이다.

# Best common type

When a type inference is made from several expressions, the types of those expressions are used to calculate a "best common type". For example,

타입 추론은 몇몇 표현식으부터 만들어질때, 그러한 표현식의 타입들은 "best common type"으로 계산되어 사용되어 진다. 예를들면,

```ts
let x = [0, 1, null];
```

To infer the type of `x` in the example above, we must consider the type of each array element.
Here we are given two choices for the type of the array: `number` and `null`.
The best common type algorithm considers each candidate type, and picks the type that is compatible with all the other candidates.

위 예시에서 `x`의 타입을 추론하기 위해는, 우리는 각각 타입의 배열 요소를 고려해야만 한다.
배열의 타입에 대해서 2가지 선택이 주어진다:`number` 그리고 `null`.
best common type algorithm은 각각의 후보 타입을 고려하고, 모든 모다른 후보자들과 호환될수 있는 타입을 선택한다.

Because the best common type has to be chosen from the provided candidate types, there are some cases where types share a common structure, but no one type is the super type of all candidate types. For example:

best common type는 주어진 후보 타입들로부터 선택되어야만 하기 때문에, 
타입은 공통적인 구조를 공유하는 곳에서 몇몇 케이스도 있지만, 하나의 타입이 모든 후보 타입들의 super 타입은 아니다. 예를들면:


```ts
let zoo = [new Rhino(), new Elephant(), new Snake()];
```


Ideally, we may want `zoo` to be inferred as an `Animal[]`, but because there is no object that is strictly of type `Animal` in the array, we make no inference about the array element type.
To correct this, instead explicitly provide the type when no one type is a super type of all other candidates:

관념적으로, 우리는 `zoo`가  `Animal[]`으로 추론되기를 원하지만, 배열의 `Animal` 타입의 배열로 엄격하게 제한하는게 목적이 아니기 때문에, 배열 엘리멘트 타입으로 추론할수 없다. 

```ts
let zoo: Animal[] = [new Rhino(), new Elephant(), new Snake()];
```

When no best common type is found, the resulting inference is the union array type, `(Rhino | Elephant | Snake)[]`.
best common type이 찾을수 없을때, 결과를 주는 추론은 union array type(`(Rhino | Elephant | Snake)[]`)이다. 

# Contextual Type

Type inference also works in "the other direction" in some cases in TypeScript.
This is known as "contextual typing". Contextual typing occurs when the type of an expression is implied by its location. For example:

타입 추론에는 또한 TypeScript에서 "또다른방향"으로 동작한다.
이것은 "contextual typing"으로 알려져 있다. Contextual typing은 표현식의 타입이 이것의 위치에 따라서 내포될때 발생한다. 예를들면,


```ts
window.onmousedown = function(mouseEvent) {
    console.log(mouseEvent.button);  //<- Error(에러)
};
```

For the code above to give the type error, the TypeScript type checker used the type of the `Window.onmousedown` function to infer the type of the function expression on the right hand side of the assignment.
When it did so, it was able to infer the type of the `mouseEvent` parameter.
If this function expression were not in a contextually typed position, the `mouseEvent` parameter would have type `any`, and no error would have been issued.

위 코드에서 주어지는 타입 에러는, TypeScript type checker는 `Window.onmousedown`의 오른쪽편의 할당된 함수 표현식의 타입을 추론하여 사용한다.
이렇게 될때, 이것은  `mouseEvent` 파라미터의 타입으로 추론할수있다.
만약 이 함수 표현식이 맥락전익 타입된 위치가 아니라면, `mouseEvent` 파라미터의 `any` 타입을 가지고, 에러 이슈는 없게된다.

If the contextually typed expression contains explicit type information, the contextual type is ignored.
Had we written the above example:

contextually typed expression 이 명시적인 타입 정보를 포함한다면, contextual type을 무시된다.
위에 예시에 있다:

```ts
window.onmousedown = function(mouseEvent: any) {
    console.log(mouseEvent.button);  //<- Now, no error is given(지금, 여기에는 에러가 일어나지 않는다.)
};
```

The function expression with an explicit type annotation on the parameter will override the contextual type.
Once it does so, no error is given as no contextual type applies.

파라미터에 명시적인 type annotation를 가진 함수 expression은 contextual type보다 더 우선한다.
한번 이렇게 되면, contextual type 적용되지 않은 것처럼 에러가 나지는 않는다.


Contextual typing applies in many cases.
Common cases include arguments to function calls, right hand sides of assignments, type assertions, members of object and array literals, and return statements.
The contextual type also acts as a candidate type in best common type. For example:

Contextual typing은 많은 케이스에 적용된다.
Common cases include arguments to function calls, right hand sides of assignments, type assertions, members of object and array literals, and return statements.
contextual type은 또한 best common type의 후보타입으로 동작한다 예들 들면: 

```ts
function createZoo(): Animal[] {
    return [new Rhino(), new Elephant(), new Snake()];
}
```

In this example, best common type has a set of four candidates: `Animal`, `Rhino`, `Elephant`, and `Snake`.
Of these, `Animal` can be chosen by the best common type algorithm.

이 예시에서, best common type 은 `Animal`, `Rhino`, `Elephant`, 그리고 `Snake` 의 후보 타입들을 가진다.
여기서, `Animal` 은 best common type algorithm에 의해서 선택되어진다.
