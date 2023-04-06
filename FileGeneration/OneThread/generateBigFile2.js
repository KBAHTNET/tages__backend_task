//@ts-check
'use strict';

//Генерирует файл указанного размера в байтах - 1 байт = 1 символ (utf-8)
//подход с использованием максимально допустимого объема памяти (наиболее подходящий подход для 1 потока)

//#region Импорт

import { getRandomInt, generateRandomString, msToTime } from '../utils.js';
import  { config } from '../generateConfig.js';
import { open } from 'fs/promises';
import { WriteStream } from 'fs';

//#endregion

export async function generateFile() {
  const start = Date.now();

  let currentUseMemory = 0;
  let restFileLength = config.fileLength;//оставшася длина файла

  /**@type {import('fs/promises').FileHandle|null}*/
  let fd = await open(config.filename, 'a+');

  /**@type {WriteStream|null}*/
  let ws = fd.createWriteStream({encoding: 'utf-8'});

  while(restFileLength > config.minStrLength) {
    //#region generate chunk

    const maxLength = restFileLength > config.maxStrLength ? 
                        config.maxStrLength : restFileLength;
                        
    const genParams = {min: config.minStrLength, max: maxLength};
    const chunkLength = getRandomInt(genParams) - config.strSplitter.length;
    restFileLength -= chunkLength + config.strSplitter.length;

    const chunk = generateRandomString(chunkLength) + config.strSplitter;

    //#endregion

    //#region write chunk

    const buffer = Buffer.from(chunk, 'utf-8');

    if(currentUseMemory + buffer.length > config.maxMemoryUse) {
      //#region  clean
      ws.close();
      await fd.close();
      ws = null;
      fd = null;
      //#endregion

      //#region reInit
      fd = await open(config.filename, 'a+');
      ws = fd.createWriteStream({encoding: 'utf-8'});
      currentUseMemory = 0;
      //#endregion
    }

    ws.write(buffer);
    currentUseMemory += buffer.length;

    //#endregion
  }

  await fd.close();
  const end = Date.now();
  console.log(`time ${msToTime(end - start)}`);
}

generateFile();