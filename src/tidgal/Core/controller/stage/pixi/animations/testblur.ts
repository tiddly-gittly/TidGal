import { WebGAL } from 'src/tidgal/Core/WebGAL';

export function generateTestblurAnimationObj(targetKey: string, duration: number) {
  const target = WebGAL.gameplay.pixiStage!.getStageObjByKey(targetKey);

  // 先设置一个通用的初态

  // TODO：通用初态设置
  /**
   * 在此书写为动画设置初态的操作
   */
  function setStartState() {
    if (target) {
      target.pixiContainer.alpha = 0;
      // @ts-expect-error
      target.pixiContainer.blur = 0;
    }
  }

  // TODO：通用终态设置
  /**
   * 在此书写为动画设置终态的操作
   */
  function setEndState() {
    if (target) {
      target.pixiContainer.alpha = 1;
      // @ts-expect-error
      target.pixiContainer.blur = 5;
    }
  }

  /**
   * 在此书写动画每一帧执行的函数
   * @param delta
   */
  function tickerFunction(delta: number) {
    if (target) {
      const container = target.pixiContainer;
      const baseDuration = WebGAL.gameplay.pixiStage!.frameDuration;
      const currentAddOplityDelta = (duration / baseDuration) * delta;
      const increasement = 1 / currentAddOplityDelta;
      const decreasement = 5 / currentAddOplityDelta;
      if (container.alpha < 1) {
        container.alpha += increasement;
      }
      // @ts-expect-error
      if (container.blur < 5) {
        // @ts-expect-error
        container.blur += decreasement;
      }
    }
  }

  return {
    setStartState,
    setEndState,
    tickerFunc: tickerFunction,
  };
}
