import { sceneFetcher } from 'src/tidgal/Core/controller/scene/sceneFetcher';
import { ISentence } from 'src/tidgal/Core/controller/scene/sceneInterface';
import { playBgm } from 'src/tidgal/Core/controller/stage/playBgm';
import { resetStage } from 'src/tidgal/Core/controller/stage/resetStage';
import { IPerform } from 'src/tidgal/Core/Modules/perform/performInterface';
import { sceneParser } from 'src/tidgal/Core/parser/sceneParser';
import { assetSetter, fileType } from 'src/tidgal/Core/util/gameAssetsAccess/assetSetter';
import { WebGAL } from 'src/tidgal/Core/WebGAL';
import { getGuiState, setVisibility } from 'src/tidgal/store/GUIReducer';
import { saveActions } from 'src/tidgal/store/savesReducer';

/**
 * 结束游戏
 * @param sentence
 */
export const end = (sentence: ISentence): IPerform => {
  resetStage(true);
  // 重新获取初始场景
  const sceneUrl: string = assetSetter('start.txt', fileType.scene);
  // 为了在 scriptExecutor 自增 sentenceId 后再重置场景
  setTimeout(() => {
    WebGAL.sceneManager.resetScene();
  }, 5);
  saveActions.resetFastSave();
  sceneFetcher(sceneUrl).then((rawScene) => {
    // 场景写入到运行时
    WebGAL.sceneManager.sceneData.currentScene = sceneParser(rawScene, 'start.txt', sceneUrl);
  });
  setVisibility({ component: 'showTitle', visibility: true });
  playBgm(getGuiState().titleBgm);
  return {
    performName: 'none',
    duration: 0,
    isHoldOn: false,
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
