import { ISentence } from 'src/tidgal/Core/controller/scene/sceneInterface';
import { getRandomPerformName } from 'src/tidgal/Core/Modules/perform/performController';
import { IPerform } from 'src/tidgal/Core/Modules/perform/performInterface';
import { logger } from 'src/tidgal/Core/util/logger';
import { WebGAL } from 'src/tidgal/Core/WebGAL';
import { getStage, setStage } from 'src/tidgal/store/stageReducer';
import { getUserData } from 'src/tidgal/store/userDataReducer';

/**
 * 进行普通对话的显示
 * @param sentence 语句
 * @return {IPerform} 执行的演出
 */
export const showVars = (sentence: ISentence): IPerform => {
  const stageState = getStage();
  const userDataState = getUserData();
  // 设置文本显示
  const allVariable = {
    stageGameVar: stageState.GameVar,
    globalGameVar: userDataState.globalGameVar,
  };
  setStage({ key: 'showText', value: JSON.stringify(allVariable) });
  setStage({ key: 'showName', value: '展示变量' });
  logger.log('展示变量：', allVariable);
  setTimeout(() => {
    WebGAL.events.textSettle.emit();
  }, 0);
  const performInitName: string = getRandomPerformName();
  const endDelay = 750 - userDataState.optionData.textSpeed * 250;
  return {
    performName: performInitName,
    duration: endDelay,
    isHoldOn: false,
    stopFunction: () => {
      WebGAL.events.textSettle.emit();
    },
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
