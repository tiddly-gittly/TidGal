/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { commandType, ISentence } from 'src/tidgal/Core/controller/scene/sceneInterface';
import { IPerform } from 'src/tidgal/Core/Modules/perform/performInterface';

/**
 * 规范函数的类型
 * @type {(sentence: ISentence) => IPerform}
 */
export type ScriptFunction = (sentence: ISentence) => IPerform;

export interface IScriptConfig {
  next?: boolean;
  scriptFunction: ScriptFunction;
  scriptType: commandType;
}

export interface IConfigInterface extends IScriptConfig {
  scriptString: string;
}

export function ScriptConfig(
  scriptType: commandType,
  scriptFunction: ScriptFunction,
  config?: Omit<IScriptConfig, 'scriptType' | 'scriptFunction'>,
): IScriptConfig {
  return { scriptType, scriptFunction, ...config };
}

export const scriptRegistry = {} as Record<commandType, IConfigInterface>;

export function defineScripts<R extends Record<string, Omit<IConfigInterface, 'scriptString'>>>(
  record: R,
): {
  [K in keyof R]: IConfigInterface;
} {
  // eslint-disable-next-line
  const result = {} as Record<keyof R, IConfigInterface>;
  for (const [scriptString, config] of Object.entries(record)) {
    result[scriptString as keyof R] = scriptRegistry[config.scriptType] = { scriptString, ...config };
  }
  return result;
}
