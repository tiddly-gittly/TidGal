import cloneDeep from 'lodash/cloneDeep';
import uniqWith from 'lodash/uniqWith';
import { runScript } from 'src/tidgal/Core/controller/gamePlay/runScript';
import { stopAllPerform } from 'src/tidgal/Core/controller/gamePlay/stopAllPerform';
import { scenePrefetcher } from 'src/tidgal/Core/util/prefetcher/scenePrefetcher';
import { setVisibility } from 'src/tidgal/store/GUIReducer';
import { IStageState } from 'src/tidgal/store/stageInterface';
import { getStage, stageActions } from 'src/tidgal/store/stageReducer';
import { sceneParser } from '../../parser/sceneParser';
import { logger } from '../../util/logger';
import { sceneFetcher } from '../scene/sceneFetcher';

import { WebGAL } from 'src/tidgal/Core/WebGAL';

/**
 * 恢复演出
 */
export const restorePerform = () => {
  const stageState = getStage();
  stageState.PerformList.forEach((e) => {
    runScript(e.script);
  });
};

/**
 * 从 backlog 跳转至一个先前的状态
 * @param index
 */
export const jumpFromBacklog = (index: number) => {
  // 获得存档文件
  const backlogFile = WebGAL.backlogManager.getBacklog()[index];
  logger.log('读取的backlog数据', backlogFile);
  // 重新获取并同步场景状态
  sceneFetcher(backlogFile.saveScene.sceneUrl).then((rawScene) => {
    WebGAL.sceneManager.sceneData.currentScene = sceneParser(
      rawScene,
      backlogFile.saveScene.sceneName,
      backlogFile.saveScene.sceneUrl,
    );
    // 开始场景的预加载
    const subSceneList = WebGAL.sceneManager.sceneData.currentScene.subSceneList;
    WebGAL.sceneManager.settledScenes.push(WebGAL.sceneManager.sceneData.currentScene.sceneUrl); // 放入已加载场景列表，避免递归加载相同场景
    const subSceneListUniq = uniqWith(subSceneList); // 去重
    scenePrefetcher(subSceneListUniq);
  });
  WebGAL.sceneManager.sceneData.currentSentenceId = backlogFile.saveScene.currentSentenceId;
  WebGAL.sceneManager.sceneData.sceneStack = cloneDeep(backlogFile.saveScene.sceneStack);

  // 强制停止所有演出
  stopAllPerform();

  // 弹出backlog项目到指定状态
  for (let index_ = WebGAL.backlogManager.getBacklog().length - 1; index_ > index; index_--) {
    WebGAL.backlogManager.getBacklog().pop();
  }

  // 要记录本句 Backlog
  WebGAL.backlogManager.isSaveBacklogNext = true;

  // 恢复舞台状态
  const newStageState: IStageState = cloneDeep(backlogFile.currentStageState);

  stageActions.resetStageState(newStageState);

  // 恢复演出
  setTimeout(restorePerform, 0);

  // 关闭backlog界面
  setVisibility({ component: 'showBacklog', visibility: false });

  // 重新显示 TextBox
  setVisibility({ component: 'showTextBox', visibility: true });
};
