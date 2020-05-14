import { AskCode, AskCodeOrValue, isValue } from '../../askcode';
import { Resources } from './resource';
import { JSONable, typed, TypedValue, untyped } from './typed';

export type Values = Record<string, any>;
export interface Options {
  resources?: Resources;
  values?: Values;
}

export async function run(
  options: Options,
  code: AskCodeOrValue,
  args?: any[]
): Promise<TypedValue<JSONable>> {
  const { resources = {}, values = {} } = options;
  if (isValue(code) || Array.isArray(code) || !(code instanceof AskCode)) {
    return typed(code);
  }

  const { name } = code;
  if (name in resources) {
    return typed(await resources[name].compute(options, code, args));
  }

  if (!(name in values)) {
    throw new Error(`Unknown identifier '${name}'!`);
  }

  const value = typed(values[name]);

  if (value.type.name === 'code' && args) {
    const code = value.value as AskCode;
    return await run(options, code, args);
  }

  return value;
}

export async function runUntyped(
  options: Options,
  code: AskCodeOrValue,
  ...args: any[]
): Promise<JSONable> {
  return untyped(await run(options, code, ...args));
}
