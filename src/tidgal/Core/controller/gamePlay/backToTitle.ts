import { stopAuto } from 'src/tidgal/Core/controller/gamePlay/autoPlay';
import { stopFast } from 'src/tidgal/Core/controller/gamePlay/fastSkip';
import { stopAllPerform } from 'src/tidgal/Core/controller/gamePlay/stopAllPerform';
import { setEbg } from 'src/tidgal/Core/gameScripts/changeBg/setEbg';
import { setVisibility } from 'src/tidgal/store/GUIReducer';
import { setStage } from 'src/tidgal/store/stageReducer';

export const backToTitle = () => {
  stopAllPerform();
  stopAuto();
  stopFast();
  // 清除语音
  setStage({ key: 'playVocal', value: '' });
  // 重新打开标题界面
  setVisibility({ component: 'showTitle', visibility: true });
  /**
   * 重设为标题背景
   */
  setEbg(webgalStore.getState().GUI.titleBg);
};
