//@ts-check
'use strict';

//Файл с переиспользуемыми вспомогательными функциями для сортировки файла

import { open } from 'fs/promises';

//#region Merge main functions

/**
 * Создает для каждой строки объект strObj
 * @param {import('fs/promises').FileHandle} fd 
 * @returns {Promise<Array<import('./mergeSortBigFile.js').StrObj>>}
 */
export function createStrObjects(fd, maxMemoryUse = 100 * Math.pow(1024, 1), splitter = '\n') {
  return new Promise(async (resolve, reject) => {
    const fileSize = (await fd.stat()).size;
  
    let currentPos = 0;
    let readedBytes = 0;
  
    const splitterByte = char2Int(splitter);
    let splittersCount = 0;

    /**@type {Array<import('./mergeSortBigFile.js').StrObj>}*/
    const strObjects = []
    let nextStrOffset = 0;
    let nextStrFirstSymbol = '';

    const rs = fd.createReadStream();

    rs.on('data', async (chunk) => {
      if(!nextStrFirstSymbol) {
        //@ts-ignore
        nextStrFirstSymbol = int2Char(chunk[0])
      }

      for(let i = 0; i < chunk.length; i += 1) {
        currentPos = readedBytes + i;

        if (chunk[i] === splitterByte) {

          /**@type {import('./mergeSortBigFile.js').StrObj}*/
          const strObj = {
            start: nextStrOffset, //понадобится для записи в сортированный файл
            end: currentPos,
            strNumber: splittersCount,
            symbolsToSort: nextStrFirstSymbol,
          }

          splittersCount += 1;
          nextStrOffset = currentPos + 1;

          if (i + 1 < chunk.length) {
            //@ts-ignore
            nextStrFirstSymbol = int2Char(chunk[i + 1]);
          } else {
            nextStrFirstSymbol = '';
          }

          strObjects.push(strObj);
        }
      }
      readedBytes += chunk.length;
      if (readedBytes === fileSize) {
        rs.close();
        await fd.close();
        resolve(strObjects);
      }
    });

    rs.read(maxMemoryUse);
  });
}

/**
 * n*log(2)n
 * Итаративная сортировка слиянием (без рекурсии)
 * @param {Array<import('./mergeSortBigFile.js').StrObj>} strList 
 * @param {string} filename 
 * @returns {Promise<Array<import('./mergeSortBigFile.js').StrObj>>}
 */
export async function mergeSort(strList, filename) {

  let resArr = [];
  let tmpArr = [];
  
  //создать обертку из массива для каждого объекта
  for (let i = 0; i < strList.length; i += 1) {
    const arr = [strList[i]];
    resArr.push(arr);
  }

  //merge sort поначалу разбиваем на подмассивы по 1 элементу и считаем, что каждый из подмассивов отсортирован
  let elemsInSortArray = 1;

  //если в массиве будет 1 массив, то значит все отсортировали
  while(resArr.length != 1) {
    for (let i = 0; i < resArr.length; i += 2) {
      const left = resArr[i];
      if (i + 1 < resArr.length) {
        const rigth = resArr[i + 1];
        
        const mergeArr = await merge(left, rigth, filename);
        tmpArr.push(mergeArr);
      } else {
        tmpArr.push(left);
      }
    }
    resArr = tmpArr;
    tmpArr = [];
    elemsInSortArray *= 2;
  }

  return resArr[0];
}

/**
 * Слияние 2-х массивов, содержащих объекты строк 
 * @param {Array<import('./mergeSortBigFile.js').StrObj>} leftArr 
 * @param {Array<import('./mergeSortBigFile.js').StrObj>} rightArr 
 * @param {string} filename имя файла (необходимо для динамического дополнения символов строки для сравнения 2-х строк,если там символы одинаковые)
 * @returns {Promise<Array<import('./mergeSortBigFile.js').StrObj>>}
 */
