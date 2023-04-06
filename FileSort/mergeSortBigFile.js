//@ts-check
'use strict';

//Главный файл для запуска сортировки файла

//#region Imports

import { open } from 'fs/promises';
import { char2Int, createStrObjects, mergeSort } from './mergeUtils.js';
import { config } from '../FileGeneration/generateConfig.js';

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

export async function sortBigFile() {
  const filename = 'C:/shared_fast/tages task/bigfile.txt';
  const sortFilename = 'C:/shared_fast/tages task/bigfile_sort00.txt';
  const fd = await open(filename, 'r')

  // let a = printMemoryUsage();

  /**@type {Array<StrObj>}*/
  const strList = await createStrObjects(fd);

  //вернется отсортированный массив из объектов строк, где индекс объекта в массив - номер строки в отсортированном файле,
  //а номер самой строки, ее начало и конец указаны в самом объекте, исходя из этого
  //можно начать запись в новый файл построчно
  //после того, как строка будет переписана, ее можно стереть из исходного файла (но делать мы этого не будем, потому что ограничения только по ОЗУ)
  const sortedArr = (await mergeSort(strList, filename));

  //для записи будем использовать подход 2 генерации файла (generateBigFile2.js), 
  //где используется 1 поток для записи и пока не вышли за предел предоставленной ОЗУ
  //дескриптор записи не закроем
  let fdNew = await open(sortFilename, 'a+');
  let ws = fdNew.createWriteStream({encoding: 'utf-8'});

  // let splitter = config.strSplitter;

  // /**@type {Array<StrObj>}*/
  // const newStrObjects = [];
  // for (let i = 0; i < sortedArr.length; i += 1) {
  //   ws.write(splitter);
  //   /**@type {StrObj}*/
  //   const newStrObj = {
  //     start: i,
  //     end: splitter.length + i,
  //     strNumber: i,
  //     symbolsToSort: '',
  //   }

  //   newStrObjects.push(newStrObj);
  // }

  let currentMemoryUsage = 0;

  for (let i = 0; i < sortedArr.length; i += 1) {
    const memoryUsage = sortedArr[i].end - sortedArr[i].start;
    currentMemoryUsage += memoryUsage;

    if (config.maxMemoryUse >= currentMemoryUsage) {
      let buffer = (await read(filename, sortedArr[i].start, sortedArr[i].end));
      if(buffer[buffer.length - 1] !== '\n') {
        buffer += '\n'
      }
      ws.write(buffer);
    } else if (config.maxMemoryUse >=  memoryUsage && config.maxMemoryUse < currentMemoryUsage) {
      ws.close();
      await fdNew.close();

      fdNew = await open(sortFilename, 'a+');
      ws = fdNew.createWriteStream({encoding: 'utf-8'});

      currentMemoryUsage = 0;
    } else if (config.maxMemoryUse < memoryUsage) {
      //запись чанками
      console.log('не должно зайти сюда)), если зашло, то ГГ')
    }
  }

  // let b = printMemoryUsage();
  // const formatMemoryUsage = (data) => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`;
  // let c = {
  //   rss: formatMemoryUsage(b.rss - a.rss),
  //   heapTotal: formatMemoryUsage(b.heapTotal - a.heapTotal),
  //   heapUsed: formatMemoryUsage(b.heapUsed - a.heapUsed),
  //   external: formatMemoryUsage(b.external - a.external)
  // }

  // console.log(c);

  //объект передается по значению, 
  //поэтому все изменения объекта внутри функции приведут к изменению передаваемого объекта
  //await mergeSort(strList); 
   console.log(strList.length);
}

sortBigFile();

//#region ReadFileHelpers

/**
 * 
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
    // const bufferLength = end - start;
    rs.read(end - start);
  });
}

//#endregion
