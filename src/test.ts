import { DateTime } from 'luxon';

import appConfig from './utils/config.js';
import argvUtils from './utils/argv.js';
import logger from './utils/logger.js';
import nicUtils from './utils/nicUtils.js';
import mapTileDownloadUtils from './utils/mapTileDownloadUtils.js';
import jmaTileDownloadUtils from './utils/jmaTileDownloadUtils.js';
import imageUtils from './utils/imageUtils.js';
import appDatabase from './utils/configDatabase.js';

async function mainCmdHandler() {
  logger.level = argvUtils.getArgv().logLevel;
  const netshCmdRsp = await nicUtils.getNetshInfo();
  await nicUtils.checkIsUsingTempIpv6(netshCmdRsp);
  // await mapTileDownloadUtils.bgTileDownload(14, 'pale');
  // await mapTileDownloadUtils.bgTileDownload(10, 'jma_mask');
  appDatabase.getConfig();
  await jmaTileDownloadUtils.batchDownload();
}

export default mainCmdHandler;
