/* eslint-disable unicorn/no-null */
import { ISaveData } from './userDataInterface';

export interface ISavesData {
  // 用户存档数据
  quickSaveData: ISaveData | null;
  saveData: ISaveData[];
}

const initState: ISavesData = {
  saveData: [],
  quickSaveData: null,
};

interface SaveAction {
  index: number;
  saveData: ISaveData;
}

let localState: ISavesData | undefined;
/** tw only update in next tick, so in this tick we set/get in local state, until next tick */
export const savesUpdated = () => {
  setTimeout(() => {
    localState = undefined;
  }, 0);
};
export const getSaveData = () => {
  const saveDataTiddler = '$:/temp/tidgal/default/SaveData';
  const prevState = localState ?? $tw.wiki.getTiddlerData(saveDataTiddler, initState as ISavesData & Record<string, any>);
  if (localState === undefined) localState = prevState;
  return prevState;
};

// Helper function to set save data
export const setSaveData = (newState: ISavesData) => {
  const saveDataTiddler = '$:/temp/tidgal/default/SaveData';
  localState = newState;
  $tw.wiki.addTiddler({ title: saveDataTiddler, text: JSON.stringify(localState) });
};

interface SaveAction {
  index: number;
  saveData: ISaveData;
}

export const saveActions = {
  setFastSave: (action: ISaveData | null) => {
    const prevState = getSaveData();
    prevState.quickSaveData = action;
    setSaveData(prevState);
  },
  resetFastSave: () => {
    const prevState = getSaveData();
    prevState.quickSaveData = null;
    setSaveData(prevState);
  },
  resetSaves: () => {
    const prevState = getSaveData();
    prevState.quickSaveData = null;
    prevState.saveData = [];
    setSaveData(prevState);
  },
  saveGame: (action: SaveAction) => {
    const prevState = getSaveData();
    prevState.saveData[action.index] = action.saveData;
    setSaveData(prevState);
  },
  replaceSaveGame: (action: ISaveData[]) => {
    const prevState = getSaveData();
    prevState.saveData = action;
    setSaveData(prevState);
  },
};
