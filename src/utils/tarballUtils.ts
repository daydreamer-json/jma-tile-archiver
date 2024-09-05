import fs from 'fs';
import path from 'path';
import cliProgress from 'cli-progress';
import tar from 'tar-stream';
import { Writable } from 'stream';
import appConfig from './config.js';
import logger from './logger.js';
import argvUtils from './argv.js';
import waitUtils from './waitUtils.js';

async function createTarFileOLD(
  outputPath: string,
  fileBufArray: Array<{ path: string; data: Buffer | ArrayBuffer; modifiedTime: Date | null }>,
) {
  const tarPack = tar.pack();
  const chunks = new Array();
  for (const file of fileBufArray) {
    tarPack.entry(
      { name: file.path, mtime: file.modifiedTime === null ? new Date() : file.modifiedTime },
      Buffer.from(file.data),
    );
  }
  tarPack.finalize();
  for await (const chunk of tarPack) {
    chunks.push(chunk);
  }
  const tarBuf = Buffer.concat(chunks);
  logger.trace('Finalized tarball buffer');
  return tarBuf;
}

async function createTarFile(
  outputPath: string,
  fileBufArray: Array<{ path: string; data: Buffer | ArrayBuffer; modifiedTime: Date | null }>,
) {
  const tarPack = tar.pack();
  const chunks = new Array();
  const writable = new Writable({
    write(chunk, encoding, callback) {
      chunks.push(chunk);
      callback();
    },
  });
  tarPack.pipe(writable);
  for (const file of fileBufArray) {
    tarPack.entry(
      { name: file.path, mtime: file.modifiedTime === null ? new Date() : file.modifiedTime },
      Buffer.from(file.data),
    );
  }
  tarPack.finalize();
  await new Promise((resolve, reject) => {
    writable.on('finish', resolve);
    writable.on('error', reject);
  });
  return Buffer.concat(chunks);
}

async function test() {
  await fs.promises.writeFile(
    'test.tar',
    await createTarFile('test.tar', [
      { path: 'a.bin', data: new ArrayBuffer(8), modifiedTime: null },
      { path: 'b.bin', data: new ArrayBuffer(16), modifiedTime: null },
      { path: 'x/c.bin', data: new ArrayBuffer(24), modifiedTime: null },
      { path: 'x/d.bin', data: new ArrayBuffer(32), modifiedTime: null },
    ]),
    { encoding: 'binary' },
  );
}

export default {
  createTarFile,
  test,
};
