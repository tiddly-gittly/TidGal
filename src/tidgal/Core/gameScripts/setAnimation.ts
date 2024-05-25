import { ISentence } from 'src/tidgal/Core/controller/scene/sceneInterface';
import { IAnimationObject } from 'src/tidgal/Core/controller/stage/pixi/PixiController';
import { IPerform } from 'src/tidgal/Core/Modules/perform/performInterface';
import { getSentenceArgByKey } from 'src/tidgal/Core/util/getSentenceArg';
import { logger } from 'src/tidgal/Core/util/logger';
import { webgalStore } from 'src/tidgal/Corestore/store';

import { getAnimateDuration, getAnimationObject } from 'src/tidgal/Core/Modules/animationFunctions';
import { WebGAL } from 'src/tidgal/Core/WebGAL';

/**
 * 设置背景动画
 * @param sentence
 */
export const setAnimation = (sentence: ISentence): IPerform => {
  const startDialogKey = webgalStore.getState().stage.currentDialogKey;
  const animationName = sentence.content;
  const animationDuration = getAnimateDuration(animationName);
  const target = (getSentenceArgByKey(sentence, 'target')?.toString() ?? 'default_id').toString();
  const key = `${target}-${animationName}-${animationDuration}`;
  let stopFunction;
  setTimeout(() => {
    WebGAL.gameplay.pixiStage?.stopPresetAnimationOnTarget(target);
    const animationObject: IAnimationObject | null = getAnimationObject(animationName, target, animationDuration);
    if (animationObject) {
      logger.debug(`动画${animationName}作用在${target}`, animationDuration);
      WebGAL.gameplay.pixiStage?.registerAnimation(animationObject, key, target);
    }
  }, 0);
  stopFunction = () => {
    setTimeout(() => {
      const endDialogKey = webgalStore.getState().stage.currentDialogKey;
      const isHasNext = startDialogKey !== endDialogKey;
      WebGAL.gameplay.pixiStage?.removeAnimationWithSetEffects(key);
    }, 0);
  };

  return {
    performName: key,
    duration: animationDuration,
    isHoldOn: false,
    stopFunction,
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
