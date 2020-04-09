// Import the configuration thing
// Setup some environment variables
// Get the object
// Assert it's got the environment variables
import { getConfiguration } from "@/server/lib/configuration";

describe("getConfiguration", () => {
  test("it returns the configuration object with the correct values", () => {
    const output = getConfiguration();
    const expected = {
      port: 9000
    };
    expect(output).toEqual(expected);
  });
});
