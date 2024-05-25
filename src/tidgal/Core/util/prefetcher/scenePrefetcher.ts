/**
 * 场景预加载
 * @param sceneList 需要预加载的场景文件列表
 */
import { logger } from 'src/tidgal/Core/util/logger';
import { sceneFetcher } from '../../controller/scene/sceneFetcher';
import { sceneParser } from '../../parser/sceneParser';

import { WebGAL } from 'src/tidgal/Core/WebGAL';

export const scenePrefetcher = (sceneList: string[]): void => {
  for (const e of sceneList) {
    if (WebGAL.sceneManager.settledScenes.includes(e)) {
      logger.log(`场景${e}已经加载过，无需再次加载`);
    } else {
      logger.log(`现在预加载场景${e}`);
      sceneFetcher(e).then((r) => {
        sceneParser(r, e, e);
      });
    }
  }
};
