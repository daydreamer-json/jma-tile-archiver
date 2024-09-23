import fs from 'fs';
import path from 'path';
import cliProgress from 'cli-progress';
import tar from 'tar-stream';
import { Writable } from 'stream';
import appConfig from './config.js';
import logger from './logger.js';
import argvUtils from './argv.js';
import waitUtils from './waitUtils.js';

async function createTarFile(
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

async function extractTarBuffer(buffer: Buffer) {
  return new Promise((resolve, reject) => {
    const extract = tar.extract();
    const files: Array<{
      data: Buffer;
      header: tar.Headers;
    }> = [];
    extract.on('entry', (header, stream, next) => {
      const chunks: Array<any> = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => {
        files.push({
          data: Buffer.concat(chunks),
          header,
        });
        next();
      });
      stream.on('error', reject);
    });
    extract.on('finish', () => resolve(files));
    extract.on('error', reject);
    extract.end(buffer);
  });
}

async function test() {
  const tarBuf = await createTarFile([
    { path: 'a.bin', data: new ArrayBuffer(8), modifiedTime: null },
    { path: 'b.bin', data: new ArrayBuffer(16), modifiedTime: null },
    { path: 'x/c.bin', data: new ArrayBuffer(24), modifiedTime: null },
    { path: 'x/d.bin', data: new ArrayBuffer(32), modifiedTime: null },
  ]);
  console.log(await extractTarBuffer(tarBuf));
}

export default {
  createTarFile,
  extractTarBuffer,
  test,
};
