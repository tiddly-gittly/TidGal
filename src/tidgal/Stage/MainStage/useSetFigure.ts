import { IStageObject } from 'src/tidgal/Core/controller/stage/pixi/PixiController';
import { getEnterExitAnimation } from 'src/tidgal/Core/Modules/animationFunctions';
import { logger } from 'src/tidgal/Core/util/logger';
import { WebGAL } from 'src/tidgal/Core/WebGAL';
import { IEffect, IStageState } from 'src/tidgal/store/stageInterface';

export function onFigureChange(stageState: IStageState, prevStageState: IStageState) {
  const { figNameLeft, figName, figNameRight, freeFigure, live2dMotion, live2dExpression } = stageState;

  /**
   * 同步 motion
   */
  if (live2dMotion !== prevStageState.live2dMotion) {
    for (const motion of live2dMotion) {
      WebGAL.gameplay.pixiStage?.changeModelMotionByKey(motion.target, motion.motion);
    }
  }

  /**
   * 同步 expression
   */
  if (live2dExpression !== prevStageState.live2dExpression) {
    for (const expression of live2dExpression) {
      WebGAL.gameplay.pixiStage?.changeModelExpressionByKey(expression.target, expression.expression);
    }
  }

  /**
   * 设置立绘
   */
  if (figName !== prevStageState.figName) {
    /**
     * 特殊处理：中间立绘
     */
    const thisFigKey = 'fig-center';
    const softInAniKey = 'fig-center-softin';
    if (figName === '') {
      logger.log('移除中立绘');
      const currentFigCenter = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisFigKey);
      if (currentFigCenter && currentFigCenter.sourceUrl !== figName) {
        removeFig(currentFigCenter, softInAniKey, stageState.effects);
      }
    } else {
      const currentFigCenter = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisFigKey);
      if (currentFigCenter && currentFigCenter.sourceUrl !== figName) {
        removeFig(currentFigCenter, softInAniKey, stageState.effects);
      }
      addFigure(undefined, thisFigKey, figName, 'center');
      logger.log('中立绘已重设');
      const { duration, animation } = getEnterExitAnimation(thisFigKey, 'enter');
      WebGAL.gameplay.pixiStage!.registerPresetAnimation(animation, softInAniKey, thisFigKey, stageState.effects);
      setTimeout(() => {
        WebGAL.gameplay.pixiStage!.removeAnimationWithSetEffects(softInAniKey);
      }, duration);
    }
  }

  if (figNameLeft !== prevStageState.figNameLeft) {
    /**
     * 特殊处理：左侧立绘
     */
    const thisFigKey = 'fig-left';
    const softInAniKey = 'fig-left-softin';
    if (figNameLeft === '') {
      logger.log('移除左立绘');
      const currentFigLeft = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisFigKey);
      if (currentFigLeft && currentFigLeft.sourceUrl !== figNameLeft) {
        removeFig(currentFigLeft, softInAniKey, stageState.effects);
      }
    } else {
      const currentFigLeft = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisFigKey);
      if (currentFigLeft && currentFigLeft.sourceUrl !== figNameLeft) {
        removeFig(currentFigLeft, softInAniKey, stageState.effects);
      }
      addFigure(undefined, thisFigKey, figNameLeft, 'left');
      logger.log('左立绘已重设');
      const { duration, animation } = getEnterExitAnimation(thisFigKey, 'enter');
      WebGAL.gameplay.pixiStage!.registerPresetAnimation(animation, softInAniKey, thisFigKey, stageState.effects);
      setTimeout(() => {
        WebGAL.gameplay.pixiStage!.removeAnimationWithSetEffects(softInAniKey);
      }, duration);
    }
  }

  if (figNameRight !== prevStageState.figNameRight) {
    /**
     * 特殊处理：右侧立绘
     */
    const thisFigKey = 'fig-right';
    const softInAniKey = 'fig-right-softin';
    if (figNameRight === '') {
      const currentFigRight = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisFigKey);
      if (currentFigRight && currentFigRight.sourceUrl !== figNameRight) {
        removeFig(currentFigRight, softInAniKey, stageState.effects);
      }
    } else {
      const currentFigRight = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisFigKey);
      if (currentFigRight && currentFigRight.sourceUrl !== figNameRight) {
        removeFig(currentFigRight, softInAniKey, stageState.effects);
      }
      addFigure(undefined, thisFigKey, figNameRight, 'right');
      logger.log('右立绘已重设');
      const { duration, animation } = getEnterExitAnimation(thisFigKey, 'enter');
      WebGAL.gameplay.pixiStage!.registerPresetAnimation(animation, softInAniKey, thisFigKey, stageState.effects);
      setTimeout(() => {
        WebGAL.gameplay.pixiStage!.removeAnimationWithSetEffects(softInAniKey);
      }, duration);
    }
  }

  if (freeFigure !== prevStageState.freeFigure) {
    // 自由立绘
    for (const fig of freeFigure) {
      /**
       * 特殊处理：自由立绘
       */
      const thisFigKey = `${fig.key}`;
      const softInAniKey = `${fig.key}-softin`;
      /**
       * 非空
       */
      if (fig.name === '') {
        const currentFigThisKey = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisFigKey);
        if (currentFigThisKey && currentFigThisKey.sourceUrl !== fig.name) {
          removeFig(currentFigThisKey, softInAniKey, stageState.effects);
        }
      } else {
        const currentFigThisKey = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisFigKey);
        if (currentFigThisKey) {
          if (currentFigThisKey.sourceUrl !== fig.name) {
            removeFig(currentFigThisKey, softInAniKey, stageState.effects);
            addFigure(undefined, thisFigKey, fig.name, fig.basePosition);
            logger.log(`${fig.key}立绘已重设`);
            const { duration, animation } = getEnterExitAnimation(thisFigKey, 'enter');
            WebGAL.gameplay.pixiStage!.registerPresetAnimation(animation, softInAniKey, thisFigKey, stageState.effects);
            setTimeout(() => {
              WebGAL.gameplay.pixiStage!.removeAnimationWithSetEffects(softInAniKey);
            }, duration);
          }
        } else {
          addFigure(undefined, thisFigKey, fig.name, fig.basePosition);
          logger.log(`${fig.key}立绘已重设`);
          const { duration, animation } = getEnterExitAnimation(thisFigKey, 'enter');
          WebGAL.gameplay.pixiStage!.registerPresetAnimation(animation, softInAniKey, thisFigKey, stageState.effects);
          setTimeout(() => {
            WebGAL.gameplay.pixiStage!.removeAnimationWithSetEffects(softInAniKey);
          }, duration);
        }
      }
    }

    /**
     * 移除不在状态表中的立绘
     */
    const currentFigures = WebGAL.gameplay.pixiStage?.getFigureObjects();
    if (currentFigures) {
      for (const existFigure of currentFigures) {
        if (
          existFigure.key === 'fig-left' ||
          existFigure.key === 'fig-center' ||
          existFigure.key === 'fig-right' ||
          existFigure.key.endsWith('-off')
        ) {
          // 什么也不做
        } else {
          const existKey = existFigure.key;
          const existFigInState = freeFigure.findIndex((fig) => fig.key === existKey);
          if (existFigInState < 0) {
            const softInAniKey = `${existFigure.key}-softin`;
            removeFig(existFigure, softInAniKey, stageState.effects);
          }
        }
      }
    }
  }
}

