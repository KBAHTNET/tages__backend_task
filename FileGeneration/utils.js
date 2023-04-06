//@ts-check
'use strict';

//Файл с переиспользуемыми вспомогательными функциями для генерации файла

export function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Генерация псевдослучайного числа в диапазоне от min до max
 * @param {{min:number, max:number}} object
 * @returns {number}
 */
export function getRandomInt(object) {
  const min = Math.ceil(object.min);
  const max = Math.floor(object.max);
  return Math.floor(Math.random() * (max - min) + min);
}

/**
 * Генерация псевдослучайной строки длинной length
 * @param {number} length 
 * @returns {string}
 */
export function generateRandomString(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

/**
 * Перевод миллисекунд в строку hh:mm:ss.ms
 * @param {number} s 
 * @returns {string}
 */
export function msToTime(s) {
  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;

  return hrs + ':' + mins + ':' + secs + '.' + ms;
}

/**
 * Ожидание
 * @param {number} ms 
 * @returns 
 */
export function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}