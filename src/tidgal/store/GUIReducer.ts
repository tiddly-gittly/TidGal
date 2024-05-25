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

export const getGuiState = () => {
  const guiStateTiddler = '$:/temp/tidgal/default/GuiState';
  return $tw.wiki.getTiddlerData(guiStateTiddler, initState as IGuiState & Record<string, any>);
};

export const setGuiState = (newState: IGuiState) => {
  const guiStateTiddler = '$:/temp/tidgal/default/GuiState';
  $tw.wiki.addTiddler({ title: guiStateTiddler, text: JSON.stringify(newState) });
};

/**
 * 设置GUI的各组件的显示状态
 * @param action 改变显示状态的Action
 */
export const setVisibility = (action: setVisibilityPayload) => {
  // 获取当前的GUI状态
  const prevState = getGuiState();
  // 从Action中获取组件和显示状态
  const { component, visibility } = action;
  // 更新GUI状态中的组件显示状态
  prevState[component] = visibility;
  // 设置更新后的GUI状态
  setGuiState(prevState);
};

/**
 * 设置MenuPanel的当前选中项
 * @param action 改变当前选中项的Action
 */
export const setMenuPanelTag = (action: MenuPanelTag) => {
  // 获取当前的GUI状态
  const prevState = getGuiState();
  // 更新GUI状态中的当前选中项
  prevState.currentMenuTag = action;
  // 设置更新后的GUI状态
  setGuiState(prevState);
};

/**
 * 设置GUI资源的值
 * @param action 改变资源的Action
 */
export const setGuiAsset = (action: setAssetPayload) => {
  // 获取当前的GUI状态
  const prevState = getGuiState();
  // 从Action中获取资源和值
  const { asset, value } = action;
  // 更新GUI状态中的资源值
  prevState[asset] = value;
  // 设置更新后的GUI状态
  setGuiState(prevState);
};

/**
 * 设置Logo图片
 * @param action 新的Logo图片数组
 */
export const setLogoImage = (action: string[]) => {
  // 获取当前的GUI状态
  const prevState = getGuiState();
  // 更新GUI状态中的Logo图片
  prevState.logoImage = [...action];
  // 设置更新后的GUI状态
  setGuiState(prevState);
};
