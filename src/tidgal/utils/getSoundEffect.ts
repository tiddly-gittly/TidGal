import { setStage } from 'src/tidgal/store/stageReducer';

import click_se from 'src/tidgal/assets/se/click.mp3';
import dialog_se from 'src/tidgal/assets/se/dialog.mp3';
import mouse_enter from 'src/tidgal/assets/se/mouse-enter.mp3';
import page_flip_1 from 'src/tidgal/assets/se/page-flip-1.mp3';
import switch_1 from 'src/tidgal/assets/se/switch-1.mp3';

/**
 * 调用音效
 */
export const getSoundEffect = () => {
  const playSeEnter = () => {
    setStage({ key: 'uiSe', value: mouse_enter });
  };
  const playSeClick = () => {
    setStage({ key: 'uiSe', value: click_se });
  };
  const playSeSwitch = () => {
    setStage({ key: 'uiSe', value: switch_1 });
  };
  const playSePageChange = () => {
    setStage({ key: 'uiSe', value: page_flip_1 });
  };

  const playSeDialogOpen = () => {
    setStage({ key: 'uiSe', value: dialog_se });
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
    setStage({ key: 'uiSe', value: mouse_enter });
  };
  const playSeClick = () => {
    setStage({ key: 'uiSe', value: click_se });
  };
  return {
    playSeEnter, // 鼠标进入
    playSeClick, // 鼠标点击
  };
};
