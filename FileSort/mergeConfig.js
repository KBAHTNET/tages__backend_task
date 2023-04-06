//@ts-check
'use strict';

//файл конфигурации для сортировки файла

/**
 * @typedef {{
              * srcFilename: string, 
              * distFilename: string, 
* }} mergeConfig 
*/

/**@type {mergeConfig}*/
export const sortConfig = {
  //путь к неотсортированному файлу
  srcFilename: 'bigfile.txt',

  //путь, по которому создастся отсортированный файл
  distFilename: 'bigfile_sort.txt',
}