function removeFig(figObj: IStageObject, enterTikerKey: string, effects: IEffect[]) {
  WebGAL.gameplay.pixiStage?.removeAnimationWithSetEffects(enterTikerKey);
  // 快进，跳过退出动画
  if (WebGAL.gameplay.isFast) {
    logger.log('快速模式，立刻关闭立绘');
    WebGAL.gameplay.pixiStage?.removeStageObjectByKey(figObj.key);
    return;
  }
  const oldFigKey = figObj.key;
  figObj.key = figObj.key + '-off';
  WebGAL.gameplay.pixiStage?.removeStageObjectByKey(oldFigKey);
  const figKey = figObj.key;
  const leaveKey = figKey + '-softoff';
  const { duration, animation } = getEnterExitAnimation(figKey, 'exit');
  WebGAL.gameplay.pixiStage!.registerPresetAnimation(animation, leaveKey, figKey, effects);
  setTimeout(() => {
    WebGAL.gameplay.pixiStage?.removeAnimation(leaveKey);
    WebGAL.gameplay.pixiStage?.removeStageObjectByKey(figKey);
  }, duration);
}

function addFigure(type?: 'image' | 'live2D' | 'spine', ...args: string[]) {
  const url = args[1];
  if (url?.endsWith?.('.json')) {
    addLive2dFigure(...args);
  } else if (url.endsWith('.skel')) {
    // @ts-expect-error
    return WebGAL.gameplay.pixiStage?.addSpineFigure(...args);
  } else {
    // @ts-expect-error
    return WebGAL.gameplay.pixiStage?.addFigure(...args);
  }
}

/**
 * 如果要使用 Live2D，取消这里的注释
 * @param args
 */
function addLive2dFigure(...args: any[]) {
  // TODO: 支持 live2d，看看增加多少大小
  // @ts-expect-error
  // return WebGAL.gameplay.pixiStage?.addLive2dFigure(...args);
}
