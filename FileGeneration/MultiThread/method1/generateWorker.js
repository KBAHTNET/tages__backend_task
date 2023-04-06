//@ts-check
'use strict';

//#region Импорт

import { generateRandomString } from '../../utils.js';
import  { config } from '../../generateConfig.js';
import { write } from 'fs';
import { workerData, parentPort } from 'worker_threads';

//#endregion

const fd = workerData.fd;
const chunkLength = workerData.chunkLength;

//#region generate chunk
const chunk = generateRandomString(chunkLength) + config.strSplitter;

//#endregion

//#region write chunk

const buffer = Buffer.from(chunk, 'utf-8');
write(fd, buffer, (err, wrNumber, buf) => {
  parentPort?.postMessage(null);
});

//#endregion
