import { ISentence } from 'src/tidgal/Core/controller/scene/sceneInterface';

export function getSentenceArgByKey(sentnece: ISentence, argk: string): null | string | boolean | number {
  const arguments_ = sentnece.args;
  const result = arguments_.find((argument) => argument.key === argk);
  if (result) {
    return result.value;
  } else return null;
}
