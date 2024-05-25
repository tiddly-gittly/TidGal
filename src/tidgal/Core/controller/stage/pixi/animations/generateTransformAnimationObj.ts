import { ITransform } from 'src/tidgal/store/stageInterface';
import { webgalStore } from 'src/tidgal/store/store';

type AnimationFrame = ITransform & { duration: number };
type AnimationObject = AnimationFrame[];

export function generateTransformAnimationObj(
  target: string,
  applyFrame: AnimationFrame,
  duration: number | string | boolean | null,
): AnimationObject {
  let animationObject;
  // 获取那个 target 的当前变换
  const transformState = webgalStore.getState().stage.effects;
  const targetEffect = transformState.find((effect) => effect.target === target);
  applyFrame.duration = 500;
  if (duration && typeof duration === 'number') {
    applyFrame.duration = duration;
  }
  animationObject = [applyFrame];
  // 找到 effect
  if (targetEffect) {
    const effectWithDuration = { ...targetEffect!.transform!, duration: 0 };
    animationObject.unshift(effectWithDuration);
  } else {
    // 应用默认effect，也就是最终的 effect 的 alpha = 0 版本
    const effectWithDuration = { ...applyFrame, alpha: 0, duration: 0 };
    animationObject.unshift(effectWithDuration);
  }
  return animationObject;
}
