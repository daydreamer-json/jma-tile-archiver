import fs from 'fs';
import path from 'path';
import simpleStatsModule from 'simple-statistics';
import sharp from 'sharp';

async function isImageAllAlpha(buffer: Buffer) {
  const data = (await sharp(buffer).raw().toBuffer({ resolveWithObject: true })).data;
  for (let i = 0; i < data.length; i += 4) {
    const red = data[i];
    const green = data[i + 1];
    const blue = data[i + 2];
    const alpha = data[i + 3];
    if (alpha !== 0) {
      return false; // 無色透明でないピクセルが見つかった場合
    }
  }
  return true;
}

async function test() {
  const testTransparentImg = await fs.promises.readFile(
    'D:\\Applications\\GitHub\\Repository_HuggingFace\\jma-tile-archive-data\\output\\jma\\hrpns\\400.png',
  );
  const testNonTransparentImg = await fs.promises.readFile(
    'D:\\Applications\\GitHub\\Repository_HuggingFace\\jma-tile-archive-data\\output\\jma\\hrpns\\411.png',
  );
  console.log(await isImageAllAlpha(testTransparentImg));
  console.log(await isImageAllAlpha(testNonTransparentImg));
}

export default {
  isImageAllAlpha,
};
