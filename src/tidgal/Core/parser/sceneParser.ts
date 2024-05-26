import { applyStyle } from 'src/tidgal/Core/gameScripts/applyStyle';
import { bgm } from 'src/tidgal/Core/gameScripts/bgm';
import { callSceneScript } from 'src/tidgal/Core/gameScripts/callSceneScript';
import { changeBg } from 'src/tidgal/Core/gameScripts/changeBg';
import { changeFigure } from 'src/tidgal/Core/gameScripts/changeFigure';
import { changeSceneScript } from 'src/tidgal/Core/gameScripts/changeSceneScript';
import { choose } from 'src/tidgal/Core/gameScripts/choose';
import { comment } from 'src/tidgal/Core/gameScripts/comment';
import { filmMode } from 'src/tidgal/Core/gameScripts/filmMode';
import { getUserInput } from 'src/tidgal/Core/gameScripts/getUserInput';
import { intro } from 'src/tidgal/Core/gameScripts/intro';
import { label } from 'src/tidgal/Core/gameScripts/label';
import { miniAvatar } from 'src/tidgal/Core/gameScripts/miniAvatar';
import { pixi } from 'src/tidgal/Core/gameScripts/pixi';
import { playEffect } from 'src/tidgal/Core/gameScripts/playEffect';
import { playVideo } from 'src/tidgal/Core/gameScripts/playVideo';
import { setAnimation } from 'src/tidgal/Core/gameScripts/setAnimation';
import { setComplexAnimation } from 'src/tidgal/Core/gameScripts/setComplexAnimation';
import { setFilter } from 'src/tidgal/Core/gameScripts/setFilter';
import { setTempAnimation } from 'src/tidgal/Core/gameScripts/setTempAnimation';
import { setTextbox } from 'src/tidgal/Core/gameScripts/setTextbox';
import { setTransform } from 'src/tidgal/Core/gameScripts/setTransform';
import { setTransition } from 'src/tidgal/Core/gameScripts/setTransition';
import { unlockBgm } from 'src/tidgal/Core/gameScripts/unlockBgm';
import { unlockCg } from 'src/tidgal/Core/gameScripts/unlockCg';
import { assetSetter } from 'src/tidgal/Core/util/gameAssetsAccess/assetSetter';
import { assetsPrefetcher } from 'src/tidgal/Core/util/prefetcher/assetsPrefetcher';
import SceneParser from 'webgal-parser';
import { commandType, IScene } from '../controller/scene/sceneInterface';
import { end } from '../gameScripts/end';
import { jumpLabel } from '../gameScripts/jumpLabel';
import { pixiInit } from '../gameScripts/pixi/pixiInit';
import { say } from '../gameScripts/say';
import { setVar } from '../gameScripts/setVar';
import { showVars } from '../gameScripts/showVars';
import { logger } from '../util/logger';
import { defineScripts, IConfigInterface, ScriptConfig } from './utils';

export const SCRIPT_TAG_MAP = defineScripts({
  intro: ScriptConfig(commandType.intro, intro),
  changeBg: ScriptConfig(commandType.changeBg, changeBg),
  changeFigure: ScriptConfig(commandType.changeFigure, changeFigure),
  miniAvatar: ScriptConfig(commandType.miniAvatar, miniAvatar, { next: true }),
  changeScene: ScriptConfig(commandType.changeScene, changeSceneScript),
  choose: ScriptConfig(commandType.choose, choose),
  end: ScriptConfig(commandType.end, end),
  bgm: ScriptConfig(commandType.bgm, bgm, { next: true }),
  playVideo: ScriptConfig(commandType.video, playVideo),
  setComplexAnimation: ScriptConfig(commandType.setComplexAnimation, setComplexAnimation),
  setFilter: ScriptConfig(commandType.setFilter, setFilter),
  pixiInit: ScriptConfig(commandType.pixiInit, pixiInit, { next: true }),
  pixiPerform: ScriptConfig(commandType.pixi, pixi, { next: true }),
  label: ScriptConfig(commandType.label, label, { next: true }),
  jumpLabel: ScriptConfig(commandType.jumpLabel, jumpLabel),
  setVar: ScriptConfig(commandType.setVar, setVar, { next: true }),
  showVars: ScriptConfig(commandType.showVars, showVars),
  unlockCg: ScriptConfig(commandType.unlockCg, unlockCg, { next: true }),
  unlockBgm: ScriptConfig(commandType.unlockBgm, unlockBgm, { next: true }),
  say: ScriptConfig(commandType.say, say),
  filmMode: ScriptConfig(commandType.filmMode, filmMode, { next: true }),
  callScene: ScriptConfig(commandType.callScene, callSceneScript),
  setTextbox: ScriptConfig(commandType.setTextbox, setTextbox),
  setAnimation: ScriptConfig(commandType.setAnimation, setAnimation),
  playEffect: ScriptConfig(commandType.playEffect, playEffect, { next: true }),
  setTempAnimation: ScriptConfig(commandType.setTempAnimation, setTempAnimation),
  __commment: ScriptConfig(commandType.comment, comment, { next: true }),
  setTransform: ScriptConfig(commandType.setTransform, setTransform),
  setTransition: ScriptConfig(commandType.setTransition, setTransition, { next: true }),
  getUserInput: ScriptConfig(commandType.getUserInput, getUserInput),
  applyStyle: ScriptConfig(commandType.applyStyle, applyStyle, { next: true }),
  // if: ScriptConfig(commandType.if, undefined, { next: true }),
});

export const SCRIPT_CONFIG: IConfigInterface[] = Object.values(SCRIPT_TAG_MAP);

export const ADD_NEXT_ARG_LIST = SCRIPT_CONFIG.filter((config) => config.next).map((config) => config.scriptType);

/**
 * 场景解析器
 * @param rawScene 原始场景
 * @param sceneName 场景名称
 * @param sceneUrl 场景url
 * @return {IScene} 解析后的场景
 */
export const WebgalParser = new SceneParser(assetsPrefetcher, assetSetter, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);

export const sceneParser = (rawScene: string, sceneName: string, sceneUrl: string): IScene => {
  const parsedScene = WebgalParser.parse(rawScene, sceneName, sceneUrl);
  logger.log(`解析场景：${sceneName}，数据为：`, parsedScene);
  return parsedScene;
};

export { type ScriptFunction, scriptRegistry } from './utils';
