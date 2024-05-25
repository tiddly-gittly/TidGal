import { ISentence } from 'src/tidgal/Core/controller/scene/sceneInterface';
import { IPerform } from 'src/tidgal/Core/Modules/perform/performInterface';
import { logger } from 'src/tidgal/Core/util/logger';
import { stageActions } from 'src/tidgal/Corestore/stageReducer';

import { WebGAL } from 'src/tidgal/Core/WebGAL';

/**
 * 初始化pixi
 * @param sentence
 */
export const pixiInit = (sentence: ISentence): IPerform => {
  WebGAL.gameplay.performController.performList.forEach((e) => {
    if (e.performName.includes('PixiPerform')) {
      logger.log('pixi 被脚本重新初始化', e.performName);
      /**
       * 卸载演出
       */
      for (let index = 0; index < WebGAL.gameplay.performController.performList.length; index++) {
        const e2 = WebGAL.gameplay.performController.performList[index];
        if (e2.performName === e.performName) {
          e2.stopFunction();
          clearTimeout(e2.stopTimeout as unknown as number);
          WebGAL.gameplay.performController.performList.splice(index, 1);
          index--;
        }
      }
      /**
       * 从状态表里清除演出
       */
      webgalStore.dispatch(stageActions.removeAllPixiPerforms());
    }
  });
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
