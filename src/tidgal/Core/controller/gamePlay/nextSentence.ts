import cloneDeep from 'lodash/cloneDeep';
import { WebGAL } from 'src/tidgal/Core/WebGAL';
import { getGuiState } from 'src/tidgal/store/GUIReducer';
import { IRunPerform } from 'src/tidgal/store/stageInterface';
import { getStage, stageActions } from 'src/tidgal/store/stageReducer';
import { logger } from '../../util/logger';
import { scriptExecutor } from './scriptExecutor';

/**
 * 进行下一句
 */
export const nextSentence = () => {
  /**
   * 发送 “发生点击下一句” 事件。
   */
  WebGAL.events.userInteractNext.emit();

  // 如果当前显示标题，那么不进行下一句
  const GUIState = getGuiState();
  if (GUIState.showTitle) {
    return;
  }

  // 第一步，检查是否存在 blockNext 的演出
  let isBlockingNext = false;
  WebGAL.gameplay.performController.performList.forEach((e) => {
    if (e.blockingNext()) {
      // 阻塞且没有结束的演出
      isBlockingNext = true;
    }
  });
  if (isBlockingNext) {
    // 有阻塞，提前结束
    logger.log('next 被阻塞！');
    return;
  }

  // 检查是否处于演出完成状态，不是则结束所有普通演出（保持演出不算做普通演出）
  let allSettled = true;
  WebGAL.gameplay.performController.performList.forEach((e) => {
    if (!e.isHoldOn && !e.skipNextCollect) allSettled = false;
  });
  if (allSettled) {
    // 所有普通演出已经结束
    // if (WebGAL.backlogManager.isSaveBacklogNext) {
    //   WebGAL.backlogManager.isSaveBacklogNext = false;
    // }
    // 清除状态表的演出序列（因为这时候已经准备进行下一句了）
    const stageState = getStage();
    const newStageState = cloneDeep(stageState);
    for (let index = 0; index < newStageState.PerformList.length; index++) {
      const e: IRunPerform = newStageState.PerformList[index];
      if (!e.isHoldOn) {
        newStageState.PerformList.splice(index, 1);
        index--;
      }
    }
    stageActions.resetStageState(newStageState);
    scriptExecutor();
    return;
  }

  // 不处于 allSettled 状态，清除所有普通演出，强制进入settled。
  logger.log('提前结束被触发，现在清除普通演出');
  let isGoNext = false;
  for (let index = 0; index < WebGAL.gameplay.performController.performList.length; index++) {
    const e = WebGAL.gameplay.performController.performList[index];
    if (!e.isHoldOn) {
      if (e.goNextWhenOver) {
        isGoNext = true;
      }
      if (!e.skipNextCollect) {
        e.stopFunction();
        clearTimeout(e.stopTimeout as unknown as number);
        WebGAL.gameplay.performController.performList.splice(index, 1);
        index--;
      }
    }
  }
  if (isGoNext) {
    nextSentence();
  }
};
