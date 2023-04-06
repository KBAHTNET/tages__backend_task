//@ts-check
'use strict';

//#region Импорт

import { generateRandomString } from '../../utils.js';
import  { config } from '../../generateConfig.js';
import { workerData, parentPort } from 'worker_threads';
import { open } from 'fs/promises';

//#endregion

const chunkLength = workerData.chunkLength;

//#region generate chunk

const chunk = generateRandomString(chunkLength) + config.strSplitter;

//#endregion

//#region write chunk

const fd = await open(config.filename, 'a+');
const ws = fd.createWriteStream({encoding: 'utf-8'});

const buffer = Buffer.from(chunk, 'utf-8');
ws.write(buffer, async (err) => {
  if (err) throw err;

  await fd.close();
  parentPort?.postMessage(null);
});

//#endregion
