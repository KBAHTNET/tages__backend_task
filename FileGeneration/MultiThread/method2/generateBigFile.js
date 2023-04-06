//@ts-check
'use strict';

//Генерирует файл указанного размера в байтах - 1 байт = 1 символ (utf-8)
//при данном подходе открывается поток = количеству ядер - 2 
//(чтобы остались свободные ядра [стоит учесть, что необходимо ядер > 2 иначе в данном методе нет смысла])

//#region Импорт

import { getRandomInt, msToTime, sleep } from '../../utils.js';
import  { config } from '../../generateConfig.js';
import { cpus } from 'os';
import { Worker } from 'worker_threads';

//#endregion

export async function generateFileMultiThread() {
  const usingCPUs = cpus().length > 1 ? cpus().length : 1;
  const start = Date.now();

  console.log(usingCPUs);

  //оставшася длина файла
  let restFileLength = config.fileLength;

  if(usingCPUs > 1) {
    const workers = []
      
    while(restFileLength > config.minStrLength) {
      for (let i = 0; i < usingCPUs - 2; i += 1) {
        const maxLength = restFileLength > config.maxStrLength ? 
                            config.maxStrLength : restFileLength;
        
        const genParams = {min: config.minStrLength, max: maxLength};
        const chunkLength = getRandomInt(genParams) - config.strSplitter.length;

        let chunkLengthResult = 0;

        if (chunkLength < restFileLength) {
          chunkLengthResult = chunkLength;
          restFileLength -= chunkLengthResult;
        }
        else if (restFileLength > 1) {
          chunkLengthResult = restFileLength;
          restFileLength = 0;
        } else {
          chunkLengthResult = 0;
          break;
        }
        
        while(workers.length > usingCPUs) await sleep(0);
        
        const worker = new Worker('./FileGeneration/MultiThread/method2/generateWorker.js', {
          workerData: {
            chunkLength: chunkLengthResult,
        }});

        workers.push(worker);

        worker.on('message', (msg) => {
          workers.splice(workers.indexOf(worker), 1);
          worker.terminate();
        });
      }
      
    }

    while(workers.length > 0) await sleep(1);

    const end = Date.now();
    console.log(`time ${msToTime(end - start)}`);
  }
}

generateFileMultiThread();