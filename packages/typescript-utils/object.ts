export type HasKey<T, K extends keyof T> = K extends keyof T ? true : false
export type HasKeys<T> = keyof T extends never ? false : true
export type Keyof<T> = keyof T & string