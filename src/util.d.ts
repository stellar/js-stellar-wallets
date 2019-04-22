export type OmitProperties<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
