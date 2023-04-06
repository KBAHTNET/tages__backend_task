//@ts-check
'use strict';

import { TimingFunc } from './profiler.js'
import { generateFile } from '../FileGeneration/generateBigFile.js';
import { profiler } from 'js-profiler';

profiler.run(generateFile);

console.log('end');




function BigFuntion(a,b) {
  for(let i = 0; i < 1e5; i+=1) {
    const a = 1;
  }
  console.log(a,b);
}