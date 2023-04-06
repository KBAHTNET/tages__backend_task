//@ts-check
'use strict';

//файл конфигурации для генерации файла

/**
 * @typedef {{
              * fileLength: number, 
              * filename: string, 
              * minStrLength: number, 
              * maxStrLength: number, 
              * strSplitter: string,
              * maxMemoryUse: number
* }} generateConfig 
*/

/**@type {generateConfig}*/
export const config = {
  //размер сгенерированного файла 1024^3 = 1ГБ (1 сивол = 1 байт в utf-8) (1024^4 = 1ТБ)
  fileLength: 300 * Math.pow(1024, 1),

  //имя файла при генерации (указываатся просто имя файла либо относительный, либо абсолютный путь)
  filename: 'bigfile.txt',

  //минимальная длина строки
  minStrLength: 2,

  //максимальная длина строки
  maxStrLength: 100000,

  //символ переноса строки (символ разделяющий строки абстрактно)
  strSplitter: '\n',

  //максимальный размер используемой оперативной памяти в байтах (без учета использования ОЗУ самой нодой)
  maxMemoryUse: 500 * Math.pow(1024, 2),
}