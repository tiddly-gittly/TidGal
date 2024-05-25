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

// Helper function to get save data
const getSaveData = () => {
  const saveDataTiddler = '$:/temp/tidgal/default/SaveData';
  return $tw.wiki.getTiddlerData(saveDataTiddler, initState as ISavesData & Record<string, any>);
};

// Helper function to set save data
const setSaveData = (newState: ISavesData) => {
  const saveDataTiddler = '$:/temp/tidgal/default/SaveData';
  $tw.wiki.addTiddler({ title: saveDataTiddler, text: JSON.stringify(newState) });
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
