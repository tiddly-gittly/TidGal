
/**
 * 原始场景文件获取函数
 * @param sceneUrl 场景文件路径
 */
export async function sceneFetcher(sceneUrl: string): Promise<string> {
  if (sceneUrl.match('http://') ?? sceneUrl.match('https://')) {
    return await fetch(sceneUrl).then(async (res) => await res.text());
  }
  const content = $tw.wiki.getTiddlerText(sceneUrl);
  if (content === undefined) {
    throw new Error(`未找到场景文件: ${sceneUrl}`);
  }
  return content;
}
