import { ISentence } from 'src/tidgal/Core/controller/scene/sceneInterface';
import { IAnimationObject } from 'src/tidgal/Core/controller/stage/pixi/PixiController';
import { getAnimateDuration, getAnimationObject } from 'src/tidgal/Core/Modules/animationFunctions';
import { IPerform } from 'src/tidgal/Core/Modules/perform/performInterface';
import { WebGAL } from 'src/tidgal/Core/WebGAL';
import { webgalStore } from 'src/tidgal/store/store';
import { IUserAnimation } from '../Modules/animations';

/**
 * 设置临时动画
 * @param sentence
 */
export const setTempAnimation = (sentence: ISentence): IPerform => {
  const startDialogKey = getStage().currentDialogKey;
  const animationName = (Math.random() * 10).toString(16);
  const animationString = sentence.content;
  let animationObject;
  try {
    animationObject = JSON.parse(animationString);
  } catch {
    animationObject = [];
  }
  const newAnimation: IUserAnimation = { name: animationName, effects: animationObject };
  WebGAL.animationManager.addAnimation(newAnimation);
  const animationDuration = getAnimateDuration(animationName);
  const target = getSentenceArgByKey(sentence, 'target')?.toString() ?? '0';
  const key = `${target}-${animationName}-${animationDuration}`;
  let stopFunction = () => {};
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
      const endDialogKey = getStage().currentDialogKey;
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
