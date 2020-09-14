import { APP_NAME } from './constants';

const getKey = key => `${ APP_NAME }/${ key }`;

const getAppKeys = () => {
  const appKeys = localStorage.getItem(getKey(";"));
  return appKeys.split(";");
};

const addToAppKeys = key => {
  if (key.includes(";")) {
    throw "Key names cannot include a semi-colon!";
  }

  const appDict = {};
  getAppKeys().forEach(key => appDict[key] = true);
  appDict[getKey(key)] = true;

  localStorage.setItem(getKey(";"), Object.keys(appDict).join(";"));
};

export const getItem = key => localStorage.getItem(getKey(key));

export const setItem = (key, value) => {
  addToAppKeys(key);
  return localStorage.setItem(getKey(key), value);
};

export const clear = () => {
  getAppKeys().forEach(key => localStorage.removeItem(key));
};
