/**
 * @file 资源的引入可能是绝对链接，也可能是文件名，必须做必要的处理。
 */

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

/**
 * 获取资源路径
 * @param fileName 资源的名称或地址
 * @param assetType 资源类型
 * @return {string} 处理后的资源路径（绝对或相对）
 */
export const assetSetter = (options: IInitializeScriptOptions, fileName: string, assetType: fileType): string => {
  // 是绝对链接，直接返回
  if (fileName.match('http://') ?? fileName.match('https://')) {
    return fileName;
  } else {
    // 根据类型拼接资源的相对路径
    let returnFilePath: string;
    switch (assetType) {
      case fileType.background: {
        returnFilePath = `${options.assetBase}/game/background/${fileName}`;
        break;
      }
      case fileType.scene: {
        returnFilePath = `${options.assetBase}/game/scene/${fileName}`;
        break;
      }
      case fileType.vocal: {
        returnFilePath = `${options.assetBase}/game/vocal/${fileName}`;
        break;
      }
      case fileType.figure: {
        returnFilePath = `${options.assetBase}/game/figure/${fileName}`;
        break;
      }
      case fileType.bgm: {
        returnFilePath = `${options.assetBase}/game/bgm/${fileName}`;
        break;
      }
      case fileType.video: {
        returnFilePath = `${options.assetBase}/game/video/${fileName}`;
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
