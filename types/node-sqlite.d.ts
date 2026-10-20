declare module "node:sqlite" {
  type Value = string | number | null;
  type Parameter = Value | Record<string, Value>;
  export class DatabaseSync {
    constructor(path: string, options?: { readOnly?: boolean });
    exec(sql: string): void;
    prepare(sql: string): { get(...args: Parameter[]): Record<string, unknown> | undefined; all(...args: Parameter[]): Record<string, unknown>[]; run(...args: Parameter[]): { changes: number | bigint } };
    close(): void;
  }
}
