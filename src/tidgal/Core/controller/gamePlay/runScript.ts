import { ISentence } from 'src/tidgal/Core/controller/scene/sceneInterface';
import { initPerform, IPerform } from 'src/tidgal/Core/Modules/perform/performInterface';

import { SCRIPT_TAG_MAP, ScriptFunction, scriptRegistry } from 'src/tidgal/Core/parser/sceneParser';
import { WebGAL } from 'src/tidgal/Core/WebGAL';

/**
 * 语句调用器，真正执行语句的调用，并自动将演出在指定时间卸载
 * @param script 调用的语句
 */
export const runScript = (script: ISentence) => {
  let perform: IPerform = initPerform;
  const functionToRun: ScriptFunction = scriptRegistry[script.command]?.scriptFunction ?? SCRIPT_TAG_MAP.say.scriptFunction; // 默认是say

  // 调用脚本对应的函数
  perform = functionToRun(script);

  if (perform.arrangePerformPromise) {
    perform.arrangePerformPromise.then((resolovedPerform) => {
      WebGAL.gameplay.performController.arrangeNewPerform(resolovedPerform, script);
    });
  } else {
    WebGAL.gameplay.performController.arrangeNewPerform(perform, script);
  }
};
