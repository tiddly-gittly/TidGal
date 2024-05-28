import { IStageObject } from 'src/tidgal/Core/controller/stage/pixi/PixiController';
import { setEbg } from 'src/tidgal/Core/gameScripts/changeBg/setEbg';
import { getEnterExitAnimation } from 'src/tidgal/Core/Modules/animationFunctions';
import { logger } from 'src/tidgal/Core/util/logger';
import { WebGAL } from 'src/tidgal/Core/WebGAL';
import { IStageState } from 'src/tidgal/store/stageInterface';

export function onBgChange(stageState: IStageState, prevStageState: IStageState) {
  const bgName = stageState.bgName;
  // trigger logic when bgName changed, same as `useEffect` of react
  if (bgName === prevStageState.bgName) return;

  /**
   * 设置背景
   */
  const thisBgKey = 'bg-main';
  if (bgName === '') {
    const currentBg = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisBgKey);
    if (currentBg) {
      removeBg(currentBg);
    }
  } else {
    const currentBg = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisBgKey);
    if (currentBg && currentBg.sourceUrl !== bgName) {
      removeBg(currentBg);
    }
    WebGAL.gameplay.pixiStage?.addBg(thisBgKey, bgName);
    setEbg(bgName);
    logger.log('重设背景');
    const { duration, animation } = getEnterExitAnimation('bg-main', 'enter', true);
    WebGAL.gameplay.pixiStage!.registerPresetAnimation(animation, 'bg-main-softin', thisBgKey, stageState.effects);
    setTimeout(() => WebGAL.gameplay.pixiStage?.removeAnimationWithSetEffects?.('bg-main-softin'), duration);
  }
}

function removeBg(bgObject: IStageObject) {
  setEbg('');
  WebGAL.gameplay.pixiStage?.removeAnimationWithSetEffects('bg-main-softin');
  const oldBgKey = bgObject.key;
  bgObject.key = 'bg-main-off';
  WebGAL.gameplay.pixiStage?.removeStageObjectByKey(oldBgKey);
  const { duration, animation } = getEnterExitAnimation('bg-main-off', 'exit', true);
  WebGAL.gameplay.pixiStage!.registerAnimation(animation, 'bg-main-softoff', 'bg-main-off');
  setTimeout(() => {
    WebGAL.gameplay.pixiStage?.removeAnimation('bg-main-softoff');
    WebGAL.gameplay.pixiStage?.removeStageObjectByKey('bg-main-off');
  }, duration);
}
