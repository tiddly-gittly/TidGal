import { nextSentence } from 'src/tidgal/Core/controller/gamePlay/nextSentence';
import { resetStage } from 'src/tidgal/Core/controller/stage/resetStage';
import { restorePerform } from 'src/tidgal/Core/controller/storage/jumpFromBacklog';
import { setEbg } from 'src/tidgal/Core/gameScripts/changeBg/setEbg';
import { setVisibility } from 'src/tidgal/store/GUIReducer';
import { sceneParser } from '../../parser/sceneParser';
import { assetSetter, fileType } from '../../util/gameAssetsAccess/assetSetter';
import { sceneFetcher } from '../scene/sceneFetcher';

import { WebGAL } from 'src/tidgal/Core/WebGAL';
import { getStage } from 'src/tidgal/store/stageReducer';

/**
 * 从头开始游戏
 */
export const startGame = async () => {
  resetStage(true);

  // 重新获取初始场景
  const sceneUrl: string = assetSetter('start.txt', fileType.scene);
  // 场景写入到运行时
  const rawScene = await sceneFetcher(sceneUrl);
  WebGAL.sceneManager.sceneData.currentScene = sceneParser(rawScene, 'start.txt', sceneUrl);
  // 开始第一条语句
  nextSentence();
  setVisibility({ component: 'showTitle', visibility: false });
};

export function continueGame() {
  /**
   * 重设模糊背景
   */
  setEbg(getStage().bgName);
  // 当且仅当游戏未开始时使用快速存档
  // 当游戏开始后 使用原来的逻辑
  // if ((await hasFastSaveRecord()) && WebGAL.sceneManager.sceneData.currentSentenceId === 0) {
  //   // 恢复记录
  //   await loadFastSaveGame();
  //   return;
  // }
  if (
    WebGAL.sceneManager.sceneData.currentSentenceId === 0 &&
    WebGAL.sceneManager.sceneData.currentScene.sceneName === 'start.txt'
  ) {
    // 如果游戏没有开始，开始游戏
    nextSentence();
  } else {
    restorePerform();
  }
}
