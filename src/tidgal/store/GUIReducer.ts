/**
 * @file 记录当前GUI的状态信息，引擎初始化时会重置。
 * @author Mahiru
 */
import { IGuiState, MenuPanelTag, setAssetPayload, setVisibilityPayload } from 'src/tidgal/store/guiInterface';

/**
 * 初始GUI状态表
 */
const initState: IGuiState = {
  showBacklog: false,
  showStarter: true,
  showTitle: true,
  showMenuPanel: false,
  showTextBox: true,
  showControls: true,
  controlsVisibility: true,
  currentMenuTag: MenuPanelTag.Option,
  titleBg: '',
  titleBgm: '',
  logoImage: [],
  showExtra: false,
  showGlobalDialog: false,
  showPanicOverlay: false,
  isEnterGame: false,
  isShowLogo: true,
};

const getGuiState = () => {
  const guiStateTiddler = '$:/temp/tidgal/default/GuiState';
  return $tw.wiki.getTiddlerData(guiStateTiddler, initState as IGuiState & Record<string, any>);
};

// Helper function to set GUI state
const setGuiState = (newState: IGuiState) => {
  const guiStateTiddler = '$:/temp/tidgal/default/GuiState';
  $tw.wiki.addTiddler({ title: guiStateTiddler, text: JSON.stringify(newState) });
};

export const guiActions = {
  /**
   * 设置GUI的各组件的显示状态
   * @param action 改变显示状态的Action
   */
  setVisibility: (action: setVisibilityPayload) => {
    const prevState = getGuiState();
    const { component, visibility } = action;
    prevState[component] = visibility;
    setGuiState(prevState);
  },
  /**
   * 设置MenuPanel的当前选中项
   * @param action 改变当前选中项的Action
   */
  setMenuPanelTag: (action: MenuPanelTag) => {
    const prevState = getGuiState();
    prevState.currentMenuTag = action;
    setGuiState(prevState);
  },
  /**
   * 设置GUI资源的值
   * @param action 改变资源的Action
   */
  setGuiAsset: (action: setAssetPayload) => {
    const prevState = getGuiState();
    const { asset, value } = action;
    prevState[asset] = value;
    setGuiState(prevState);
  },
  setLogoImage: (action: string[]) => {
    const prevState = getGuiState();
    prevState.logoImage = [...action];
    setGuiState(prevState);
  },
};
