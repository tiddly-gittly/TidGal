import { stopAuto } from 'src/tidgal/Core/controller/gamePlay/autoPlay';
import { stopFast } from 'src/tidgal/Core/controller/gamePlay/fastSkip';
import { stopAllPerform } from 'src/tidgal/Core/controller/gamePlay/stopAllPerform';
import { setEbg } from 'src/tidgal/Core/gameScripts/changeBg/setEbg';
import { setVisibility } from 'src/tidgal/Corestore/GUIReducer';
import { setStage } from 'src/tidgal/Corestore/stageReducer';
import { webgalStore } from 'src/tidgal/Corestore/store';

export const backToTitle = () => {
  const dispatch = webgalStore.dispatch;
  stopAllPerform();
  stopAuto();
  stopFast();
  // 清除语音
  dispatch(setStage({ key: 'playVocal', value: '' }));
  // 重新打开标题界面
  dispatch(setVisibility({ component: 'showTitle', visibility: true }));
  /**
   * 重设为标题背景
   */
  setEbg(webgalStore.getState().GUI.titleBg);
};
