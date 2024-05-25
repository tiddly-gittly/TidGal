import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import cloneDeep from 'lodash/cloneDeep';
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

const saveDataSlice = createSlice({
  name: 'saveData',
  initialState: cloneDeep(initState),
  reducers: {
    setFastSave: (state, action: PayloadAction<ISaveData | null>) => {
      state.quickSaveData = action.payload;
    },
    resetFastSave: (state) => {
      state.quickSaveData = null;
    },
    resetSaves: (state) => {
      state.quickSaveData = null;
      state.saveData = [];
    },
    saveGame: (state, action: PayloadAction<SaveAction>) => {
      state.saveData[action.payload.index] = action.payload.saveData;
    },
    replaceSaveGame: (state, action: PayloadAction<ISaveData[]>) => {
      state.saveData = action.payload;
    },
  },
});

export const saveActions = saveDataSlice.actions;

export default saveDataSlice.reducer;
