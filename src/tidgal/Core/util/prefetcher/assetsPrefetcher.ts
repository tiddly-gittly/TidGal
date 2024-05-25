import { IAsset } from 'src/tidgal/Core/controller/scene/sceneInterface';
import { logger } from '../logger';

import { WebGAL } from 'src/tidgal/Core/WebGAL';

/**
 * 预加载函数
 * @param assetList 场景资源列表
 */
export const assetsPrefetcher = (assetList: IAsset[]) => {
  for (const asset of assetList) {
    // 判断是否已经存在
    const hasPrefetch = WebGAL.sceneManager.settledAssets.includes(asset.url);
    if (hasPrefetch) {
      logger.log('该资源已在预加载列表中，无需重复加载');
    } else {
      const newLink = document.createElement('link');
      newLink.setAttribute('rel', 'prefetch');
      newLink.setAttribute('href', asset.url);
      const head = document.querySelectorAll('head');
      if (head.length > 0) {
        head[0].append(newLink);
      }
      WebGAL.sceneManager.settledAssets.push(asset.url);
    }
  }
};
