import * as userSchema from './modules/users/schema';

export const schema = {
  ...userSchema,
};

export type Schema = typeof schema;
