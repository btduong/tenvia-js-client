/**
 * Type def for ApiService.
 *
 * The result is containing either the data or an Error.
 */
export type ServiceResponseResult<T> = { data: T; error: null } | { data: null; error: Error };
