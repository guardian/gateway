/**
 * Interface for RequestError.
 * Type for errors caught in Express controllers.
 *
 * @type RequestError
 */
export type RequestError = {
  message: string;
  status: number;
};
