import cloneDeep from 'lodash/cloneDeep';
import { generateTimelineObj } from 'src/tidgal/Core/controller/stage/pixi/animations/timeline';
import { generateUniversalSoftInAnimationObj } from 'src/tidgal/Core/controller/stage/pixi/animations/universalSoftIn';
import { generateUniversalSoftOffAnimationObj } from 'src/tidgal/Core/controller/stage/pixi/animations/universalSoftOff';
import { logger } from 'src/tidgal/Core/util/logger';
import { WebGAL } from 'src/tidgal/Core/WebGAL';
import { baseTransform } from 'src/tidgal/store/stageInterface';
import { getStage } from 'src/tidgal/store/stageReducer';

export function getAnimationObject(animationName: string, target: string, duration: number) {
  const effect = WebGAL.animationManager.getAnimations().find((ani) => ani.name === animationName);
  if (effect) {
    const mappedEffects = effect.effects.map((effect) => {
      const targetSetEffect = getStage().effects.find((e) => e.target === target);
      const newEffect = cloneDeep({ ...(targetSetEffect?.transform ?? baseTransform), duration: 0 });
      Object.assign(newEffect, effect);
      newEffect.duration = effect.duration;
      return newEffect;
    });
    logger.log('装载自定义动画', JSON.stringify(mappedEffects));
    return generateTimelineObj(mappedEffects, target, duration);
  }
  return null;
}

export function getAnimateDuration(animationName: string) {
  const effect = WebGAL.animationManager.getAnimations().find((ani) => ani.name === animationName);
  if (effect) {
    let duration = 0;
    effect.effects.forEach((e) => {
      duration += e.duration;
    });
    return duration;
  }
  return 0;
}

export function getEnterExitAnimation(
  target: string,
  type: 'enter' | 'exit',
  isBg = false,
): {
  animation: {
    setEndState: () => void;
    setStartState: () => void;
    tickerFunc: (delta: number) => void;
  } | null;
  duration: number;
} {
  if (type === 'enter') {
    let duration = 500;
    if (isBg) {
      duration = 1500;
    }
    // 走默认动画
    let animation: {
      setEndState: () => void;
      setStartState: () => void;
      tickerFunc: (delta: number) => void;
    } | null = generateUniversalSoftInAnimationObj(target, duration);
    const animarionName = WebGAL.animationManager.nextEnterAnimationName.get(target);
    if (animarionName) {
      logger.log('取代默认进入动画', target);
      animation = getAnimationObject(animarionName, target, getAnimateDuration(animarionName));
      duration = getAnimateDuration(animarionName);
      // 用后重置
      WebGAL.animationManager.nextEnterAnimationName.delete(target);
    }
    return { duration, animation };
  } else {
    let duration = 750;
    if (isBg) {
      duration = 1500;
    }
    // 走默认动画
    let animation: {
      setEndState: () => void;
      setStartState: () => void;
      tickerFunc: (delta: number) => void;
    } | null = generateUniversalSoftOffAnimationObj(target, duration);
    const animarionName = WebGAL.animationManager.nextExitAnimationName.get(target);
    if (animarionName) {
      logger.log('取代默认退出动画', target);
      animation = getAnimationObject(animarionName, target, getAnimateDuration(animarionName));
      duration = getAnimateDuration(animarionName);
      // 用后重置
      WebGAL.animationManager.nextExitAnimationName.delete(target);
    }
    return { duration, animation };
  }
}
