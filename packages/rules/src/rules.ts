// Inspired by ArjanCodes' specification for a Predicate system
// https://github.com/ArjanCodes/examples/blob/main/2026/spec

type PredicateFunction<T> = (item: T) => boolean;
type RuleDefinition = (...args: any[]) => boolean;
type PredicateFactory<T> = (...args: any[]) => Predicate<T>;

// Not necessary, but keeping for potential future use
// const RULES = new Map<string, PredicateFactory<any>>();

class Predicate<T> {
  func: PredicateFunction<T>;

  constructor(func: PredicateFunction<T>) {
    this.func = func;
  }

  evaluate(item: T): boolean {
    return this.func(item);
  }

  build() {
    return this.func;
  }

  and(other: Predicate<T>): Predicate<T> {
    return new Predicate<T>(
      (item: T) => this.evaluate(item) && other.evaluate(item),
    );
  }

  or(other: Predicate<T>): Predicate<T> {
    return new Predicate<T>(
      (item: T) => this.evaluate(item) || other.evaluate(item),
    );
  }

  not(): Predicate<T> {
    return new Predicate<T>((item: T) => !this.evaluate(item));
  }
}

export function defineRule<T>(
  // name: string,
  func: RuleDefinition,
): PredicateFactory<T> {
  function factory(...args: any[]): Predicate<T> {
    return new Predicate<T>((item: T) => func(item, ...args));
  }
  // RULES.set(name, factory);
  return factory;
}
