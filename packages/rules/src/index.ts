// Inspired by ArjanCodes' specification for a Predicate system
// https://github.com/ArjanCodes/examples/blob/main/2026/spec

import { defineRule } from "./rules";

type User = {
  is_admin: boolean;
  is_active: boolean;
  account_age: number; // in days
  is_banned: boolean;
  country: string;
  credit_score: number;
  has_manual_override: boolean;
};

const isAdmin = defineRule<User>("is_admin", (user: User) => {
  return user.is_admin;
});

const isActive = defineRule<User>("is_active", (user: User) => {
  return user.is_active;
});

const accountAgeGreaterThan = defineRule<User>(
  "account_age_greater_than",
  (user: User, days: number) => {
    return user.account_age > days;
  },
);

const isInNorthAmerica = defineRule<User>(
  "is_in_north_america",
  (user: User) => {
    const naCountries = ["US", "CA", "MX"];
    return naCountries.includes(user.country);
  },
);

const userCanAccess = isAdmin()
  .or(isActive().and(accountAgeGreaterThan(30)))
  .build();

const userIsInNorthAmerica = isInNorthAmerica().build();

function main() {
  const user: User = {
    is_admin: false,
    is_active: true,
    account_age: 45,
    is_banned: false,
    country: "US",
    credit_score: 700,
    has_manual_override: false,
  };

  const user2: User = {
    is_admin: false,
    is_active: true,
    account_age: 15,
    is_banned: false,
    country: "JP",
    credit_score: 700,
    has_manual_override: false,
  };

  console.log(`User can access: ${userCanAccess(user)}`);
  console.log(`User2 can access: ${userCanAccess(user2)}`);

  console.log(`User is in North America: ${userIsInNorthAmerica(user)}`);
  console.log(`User2 is in North America: ${userIsInNorthAmerica(user2)}`);
}

main();
