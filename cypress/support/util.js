export function getEnvironmentVariable(name) {
  const env = Cypress.env(name);
  if (!env) {
    throw new Error(`Environment variable ${name} not found!`);
  } else {
    return env;
  }
}
