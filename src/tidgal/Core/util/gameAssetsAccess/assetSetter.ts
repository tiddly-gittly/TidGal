/* eslint-disable @typescript-eslint/naming-convention */
/**
 * @file 资源的引入可能是绝对链接，也可能是文件名，必须做必要的处理。
 */

import { logger } from 'src/tidgal/Core/util/logger';
import type { IInitializeScriptOptions } from '../../initializeScript';

/**
 * 内置资源类型的枚举
 */
export enum fileType {
  background,
  bgm,
  figure,
  scene,
  tex,
  vocal,
  video,
}

export let assetBase = '';
export function setAssetOptions(options: IInitializeScriptOptions) {
  assetBase = options.assetBase;
}
export const getAssetBase = () => {
  return assetBase;
};

/**
 * 获取资源路径
 * @param fileName 资源的名称或地址
 * @param assetType 资源类型
 * @return {string} 处理后的资源路径（绝对或相对）
 */
export const assetSetter = (fileName: string, assetType: fileType): string => {
  // 是绝对链接，直接返回
  if (fileName.match('http://') ?? fileName.match('https://')) {
    return fileName;
  } else {
    // 根据类型拼接资源的相对路径
    let returnFilePath: string;
    switch (assetType) {
      case fileType.background: {
        returnFilePath = `${assetBase}background/${fileName}`;
        break;
      }
      case fileType.scene: {
        returnFilePath = `${assetBase}scene/${fileName}`;
        break;
      }
      case fileType.vocal: {
        returnFilePath = `${assetBase}vocal/${fileName}`;
        break;
      }
      case fileType.figure: {
        returnFilePath = `${assetBase}figure/${fileName}`;
        break;
      }
      case fileType.bgm: {
        returnFilePath = `${assetBase}bgm/${fileName}`;
        break;
      }
      case fileType.video: {
        returnFilePath = `${assetBase}video/${fileName}`;
        break;
      }
      default: {
        returnFilePath = ``;
        break;
      }
    }
    return returnFilePath;
  }
};

export function getBase64URL(urlOrTiddlerTitle: string): string {
  if (urlOrTiddlerTitle.startsWith('http')) {
    return urlOrTiddlerTitle;
  } else {
    const tiddler = $tw.wiki.getTiddler(urlOrTiddlerTitle);
    const _canonical_uri = tiddler?.fields?._canonical_uri as string | undefined;
    if (_canonical_uri) {
      logger.log(`Lazy-loading tiddler from ${_canonical_uri}`);
      return _canonical_uri;
    }
    const base64Data = tiddler?.fields?.text;
    if (base64Data) {
      const tiddlerType = tiddler?.fields?.type;
      logger.log(`Loading base64 string from ${urlOrTiddlerTitle} with type ${tiddlerType || '(fallback to image/png)'}`);
      return `data:${tiddlerType || 'image/png'};base64,${base64Data}`;
    }
    return '';
  }
}
