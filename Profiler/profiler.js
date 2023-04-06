//@ts-check
'use strict';

//замер времени выполнения функций

import { performance } from 'perf_hooks';

/**
 * 
 * @param {Function} funcToTime 
 * @param  {...any} args 
 * @returns {Promise<any>}
 */
export async function TimingFunc(funcToTime, ...args) {
  const startDate = performance.now()

  let funcReturn = await funcToTime(...args);

  const endDate = performance.now()
  const delta = endDate - startDate;

  console.log(`${funcToTime.name} ${msToTime(delta)}`);

  return funcReturn;
}

function msToTime(s) {
  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;

  return hrs + ':' + mins + ':' + secs + '.' + ms;
}