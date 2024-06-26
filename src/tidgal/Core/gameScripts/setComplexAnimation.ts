import { ISentence } from 'src/tidgal/Core/controller/scene/sceneInterface';
import { webgalAnimations } from 'src/tidgal/Core/controller/stage/pixi/animations';
import { IAnimationObject } from 'src/tidgal/Core/controller/stage/pixi/PixiController';
import { IPerform } from 'src/tidgal/Core/Modules/perform/performInterface';
import { getSentenceArgByKey } from 'src/tidgal/Core/util/getSentenceArg';
import { logger } from 'src/tidgal/Core/util/logger';

import { WebGAL } from 'src/tidgal/Core/WebGAL';

/**
 * 设置背景动画
 * @param sentence
 */
export const setComplexAnimation = (sentence: ISentence): IPerform => {
  const startDialogKey = getStage().currentDialogKey;
  const animationName = sentence.content;
  const animationDuration = (getSentenceArgByKey(sentence, 'duration') ?? 0) as number;
  const target = getSentenceArgByKey(sentence, 'target')?.toString() ?? '0';
  const key = `${target}-${animationName}-${animationDuration}`;
  const animationFunction: Function | null = getAnimationObject(animationName);
  let stopFunction: () => void = () => {};
  if (animationFunction) {
    logger.log(`动画${animationName}作用在${target}`, animationDuration);
    const animationObject: IAnimationObject = animationFunction(target, animationDuration);
    WebGAL.gameplay.pixiStage?.stopPresetAnimationOnTarget(target);
    WebGAL.gameplay.pixiStage?.registerAnimation(animationObject, key, target);
    stopFunction = () => {
      const endDialogKey = getStage().currentDialogKey;
      const isHasNext = startDialogKey !== endDialogKey;
      WebGAL.gameplay.pixiStage?.removeAnimationWithSetEffects(key);
    };
  }
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

function getAnimationObject(animationName: string): Function | null {
  const result = webgalAnimations.find((e) => e.name === animationName);
  logger.log('装载动画', result);
  if (result) {
    return result.animationGenerateFunc;
  }
  return null;
}
