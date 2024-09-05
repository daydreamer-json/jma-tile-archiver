import appConfig from './utils/config.js';
import argvUtils from './utils/argv.js';
import logger from './utils/logger.js';
import nicUtils from './utils/nicUtils.js';
import mapTileDownloadUtils from './utils/mapTileDownloadUtils.js';
import tarballUtils from './utils/tarballUtils.js';

async function mainCmdHandler() {
  logger.level = argvUtils.getArgv().logLevel;
  const netshCmdRsp = await nicUtils.getNetshInfo();
  await nicUtils.checkIsUsingTempIpv6(netshCmdRsp);
}

export default mainCmdHandler;