async function merge(leftArr, rightArr, filename) {
  let leftPointer = 0;
  let rigthPointer = 0;

  /**@type {Array<import('./mergeSortBigFile.js').StrObj>}*/
  let resArr = [];

  while(leftPointer < leftArr.length || rigthPointer < rightArr.length) {
    if (leftPointer === leftArr.length && rigthPointer === rightArr.length) {
      return resArr;
    }
    if (leftPointer === leftArr.length) {
      for (let i = rigthPointer; i < rightArr.length; i += 1) {
        resArr.push(rightArr[i]);
      }
      return resArr;
    }
    if (rigthPointer === rightArr.length) {
      for (let i = leftPointer; i < leftArr.length; i += 1) {
        resArr.push(leftArr[i]);
      }
      return resArr;
    }

    const firstObj = leftArr[leftPointer];
    const secondObj = rightArr[rigthPointer];

    const cmpRes = await cmpObjects(firstObj, secondObj, filename);
    if (firstObj === cmpRes[0]) {
      leftPointer += 1;
      resArr.push(firstObj);
    } else {
      rigthPointer += 1;
      resArr.push(secondObj);
    }
  }
  return [];
}


/**
 * Сравнение объектов строк
 * @param {import('./mergeSortBigFile.js').StrObj} firstObj первый сравниваемый объект строки
 * @param {import('./mergeSortBigFile.js').StrObj} secondObj второй сравниваемый объект строки
 * @param {string} filename имя файла, в котором сортируются строки
 * @returns {Promise<Array<import('./mergeSortBigFile.js').StrObj>>} возвращает массив из 2-х элементов, где первый элемент меньше второго
 */
async function cmpObjects(firstObj, secondObj, filename) {
  let firstStr = firstObj.symbolsToSort;
  let secondStr = secondObj.symbolsToSort;

  let symbolNumber = 0;

  while(true) {
    if (symbolNumber >= firstStr.length) {
      await readNextSymbol(firstObj, filename);
      firstStr = firstObj.symbolsToSort;
    }
    if (symbolNumber >= secondStr.length) {
      await readNextSymbol(secondObj, filename);
      secondStr = secondObj.symbolsToSort;
    } 

    let firstStrSymbol = char2Int(firstStr[symbolNumber]);
    let secondStrSymbol = char2Int(secondStr[symbolNumber]);

    //readNextSymbol возвращает 0 если строка кончилась
    if(firstStrSymbol === 0) {
      return [firstObj, secondObj]; 
    } else if (secondStrSymbol === 0) {
      return [secondObj, firstObj]; 
    }

    if (firstStrSymbol < secondStrSymbol) {
      return [firstObj, secondObj];
    } else if (firstStrSymbol > secondStrSymbol) {
      return [secondObj, firstObj];
    } else if (firstStrSymbol === secondStrSymbol) {
      symbolNumber += 1;
    }
  }
}

/**
 * Читает следующий символ в строке от ее начала (для сравнения объектов)
 * @param {import('./mergeSortBigFile.js').StrObj} strObj 
 * @param {string} filename 
 */
function readNextSymbol(strObj, filename) {

  return new Promise(async (resolve, reject) => {
     if (strObj.symbolsToSort.length >= strObj.end - strObj.start) {
      strObj.symbolsToSort += int2Char(0);
      return resolve('');
    }
  
    const fd = await open(filename, 'r');
    const rs = fd.createReadStream({
      start: strObj.start, 
      end: strObj.start + strObj.symbolsToSort.length + 1,
      encoding: 'utf-8'
    });
  
    rs.on('data',async (chunk) => {
      strObj.symbolsToSort = chunk.toString();

      rs.close();
      await fd.close();
      return resolve('');
    });

    rs.read();
  });  
}

//#endregion

//#region Helpers

/**
 * Функция для просмотра использования процессом памяти
 * @returns {NodeJS.MemoryUsage}
 */
export function printMemoryUsage() {
  const formatMemoryUsage = (data) => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`;

  const memoryData = process.memoryUsage();
  
  const memoryUsage = {
    rss: `${formatMemoryUsage(memoryData.rss)} -> Resident Set Size - total memory allocated for the process execution`,
    heapTotal: `${formatMemoryUsage(memoryData.heapTotal)} -> total size of the allocated heap`,
    heapUsed: `${formatMemoryUsage(memoryData.heapUsed)} -> actual memory used during the execution`,
    external: `${formatMemoryUsage(memoryData.external)} -> V8 external memory`,
  };
  
  console.log(memoryUsage);
  return memoryData;
}

/**
 * Конвертация строки в число
 * @param {string} char 
 * @returns {number}
 */
export function char2Int(char) {
  return char.charCodeAt(0);
}

/**
 * Конвертация числа в строку
 * @param {number} number 
 * @returns {string}
 */
export function int2Char(number) {
  return String.fromCharCode(number)
}

//#endregion