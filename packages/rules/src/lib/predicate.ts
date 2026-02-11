// Inspired by ArjanCodes' specification for a Predicate system
// https://github.com/ArjanCodes/examples/blob/main/2026/spec

type Tail<T extends any[]> = T extends [infer _A, ...infer R] ? R : never;

class Predicate<T> {
  func: (item: T) => boolean;

  constructor(func: (item: T) => boolean) {
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

/**
 * A curried function to define a typed Predicate.
 *
 * @template G - The type of the item the predicate will evaluate.
 *
 * @example
 * const definePersonPredicate = definePredicate<Person>();
 * const isAdult = definePersonPredicate((person: Person) => person.age >= 18);
 * const isFromUSA = definePersonPredicate((person: Person) => person.country === "USA");
 * const isAFanOfSport = definePersonPredicate((person: Person, sport: string) => person.favoriteSports.includes(sport));
 *
 * const isAdultFromUSAThatLikesFootball = isAdult().and(isFromUSA()).and(isAFanOfSport("football")).build();
 * isAdultFromUSAThatLikesFootball(person); // returns true or false
 */
export function definePredicate<G>() {
  return function defineTypedPredicate<
    T extends (item: G, ...args: any[]) => boolean,
  >(func: T): (...args: Tail<Parameters<T>>) => Predicate<G> {
    return (...args: Tail<Parameters<T>>) => {
      return new Predicate<G>((item: G) => {
        return func(item, ...args);
      });
    };
  };
}
