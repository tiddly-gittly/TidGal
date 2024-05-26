import { setStage } from 'src/tidgal/store/stageReducer';

/**
 * 调用音效
 * 文件路径见 `src/tidgal/assets/tiddlywiki.files`
 */
export const getSoundEffect = () => {
  const playSeEnter = () => {
    setStage({ key: 'uiSe', value: '$:/plugins/linonetwo/tidgal/assets/se/mouse_enter' });
  };
  const playSeClick = () => {
    setStage({ key: 'uiSe', value: '$:/plugins/linonetwo/tidgal/assets/se/click_se' });
  };
  const playSeSwitch = () => {
    setStage({ key: 'uiSe', value: '$:/plugins/linonetwo/tidgal/assets/se/switch_1' });
  };
  const playSePageChange = () => {
    setStage({ key: 'uiSe', value: '$:/plugins/linonetwo/tidgal/assets/se/page_flip_1' });
  };

  const playSeDialogOpen = () => {
    setStage({ key: 'uiSe', value: '$:/plugins/linonetwo/tidgal/assets/se/dialog_se' });
  };

  return {
    playSeEnter,
    playSeClick,
    playSePageChange,
    playSeDialogOpen,
    playSeSwitch,
  };
};

/**
 * 调用音效（只供 choose.tsx 使用）
 */
export const getSEByWebgalStore = () => {
  const playSeEnter = () => {
    setStage({ key: 'uiSe', value: '$:/plugins/linonetwo/tidgal/assets/se/mouse_enter' });
  };
  const playSeClick = () => {
    setStage({ key: 'uiSe', value: '$:/plugins/linonetwo/tidgal/assets/se/click_se' });
  };
  return {
    playSeEnter, // 鼠标进入
    playSeClick, // 鼠标点击
  };
};
