import { nextSentence } from 'src/tidgal/Core/controller/gamePlay/nextSentence';
import { strIf } from 'src/tidgal/Core/controller/gamePlay/strIf';
import { commandType, ISentence } from 'src/tidgal/Core/controller/scene/sceneInterface';
import { getValueFromState } from 'src/tidgal/Core/gameScripts/setVar';
import { ISceneEntry } from 'src/tidgal/Core/Modules/scene';
import { WebGAL } from 'src/tidgal/Core/WebGAL';
import { webgalStore } from 'src/tidgal/Corestore/store';
import { restoreScene } from '../scene/restoreScene';
import { runScript } from './runScript';

export const whenChecker = (whenValue: string | undefined): boolean => {
  if (whenValue === undefined) {
    return true;
  }
  // 先把变量解析出来
  const valueExpArray = whenValue.split(/([!()*+/<>\-]|>=|<=|==|&&|\|\||!=)/g);
  const valueExp = valueExpArray
    .map((e) => {
      if (/[A-Za-z]/.test(e)) {
        if (e.includes('true') || e.includes('false')) {
          return e;
        }
        return getValueFromState(e).toString();
      } else return e;
    })
    .reduce((pre, current) => pre + current, '');
  return !!strIf(valueExp);
};

/**
 * 语句执行器
 * 执行语句，同步场景状态，并根据情况立即执行下一句或者加入backlog
 */
export const scriptExecutor = () => {
  // 超过总语句数量，则从场景栈拿出一个需要继续的场景，然后继续流程。若场景栈清空，则停止流程
  if (
    WebGAL.sceneManager.sceneData.currentSentenceId >
      WebGAL.sceneManager.sceneData.currentScene.sentenceList.length - 1
  ) {
    if (WebGAL.sceneManager.sceneData.sceneStack.length > 0) {
      const sceneToRestore: ISceneEntry | undefined = WebGAL.sceneManager.sceneData.sceneStack.pop();
      if (sceneToRestore !== undefined) {
        restoreScene(sceneToRestore);
      }
    }
    return;
  }
  const currentScript: ISentence = WebGAL.sceneManager.sceneData.currentScene.sentenceList[WebGAL.sceneManager.sceneData.currentSentenceId];

  const interpolationOneItem = (content: string): string => {
    let returnValueContent = content;
    const contentExp = returnValueContent.match(/(?<!\\){(.*?)}/g);

    if (contentExp !== null) {
      contentExp.forEach((e) => {
        const contentVariableValue = getValueFromState(e.replace(/(?<!\\){(.*)}/, '$1'));
        returnValueContent = returnValueContent.replace(e, contentVariableValue ? contentVariableValue.toString() : e);
      });
    }
    returnValueContent = returnValueContent.replaceAll('\\{', '{').replaceAll('\\}', '}');
    return returnValueContent;
  };

  /**
   * Variable interpolation
   */
  const variableInterpolation = () => {
    currentScript.content = interpolationOneItem(currentScript.content);

    currentScript.args.forEach((argument) => {
      if (argument.value && typeof argument.value === 'string') {
        argument.value = interpolationOneItem(argument.value);
      }
    });
  };

  variableInterpolation();

  // 判断这个脚本要不要执行
  let runThis = true;
  let isHasWhenArgument = false;
  let whenValue = '';
  currentScript.args.forEach((e) => {
    if (e.key === 'when') {
      isHasWhenArgument = true;
      whenValue = e.value.toString();
    }
  });
  // 如果语句有 when
  if (isHasWhenArgument) {
    runThis = whenChecker(whenValue);
  }

  // 执行语句
  if (!runThis) {
    logger.log('不满足条件，跳过本句！');
    WebGAL.sceneManager.sceneData.currentSentenceId++;
    nextSentence();
    return;
  }
  runScript(currentScript);
  let isNext = false; // 是否要进行下一句
  currentScript.args.forEach((e) => {
    // 判断是否有下一句的参数
    if (e.key === 'next' && e.value) {
      isNext = true;
    }
  });

  let isSaveBacklog = currentScript.command === commandType.say; // 是否在本句保存backlog（一般遇到对话保存）
  // 检查当前对话是否有 notend 参数
  currentScript.args.forEach((e) => {
    if (e.key === 'notend' && e.value === true) {
      isSaveBacklog = false;
    }
  });
  let currentStageState: IStageState;

  // 执行至指定 sentenceID
  // if (runToSentence >= 0 && runtime_currentSceneData.currentSentenceId < runToSentence) {
  //   runtime_currentSceneData.currentSentenceId++;
  //   scriptExecutor(runToSentence);
  //   return;
  // }

  // 执行“下一句”
  if (isNext) {
    WebGAL.sceneManager.sceneData.currentSentenceId++;
    scriptExecutor();
    return;
  }

  /**
   * 为了让 backlog 拿到连续执行了多条语句后正确的数据，放到下一个宏任务中执行（我也不知道为什么这样能正常，有能力的可以研究一下
   */
  setTimeout(() => {
    // 同步当前舞台数据
    currentStageState = webgalStore.getState().stage;
    const allState = {
      currentStageState,
      globalGameVar: webgalStore.getState().userData.globalGameVar,
    };
    logger.debug('本条语句执行结果', allState);
    // 保存 backlog
    if (isSaveBacklog) {
      // WebGAL.backlogManager.isSaveBacklogNext = true;
      WebGAL.backlogManager.saveCurrentStateToBacklog();
    }
  }, 0);
  WebGAL.sceneManager.sceneData.currentSentenceId++;
};
