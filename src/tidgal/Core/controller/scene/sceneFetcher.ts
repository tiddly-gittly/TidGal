import { assetSetter, fileType } from 'src/tidgal/Core/util/gameAssetsAccess/assetSetter';

/**
 * 原始场景文件获取函数
 * @param sceneUrl 场景文件路径
 */
export async function sceneFetcher(sceneUrl: string): Promise<string> {
  const assetPath = assetSetter(sceneUrl, fileType.scene);
  if (assetPath.match('http://') ?? assetPath.match('https://')) {
    return await fetch(assetPath).then(async (res) => await res.text());
  }
  const content = $tw.wiki.getTiddlerText(assetPath);
  if (content === undefined) {
    throw new Error(`未找到场景文件: ${sceneUrl}`);
  }
  return content;
}
