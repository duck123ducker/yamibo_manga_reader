export enum ENUM_READ_DIRECTION {
  COL = 0,
  ROW = 1
}

export enum ENUM_ROW_DIRECTION {
  R_TO_L = 0,
  L_TO_R = 1
}

export enum ENUM_SETTING_DIRECTION {
  R_TO_L = '从右至左',
  L_TO_R = '从左至右',
  T_TO_B = '从上至下'
}

export interface Option {
  description: string;
  info?: string;
  operation?: () => void;
  switch?: boolean;
}

export type Options = Option[]
