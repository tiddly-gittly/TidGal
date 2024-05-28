import { nextSentence } from 'src/tidgal/Core/controller/gamePlay/nextSentence';
import { ISentence } from 'src/tidgal/Core/controller/scene/sceneInterface';
import { getRandomPerformName } from 'src/tidgal/Core/Modules/perform/performController';
import { IPerform } from 'src/tidgal/Core/Modules/perform/performInterface';
import { getSentenceArgByKey } from 'src/tidgal/Core/util/getSentenceArg';
import { WebGAL } from 'src/tidgal/Core/WebGAL';
import { getUserData } from 'src/tidgal/store/userDataReducer';
import { getContainer } from '../util/coreInitialFunction/container';
/**
 * 播放一段视频 * @param sentence
 */
export const playVideo = (sentence: ISentence): IPerform => {
  const userDataState = getUserData();
  const mainVol = userDataState.optionData.volumeMain;
  const vocalVol = mainVol * 0.01 * userDataState.optionData.vocalVolume * 0.01;
  const bgmVol = mainVol * 0.01 * userDataState.optionData.bgmVolume * 0.01;
  const performInitName: string = getRandomPerformName();

  const blockingNext = getSentenceArgByKey(sentence, 'skipOff');
  let blockingNextFlag = false;
  if (blockingNext) {
    blockingNextFlag = true;
  }

  // FIXME: 改为设置状态，然后 HTML 在 tid 里写
  // ReactDOM.render(
  //   <div className={styles.videoContainer}>
  //     <video className={styles.fullScreen_video} id='playVideoElement' src={sentence.content} autoPlay={true} />
  //   </div>,
  //   getContainer()?.querySelector?.('#videoContainer'),
  // );
  let isOver = false;
  return {
    performName: 'none',
    duration: 0,
    isHoldOn: false,
    stopFunction: () => {},
    blockingNext: () => blockingNextFlag,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
    arrangePerformPromise: new Promise<IPerform>((resolve) => {
      /**
       * 启动视频播放
       */
      setTimeout(() => {
        const VocalControl = getContainer()?.querySelector<HTMLVideoElement>('#playVideoElement');
        if (VocalControl) {
          VocalControl.currentTime = 0;
          VocalControl.volume = bgmVol;
          const endPerform = () => {
            for (const e of WebGAL.gameplay.performController.performList) {
              if (e.performName === performInitName) {
                isOver = true;
                e.stopFunction();
                WebGAL.gameplay.performController.unmountPerform(e.performName);
                nextSentence();
              }
            }
          };
          const skipVideo = () => {
            endPerform();
          };
          // 双击可跳过视频
          WebGAL.events.fullscreenDbClick.on(skipVideo);
          // 播放并作为一个特别演出加入
          const perform = {
            performName: performInitName,
            duration: 1000 * 60 * 60,
            isOver: false,
            isHoldOn: false,
            stopFunction: () => {
              WebGAL.events.fullscreenDbClick.off(skipVideo);
              /**
               * 恢复音量
               */
              const bgmElement = getContainer()?.querySelector<HTMLAudioElement>('#currentBgm');
              if (bgmElement) {
                bgmElement.volume = bgmVol;
              }
              const vocalElement = getContainer()?.querySelector<HTMLAudioElement>('#currentVocal');
              if (vocalElement) {
                vocalElement.volume = vocalVol;
              }
              // FIXME: 改为设置状态，然后 HTML 在 tid 里写
              // ReactDOM.render(<div />, getContainer()?.querySelector?.('#videoContainer'));
            },
            blockingNext: () => blockingNextFlag,
            blockingAuto: () => {
              return !isOver;
            },
            stopTimeout: undefined, // 暂时不用，后面会交给自动清除
            goNextWhenOver: true,
          };
          resolve(perform);
          /**
           * 把bgm和语音的音量设为0
           */
          const vocalVol2 = 0;
          const bgmVol2 = 0;
          const bgmElement = getContainer()?.querySelector<HTMLAudioElement>('#currentBgm');
          if (bgmElement) {
            bgmElement.volume = bgmVol2;
          }
          const vocalElement = getContainer()?.querySelector<HTMLAudioElement>('#currentVocal');
          if (vocalElement) {
            vocalElement.volume = vocalVol2;
          }

          VocalControl?.play();

          VocalControl.addEventListener('ended', () => {
            endPerform();
          });
        }
      }, 1);
    }),
  };
};
