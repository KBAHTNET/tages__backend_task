//@ts-check
'use strict';

//Генерирует файл указанного размера в байтах - 1 байт = 1 символ (utf-8)
//при генерации файла данным способом будет использовать оперативную память = размеру генерируемого файла 
//(наиболее быстрый для 1 потока, но оперативная память не бесконечна) - подходит для генерации файлов до 1-2 ГБ

//#region Импорт

import { getRandomInt, generateRandomString, msToTime } from '../utils.js';
import  { config } from '../generateConfig.js';
import { open, close, write } from 'fs';

//#endregion

export function generateFile() {
  const start = Date.now();

  //оставшася длина файла
  let restFileLength = config.fileLength;

  open(config.filename, 'a+', null, (err, fd) => {
    if (err) throw err;

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
      write(fd, buffer, (err, wrNumber, buf) => {});

      //#endregion
    }

    close(fd, (err) => {
      if (err) throw err;
      const end = Date.now();
      console.log(`time ${msToTime(end - start)}`);
      return;
    });
  });
}

generateFile();