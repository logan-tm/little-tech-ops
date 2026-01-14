// Prevents Node from having to pull from process.env over and over again
// config becomes cached, no repeat pulls!

const getRequiredConfig = () => {
  const required: Record<string, string | undefined> = {
    DB_FILE_NAME: process.env.DB_FILE_NAME,
    REDIS_URL: process.env.REDIS_URL,
    NODE_ENV: process.env.NODE_ENV,
    JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET,
    JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET,
  };

  const missingConfigItems = [];
  for (const key in required) {
    if (Object.prototype.hasOwnProperty.call(required, key)) {
      if (required[key] === undefined) {
        missingConfigItems.push(key);
      }
    }
  }

  if (missingConfigItems.length > 0) {
    throw new Error(
      `Missing required configuration settings: ${missingConfigItems.join(
        ", "
      )}`
    );
  }

  return required as Record<string, string>;
};

const getOptionalConfig = () => {
  const optional: Record<string, string> = {
    // if any later on, put here
    // typically with default values
  };

  return optional as Record<string, string>;
};

const config = { ...getRequiredConfig(), ...getOptionalConfig() };

export default config;
