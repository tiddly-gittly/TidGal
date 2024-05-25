import { ISentence } from 'src/tidgal/Core/controller/scene/sceneInterface';
import { IPerform } from 'src/tidgal/Core/Modules/perform/performInterface';
import { changeScene } from '../controller/scene/changeScene';

/**
 * 切换场景。在场景结束后不会回到父场景。
 * @param sentence
 */
export const changeSceneScript = (sentence: ISentence): IPerform => {
  const sceneNameArray: string[] = sentence.content.split('/');
  const sceneName = sceneNameArray.at(-1);
  changeScene(sentence.content, sceneName);
  return {
    performName: 'none',
    duration: 0,
    isHoldOn: true,
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
