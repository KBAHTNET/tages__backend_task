//@ts-check
'use strict';

//Главный файл для запуска сортировки файла

//#region Imports

import { open } from 'fs/promises';
import { createStrObjects, mergeSort } from './mergeUtils.js';
import { config } from '../FileGeneration/generateConfig.js';
import { sortConfig } from './mergeConfig.js';

//#endregion

/**
 * объект строки для сортировки
 * @typedef {{
                * strNumber: number, 
                * start: number, 
                * end: number, 
                * symbolsToSort: string
 * }} StrObj
 */

/**
 * @param {string} srcFilename путь к неотсортированному файлу
 * @param {string} distFilename путь, по которому создастся отсортированный файл
 */
export async function sortBigFile(srcFilename, distFilename) {
  const fd = await open(srcFilename, 'r')

  // let a = printMemoryUsage();

  /**@type {Array<StrObj>}*/
  const strList = await createStrObjects(fd);

  //вернется отсортированный массив из объектов строк, где индекс объекта в массив - номер строки в отсортированном файле,
  //а номер самой строки, ее начало и конец указаны в самом объекте, исходя из этого
  //можно начать запись в новый файл построчно
  //после того, как строка будет переписана, ее можно стереть из исходного файла (но делать мы этого не будем, потому что ограничения только по ОЗУ)
  const sortedArr = (await mergeSort(strList, srcFilename));

  //для записи будем использовать подход 2 генерации файла (generateBigFile2.js), 
  //где используется 1 поток для записи и пока не вышли за предел предоставленной ОЗУ
  //дескриптор записи не закроем
  let fdNew = await open(distFilename, 'a+');
  let ws = fdNew.createWriteStream({encoding: 'utf-8'});

  let currentMemoryUsage = 0;

  for (let i = 0; i < sortedArr.length; i += 1) {
    const memoryUsage = sortedArr[i].end - sortedArr[i].start;
    currentMemoryUsage += memoryUsage;

    if (config.maxMemoryUse >= currentMemoryUsage) {
      let buffer = (await read(srcFilename, sortedArr[i].start, sortedArr[i].end));
      if(buffer[buffer.length - 1] !== '\n') {
        buffer += '\n'
      }
      ws.write(buffer);
    } else if (config.maxMemoryUse >=  memoryUsage && config.maxMemoryUse < currentMemoryUsage) {
      ws.close();
      await fdNew.close();

      fdNew = await open(distFilename, 'a+');
      ws = fdNew.createWriteStream({encoding: 'utf-8'});

      currentMemoryUsage = 0;
    } else if (config.maxMemoryUse < memoryUsage) {
      //запись чанками
      console.log('не должно зайти сюда)), если зашло, то ГГ')
    }
  }
   console.log(strList.length);
}

sortBigFile(sortConfig.srcFilename, sortConfig.distFilename);

//#region ReadFileHelpers

/**
 * Прочитать часть файла в указанном диапазоне
 * @param {string} filename 
 * @param {number} start 
 * @param {number} end 
 * @returns {Promise<Buffer|string>}
 */
function read(filename, start, end, autoclose = true) {
  return new Promise(async (resolve, reject) => {
    const fd = await open(filename, 'r');
    const rs = fd.createReadStream({encoding:'utf-8', start, end});
    rs.on('data', async (chunk) => {

      if (autoclose) {
        rs.close();
        await fd.close();
      }

      return resolve(chunk);
    });
    rs.read(end - start);
  });
}

//#endregion
