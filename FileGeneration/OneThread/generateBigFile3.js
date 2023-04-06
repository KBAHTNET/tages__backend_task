//@ts-check
'use strict';

//Генерирует файл указанного размера в байтах - 1 байт = 1 символ (utf-8)
//подход с генерацией файла, где использование оперативной памяти ограничено размером записываемого чанка

//#region Импорт

import { getRandomInt, generateRandomString, msToTime } from '../utils.js';
import  { config } from '../generateConfig.js';
import { open } from 'fs/promises';

//#endregion

export async function generateFile() {
  const start = Date.now();

  let restFileLength = config.fileLength;//оставшася длина файла

  while(restFileLength > config.minStrLength) {
    const fd = await open(config.filename, 'a+');
    const ws = fd.createWriteStream({encoding: 'utf-8'});

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
    ws.write(buffer);

    //#endregion

    await fd.close();
  }

  const end = Date.now();
  console.log(`time ${msToTime(end - start)}`);
}

generateFile();