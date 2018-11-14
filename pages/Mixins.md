# Introduction

Along with traditional OO hierarchies, another popular way of building up classes from reusable components is to build them by combining simpler partial classes.
You may be familiar with the idea of mixins or traits for languages like Scala, and the pattern has also reached some popularity in the JavaScript community.

# Mixin sample

In the code below, we show how you can model mixins in TypeScript.
After the code, we'll break down how it works.

__Please note:__ this sample uses ECMAScript 2017 syntax that was to Typescript in version 2.2. It will not work in older versions.

```ts
type Constructor<T> = new (...args: any[]) => T;

// Disposable Mixin
function Disposable<T extends Constructor<{}>>(SuperClass: T) {
  return class extends SuperClass {
    isDisposed = false;
    dispose() {
      this.isDisposed = true;
    }
  };
}

// Activatable Mixin
function Activatable<T extends Constructor<{}>>(SuperClass: T) {
  return class extends SuperClass {
    isActive = false;
    activate() {
      this.isActive = true;
    }
    deactivate() {
      this.isActive = false;
    }
  };
}

class SmartObject extends Disposable(Activatable(Object)) {
  constructor() {
    super();
    setInterval(
      () => console.log(this.isActive + ' : ' + this.isDisposed),
      500,
    );
  }

  interact() {
    this.activate();
  }
}

let smartObj = new SmartObject();
setTimeout(() => smartObj.interact(), 1000);
```

# Understanding the sample
The code sample starts with the Constructor type.
This is a helper type that specifies what a constructor looks like.

```ts
type Constructor<T> = new (...args: any[]) => T;
```

Next the two mixins are defined. They are functions that return a class with the functionality we want to add.
You can see each one is focused on a particular activity or capability.
We'll later mix these together to form a new class from both capabilities.
The `Constructor` type is used to constrain what kind of super class the mixin can enhance, in this case it's simply set to the Object type: `{}`.

```ts
function Disposable<T extends Constructor<{}>>(SuperClass: T) {
  return class extends SuperClass {
    // ...
  };
}
```

Next, we'll create the class that will handle the combination of the two mixins.
The mixins are applied using the `extends` clause. You'll notice we're using `Object` as a base class, but you can extend any base class you like.
The mixins are applied on top of the base class by calling their functions with the base class as a parameter.

```ts
class SmartObject extends Disposable(Activatable(Object)) {
```

Finally, we instantiate our `SmartObject` and see that the mixin's properties and methods are available as expected.
