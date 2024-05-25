/* eslint-disable unicorn/prefer-number-properties */
import { compile } from 'angular-expressions';
import { ISentence } from 'src/tidgal/Core/controller/scene/sceneInterface';
import { IPerform } from 'src/tidgal/Core/Modules/perform/performInterface';
import { logger } from 'src/tidgal/Core/util/logger';
import { getStage, stageActions } from 'src/tidgal/store/stageReducer';

import { getUserData, setGlobalVar } from 'src/tidgal/store/userDataReducer';

/**
 * 设置变量
 * @param sentence
 */
export const setVar = (sentence: ISentence): IPerform => {
  let setGlobal = false;
  sentence.args.forEach((e) => {
    if (e.key === 'global') {
      setGlobal = true;
    }
  });
  let targetReducerFunction: CallableFunction;
  if (setGlobal) {
    targetReducerFunction = setGlobalVar;
  } else {
    targetReducerFunction = stageActions.setStageVar;
  }
  // 先把表达式拆分为变量名和赋值语句
  if (sentence.content.includes('=')) {
    const key = sentence.content.split(/=/)[0];
    const valueExp = sentence.content.split(/=/)[1];
    if (valueExp === 'random()') {
      targetReducerFunction({ key, value: Math.random() });
    } else if (/[()*+/-]/.test(valueExp)) {
      // 如果包含加减乘除号，则运算
      // 先取出运算表达式中的变量
      const valueExpArray = valueExp.split(/([()*+/-])/g);
      // 将变量替换为变量的值，然后合成表达式字符串
      const valueExp2 = valueExpArray
        .map((e) => {
          if (/[A-Za-z]/.test(e)) {
            return getValueFromState(e).toString();
          } else return e;
        })
        .reduce((pre, current) => pre + current, '');
      const exp = compile(valueExp2);
      const result = exp();
      targetReducerFunction({ key, value: result });
    } else if (/true|false/.test(valueExp)) {
      if (valueExp.includes('true')) {
        targetReducerFunction({ key, value: true });
      }
      if (valueExp.includes('false')) {
        targetReducerFunction({ key, value: false });
      }
    } else {
      if (isNaN(Number(valueExp))) targetReducerFunction({ key, value: valueExp });
      else {
        targetReducerFunction({ key, value: Number(valueExp) });
      }
    }
    if (setGlobal) {
      logger.log('设置全局变量完毕，结果：', { key, value: getUserData().globalGameVar[key] });
    } else {
      logger.log('设置变量完毕，结果：', { key, value: getStage().GameVar[key] });
    }
  }
  return {
    performName: 'none',
    duration: 0,
    isHoldOn: false,
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};

export function getValueFromState(key: string) {
  let returnValue: number | string | boolean = 0;
  if (key in getStage().GameVar) {
    returnValue = getStage().GameVar[key];
  } else if (key in getUserData().globalGameVar) {
    returnValue = getUserData().globalGameVar[key];
  }
  return returnValue;
}
