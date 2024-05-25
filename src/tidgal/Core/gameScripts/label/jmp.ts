import { nextSentence } from 'src/tidgal/Core/controller/gamePlay/nextSentence';
import { commandType } from 'src/tidgal/Core/controller/scene/sceneInterface';

import { WebGAL } from 'src/tidgal/Core/WebGAL';

export const jmp = (labelName: string) => {
  // 在当前场景中找到指定的标签。
  const currentLine = WebGAL.sceneManager.sceneData.currentSentenceId;
  let result = currentLine;
  WebGAL.sceneManager.sceneData.currentScene.sentenceList.forEach((sentence, index) => {
    if (sentence.command === commandType.label && sentence.content === labelName && index !== currentLine) {
      result = index;
    }
  });
  WebGAL.sceneManager.sceneData.currentSentenceId = result;
  setTimeout(nextSentence, 1);
};
