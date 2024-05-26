import { setEbg } from 'src/tidgal/Core/gameScripts/changeBg/setEbg';
import { WebgalParser } from 'src/tidgal/Core/parser/sceneParser';
import { WebGAL } from 'src/tidgal/Core/WebGAL';
import { getGuiState, setGuiAsset, setLogoImage } from 'src/tidgal/store/GUIReducer';
import { assetSetter, fileType, getAssetBase } from '../gameAssetsAccess/assetSetter';
import { logger } from '../logger';

declare global {
  interface Window {
    renderPromise?: CallableFunction;
  }
}
/**
 * 获取游戏信息
 * @param url 游戏信息路径
 */
export const infoFetcher = (url: string) => {
  const GUIState = getGuiState();
  const assetBase = getAssetBase();
  const gameConfigTiddlerTitle = `${assetBase}${url}`;
  const gameConfigRaw = $tw.wiki.getTiddlerText(gameConfigTiddlerTitle);
  if (!gameConfigRaw) {
    logger.alert('未能获取到游戏信息', gameConfigTiddlerTitle);
    return;
  }
  const gameConfig = WebgalParser.parseConfig(gameConfigRaw);
  logger.log('获取到游戏信息', gameConfig);
  // 按照游戏的配置开始设置对应的状态
  if (GUIState) {
    gameConfig.forEach((e) => {
      const { command, args } = e;

      switch (command) {
        case 'Title_img': {
          const titleUrl = assetSetter(args.join(''), fileType.background);
          setGuiAsset({ asset: 'titleBg', value: titleUrl });
          setEbg(titleUrl);
          break;
        }

        case 'Game_Logo': {
          const logoUrlList = args.map((url) => assetSetter(url, fileType.background));
          setLogoImage(logoUrlList);
          break;
        }

        case 'Title_bgm': {
          const bgmUrl = assetSetter(args[0], fileType.bgm);
          setGuiAsset({ asset: 'titleBgm', value: bgmUrl });
          break;
        }

        case 'Game_name': {
          WebGAL.gameName = args[0];
          // document.title = args[0];
          break;
        }

        case 'Game_key': {
          WebGAL.gameKey = args[0];
          break;
        }
      }
    });
  }
  window?.renderPromise?.();
  delete window.renderPromise;
};
