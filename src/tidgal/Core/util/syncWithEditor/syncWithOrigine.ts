import { nextSentence } from 'src/tidgal/Core/controller/gamePlay/nextSentence';
import { sceneFetcher } from 'src/tidgal/Core/controller/scene/sceneFetcher';
import { resetStage } from 'src/tidgal/Core/controller/stage/resetStage';
import { sceneParser } from 'src/tidgal/Core/parser/sceneParser';
import { assetSetter, fileType } from 'src/tidgal/Core/util/gameAssetsAccess/assetSetter';
import { setVisibility } from 'src/tidgal/Corestore/GUIReducer';
import { webgalStore } from 'src/tidgal/Corestore/store';
import { logger } from '../logger';

import { WebGAL } from 'src/tidgal/Core/WebGAL';

export const syncWithOrigine = (sceneName: string, sentenceId: number) => {
  logger.log('正在跳转到' + sceneName + ':' + sentenceId);
  const dispatch = webgalStore.dispatch;
  dispatch(setVisibility({ component: 'showTitle', visibility: false }));
  dispatch(setVisibility({ component: 'showMenuPanel', visibility: false }));
  dispatch(setVisibility({ component: 'isShowLogo', visibility: false }));
  const title = document.querySelector('#Title_enter_page');
  if (title) {
    title.style.display = 'none';
  }
  resetStage(true);
  // 重新获取初始场景
  const sceneUrl: string = assetSetter(sceneName, fileType.scene);
  // 场景写入到运行时
  sceneFetcher(sceneUrl).then((rawScene) => {
    WebGAL.sceneManager.sceneData.currentScene = sceneParser(rawScene, sceneName, sceneUrl);
    // 开始快进到指定语句
    const currentSceneName = WebGAL.sceneManager.sceneData.currentScene.sceneName;
    WebGAL.gameplay.isFast = true;
    syncFast(sentenceId, currentSceneName);
  });
};

export function syncFast(sentenceId: number, currentSceneName: string) {
  if (
    WebGAL.sceneManager.sceneData.currentSentenceId < sentenceId &&
    WebGAL.sceneManager.sceneData.currentScene.sceneName === currentSceneName
  ) {
    nextSentence();
    setTimeout(() => {
      syncFast(sentenceId, currentSceneName);
    }, 2);
  } else {
    WebGAL.gameplay.isFast = false;
  }
}
