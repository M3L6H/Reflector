import { APP_NAME } from './constants.js';

const getKey = key => `${ APP_NAME }/${ key }`;

const getAppKeys = () => {
  const appDict = JSON.parse(localStorage.getItem(getKey("__appkeys__"))) || {};
  return Object.keys(appDict);
};

const addToAppKeys = key => {
  const appDict = JSON.parse(localStorage.getItem(getKey("__appkeys__"))) || {};
  appDict[key] = true;
  localStorage.setItem(getKey("__appkeys__"), JSON.stringify(appDict));
};

export const getItem = key => localStorage.getItem(getKey(key));

export const setItem = (key, value) => {
  addToAppKeys(key);
  return localStorage.setItem(getKey(key), value);
};

export const clear = () => {
  getAppKeys().forEach(key => localStorage.removeItem(key));
};
