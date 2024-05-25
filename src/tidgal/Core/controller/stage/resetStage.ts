import cloneDeep from 'lodash/cloneDeep';
import { WebGAL } from 'src/tidgal/Core/WebGAL';
import { initState, resetStageState, setStage } from 'src/tidgal/Corestore/stageReducer';
import { webgalStore } from 'src/tidgal/Corestore/store';

export const resetStage = (resetBacklog: boolean, resetSceneAndVariable = true) => {
  /**
   * 清空运行时
   */
  if (resetBacklog) {
    WebGAL.backlogManager.makeBacklogEmpty();
  }
  // 清空sceneData，并重新获取
  if (resetSceneAndVariable) {
    WebGAL.sceneManager.resetScene();
  }

  // 清空所有演出和timeOut
  WebGAL.gameplay.performController.removeAllPerform();
  WebGAL.gameplay.resetGamePlay();

  // 清空舞台状态表
  const initSceneDataCopy = cloneDeep(initState);
  const currentVariables = webgalStore.getState().stage.GameVar;
  webgalStore.dispatch(resetStageState(initSceneDataCopy));
  if (!resetSceneAndVariable) {
    webgalStore.dispatch(setStage({ key: 'GameVar', value: currentVariables }));
  }
};
