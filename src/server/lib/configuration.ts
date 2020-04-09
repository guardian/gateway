import { Configuration } from "../models/Configuration";

export function getConfiguration(): Configuration {
  const port = process.env.PORT;

  if (!port) {
    throw Error("Port configuration missing.");
  }

  return {
    port: +port
  };
}
