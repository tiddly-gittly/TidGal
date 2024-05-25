import { ActionCreatorWithPayload } from '@reduxjs/toolkit';
import { compile } from 'angular-expressions';
import { ISentence } from 'src/tidgal/Core/controller/scene/sceneInterface';
import { dumpToStorageFast } from 'src/tidgal/Core/controller/storage/storageController';
import { IPerform } from 'src/tidgal/Core/Modules/perform/performInterface';
import { logger } from 'src/tidgal/Core/util/logger';
import { ISetGameVar } from 'src/tidgal/Corestore/stageInterface';
import { setStageVar } from 'src/tidgal/Corestore/stageReducer';
import { webgalStore } from 'src/tidgal/Corestore/store';
import { setGlobalVar } from 'src/tidgal/Corestore/userDataReducer';

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
  let targetReducerFunction: ActionCreatorWithPayload<ISetGameVar, string>;
  if (setGlobal) {
    targetReducerFunction = setGlobalVar;
  } else {
    targetReducerFunction = setStageVar;
  }
  // 先把表达式拆分为变量名和赋值语句
  if (sentence.content.includes('=')) {
    const key = sentence.content.split(/=/)[0];
    const valueExp = sentence.content.split(/=/)[1];
    if (valueExp === 'random()') {
      webgalStore.dispatch(targetReducerFunction({ key, value: Math.random() }));
    } else if (/[()*+/\-]/.test(valueExp)) {
      // 如果包含加减乘除号，则运算
      // 先取出运算表达式中的变量
      const valueExpArray = valueExp.split(/([()*+/\-])/g);
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
      webgalStore.dispatch(targetReducerFunction({ key, value: result }));
    } else if (/true|false/.test(valueExp)) {
      if (valueExp.includes('true')) {
        webgalStore.dispatch(targetReducerFunction({ key, value: true }));
      }
      if (valueExp.includes('false')) {
        webgalStore.dispatch(targetReducerFunction({ key, value: false }));
      }
    } else {
      if (isNaN(Number(valueExp))) webgalStore.dispatch(targetReducerFunction({ key, value: valueExp }));
      else {
        webgalStore.dispatch(targetReducerFunction({ key, value: Number(valueExp) }));
      }
    }
    if (setGlobal) {
      logger.debug('设置全局变量：', { key, value: webgalStore.getState().userData.globalGameVar[key] });
      dumpToStorageFast();
    } else {
      logger.debug('设置变量：', { key, value: webgalStore.getState().stage.GameVar[key] });
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
  if (webgalStore.getState().stage.GameVar.hasOwnProperty(key)) {
    returnValue = webgalStore.getState().stage.GameVar[key];
  } else if (webgalStore.getState().userData.globalGameVar.hasOwnProperty(key)) {
    returnValue = webgalStore.getState().userData.globalGameVar[key];
  }
  return returnValue;
}
