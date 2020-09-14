import { APP_NAME } from './constants';

const getKey = key => `${ APP_NAME }/${ key }`;

export const getItem = key => localStorage.getItem(getKey(key));
export const setItem = (key, value) => localStorage.setItem(getKey(key), value);
