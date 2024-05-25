import { syncFast } from 'src/tidgal/Core/util/syncWithEditor/syncWithOrigine';

export const bindExtraFunc = () => {
  (window as any).JMP = syncFast;
};
