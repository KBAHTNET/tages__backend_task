//@ts-check
'use strict';

import {open} from 'fs/promises';

const maint = async () => {
  let str = '1';
  const filename = 'C:/shared_fast/tages task/bigfile.txt';

  const fd = await open(filename, 'r+');
const rs = fd.createReadStream({
  start: 102416, 
  // end: strObj.start + strObj.symbolsToSort.length + 1, 
  encoding: 'utf-8'
});

rs.on('data', chunk => {
  const ss = chunk.toString();
  str += chunk.toString();
  return ss;
});
// rs.on('readable', async () => {
//   const chunk = rs.read();
//   const s = chunk.toString();
//   strObj.symbolsToSort += s;

// });

  rs.read(str.length + 1);

};
const ss = await maint();
console.log(ss);
