import { ISentence } from 'src/tidgal/Core/controller/scene/sceneInterface';
import { jmp } from 'src/tidgal/Core/gameScripts/label/jmp';
import { IPerform } from 'src/tidgal/Core/Modules/perform/performInterface';

/**
 * 跳转到指定标签
 * @param sentence
 */
export const jumpLabel = (sentence: ISentence): IPerform => {
  jmp(sentence.content);
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
