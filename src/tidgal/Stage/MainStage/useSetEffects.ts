import { WebGAL } from 'src/tidgal/Core/WebGAL';
import { baseTransform, IEffect, IStageState, ITransform } from 'src/tidgal/store/stageInterface';

export function setStageObjectEffects(stageState: IStageState, prevStageState: IStageState) {
  // this is triggered on each state change, like logic without useEffect
  const effects = stageState.effects;
  setTimeout(() => {
    setStageEffects(effects);
  }, 10);
}

function setStageEffects(effects: IEffect[]) {
  const stageObjects = WebGAL.gameplay.pixiStage?.getAllStageObj() ?? [];
  for (const stageObj of stageObjects) {
    const key = stageObj.key;
    const effect = effects.find((effect) => effect.target === key);
    const lockedStageTargets = WebGAL.gameplay.pixiStage?.getAllLockedObject() ?? [];
    if (!lockedStageTargets.includes(key)) {
      if (effect) {
        // logger.debug('应用effects', key);
        const targetPixiContainer = WebGAL.gameplay.pixiStage?.getStageObjByKey(key);
        if (targetPixiContainer) {
          const container = targetPixiContainer.pixiContainer;
          Object.assign(container, convertTransform(effect.transform));
        }
      } else {
        const targetPixiContainer = WebGAL.gameplay.pixiStage?.getStageObjByKey(key);
        if (targetPixiContainer) {
          const container = targetPixiContainer.pixiContainer;
          Object.assign(container, convertTransform(baseTransform));
        }
      }
    }
  }
}

function convertTransform(transform: ITransform | undefined) {
  if (!transform) {
    return {};
  }
  const { position, alpha, ...rest } = transform;
  return { ...rest, x: position.x, y: position.y, alphaFilterVal: alpha };
}
