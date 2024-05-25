import { ISentence } from 'src/tidgal/Core/controller/scene/sceneInterface';
import { IPerform } from 'src/tidgal/Core/Modules/perform/performInterface';
import { logger } from 'src/tidgal/Core/util/logger';
import { call, IResult } from '../../util/pixiPerformManager/pixiPerformManager';

import { WebGAL } from 'src/tidgal/Core/WebGAL';

/**
 * 运行一段pixi演出
 * @param sentence
 */
export const pixi = (sentence: ISentence): IPerform => {
  const pixiPerformName = 'PixiPerform' + sentence.content;
  WebGAL.gameplay.performController.performList.forEach((e) => {
    if (e.performName === pixiPerformName) {
      return {
        performName: 'none',
        duration: 0,
        isOver: false,
        isHoldOn: true,
        stopFunction: () => {},
        blockingNext: () => false,
        blockingAuto: () => false,
        stopTimeout: undefined, // 暂时不用，后面会交给自动清除
      };
    }
  });
  const res: IResult = call(sentence.content);
  const { container, tickerKey } = res;

  return {
    performName: pixiPerformName,
    duration: 0,
    isHoldOn: true,
    stopFunction: () => {
      logger.log('现在正在卸载pixi演出');
      container.destroy({ texture: true, baseTexture: true });
      WebGAL.gameplay.pixiStage?.effectsContainer.removeChild(container);
      WebGAL.gameplay.pixiStage?.removeAnimation(tickerKey);
    },
    blockingNext: () => false,
    blockingAuto: () => false,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
