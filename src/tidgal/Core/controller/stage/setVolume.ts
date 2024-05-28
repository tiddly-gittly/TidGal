import { getUserData } from 'src/tidgal/store/userDataReducer';
import { getContainer } from '../../util/coreInitialFunction/container';
import { logger } from '../../util/logger';

/**
 * 设置音量
 */
export const setVolume = () => {
  const userDataState = getUserData();
  const mainVol = userDataState.optionData.volumeMain;
  const vocalVol = mainVol * 0.01 * userDataState.optionData.vocalVolume * 0.01;
  const bgmVol = mainVol * 0.01 * userDataState.optionData.bgmVolume * 0.01;
  logger.log(`设置背景音量：${bgmVol},语音音量：${vocalVol}`);
  const bgmElement = getContainer()?.querySelector<HTMLAudioElement>('#currentBgm');
  if (bgmElement) {
    bgmElement.volume = bgmVol;
  }
  const vocalElement = getContainer()?.querySelector<HTMLAudioElement>('#currentVocal');
  if (vocalElement) {
    vocalElement.volume = vocalVol;
  }
};
