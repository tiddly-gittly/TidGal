
import { getSentenceArgByKey } from 'src/tidgal/Core/util/getSentenceArg';
import { textFont } from 'src/tidgal/store/userDataInterface';
import { getUserData } from 'src/tidgal/store/userDataReducer';
import { getSEByWebgalStore } from 'src/tidgal/utils/getSoundEffect';
import { ISentence } from '../../controller/scene/sceneInterface';
import { IPerform } from '../../Modules/perform/performInterface';

/**
 * 显示选择枝
 * @param sentence
 */
export const getUserInput = (sentence: ISentence): IPerform => {
  const varKey = sentence.content.toString().trim();
  const titleFromArgs = getSentenceArgByKey(sentence, 'title');
  const title = (titleFromArgs === 0 ? 'Please Input' : titleFromArgs) ?? 'Please Input';
  const buttonTextFromArgs = getSentenceArgByKey(sentence, 'buttonText');
  const buttonText = (buttonTextFromArgs === 0 ? 'OK' : buttonTextFromArgs) ?? 'OK';
  const fontFamily = getUserData().optionData.textboxFont;
  const font = fontFamily === textFont.song ? '"思源宋体", serif' : '"WebgalUI", serif';
  const { playSeEnter, playSeClick } = getSEByWebgalStore();
  // FIXME: 改为设置状态，然后 HTML 在 tid 里写
  // const chooseElements = (
  //   <div style={{ fontFamily: font }} className={styles.glabalDialog_container}>
  //     <div className={styles.glabalDialog_container_inner}>
  //       <div className={styles.title}>{title}</div>
  //       <input id="user-input" className={styles.Choose_item} />
  //       <div
  //         onMouseEnter={playSeEnter}
  //         onClick={() => {
  //           const userInput: HTMLInputElement = document.getElementById('user-input') as HTMLInputElement;
  //           if (userInput) {
  //             stageActions.setStageVar({ key: varKey, value: (userInput?.value ?? '') === '' ? ' ' : userInput?.value ?? '' }),
  //           }
  //           playSeClick();
  //           WebGAL.gameplay.performController.unmountPerform('userInput');
  //           nextSentence();
  //         }}
  //         className={styles.button}
  //       >
  //         {buttonText}
  //       </div>
  //     </div>
  //   </div>
  // );
  // ReactDOM.render(
  //   <div className={styles.Choose_Main}>{chooseElements}</div>,
  //   document.getElementById('chooseContainer'),
  // );
  return {
    performName: 'userInput',
    duration: 1000 * 60 * 60 * 24,
    isHoldOn: false,
    stopFunction: () => {
      // ReactDOM.render(<div />, document.getElementById('chooseContainer'));
    },
    blockingNext: () => true,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
