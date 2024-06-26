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
  // 在原版 WebGAL 中是 true，因为会先展示标题画面。在太微的微件里，因为是直接展示剧情，所以默认设为 false // TODO: 通过参数设置？
  showTitle: false,
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

let localState: IGuiState | undefined;
export const guiUpdated = () => {
  localState = undefined;
};
export const getGuiState = () => {
  const guiStateTiddler = '$:/temp/tidgal/default/GuiState';
  const prevState = localState ?? $tw.wiki.getTiddlerData(guiStateTiddler, initState as IGuiState & Record<string, any>);
  if (localState === undefined) localState = prevState;
  return prevState;
};

export const setGuiState = (newState: IGuiState) => {
  const guiStateTiddler = '$:/temp/tidgal/default/GuiState';
  localState = newState;
  $tw.wiki.addTiddler({ title: guiStateTiddler, text: JSON.stringify(localState), type: 'application/json' });
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
