import simpleStatsModule from 'simple-statistics';
import cliProgress from 'cli-progress';
import { DateTime } from 'luxon';
import appConfig from './config.js';
import logger from './logger.js';
import apiDefsModule from './apiDefs.js';
import apiConnect from './apiConnect.js';
import argvUtils from './argv.js';
import waitUtils from './waitUtils.js';

type JmatileNowcTargetTimeObjType = {
  basetime: string;
  validtime: string;
  elements: Array<string>;
};
type JmatileNowcTargetTimeRspObjType = {
  basetime: DateTime;
  validtime: DateTime;
  elements: Array<string>;
};
type JmatileRasrfTargetTimeObjType = JmatileNowcTargetTimeObjType & { member: 'none' | 'immed' };
type JmatileRasrfTargetTimeRspObjType = JmatileNowcTargetTimeRspObjType & { member: 'none' | 'immed' };

async function fetchAllApiData() {
  const retObj: {
    jmatile_nowc_dataStatus: { dataStatus: string };
    jmatile_nowc_targetTimes_n1: Array<JmatileNowcTargetTimeRspObjType>;
    jmatile_nowc_targetTimes_n2: Array<JmatileNowcTargetTimeRspObjType>;
    jmatile_nowc_targetTimes_n3: Array<JmatileNowcTargetTimeRspObjType>;
    jmatile_rasrf_targetTimes: Array<JmatileRasrfTargetTimeRspObjType>;
  } = {
    jmatile_nowc_dataStatus: await (async () => {
      logger.trace('Downloading:', apiDefsModule.apiDefs.jmatile_nowc_dataStatus().endpoint, '...');
      return await apiConnect.apiConnect(apiDefsModule.apiDefs.jmatile_nowc_dataStatus().endpoint, {}, {});
    })(),
    jmatile_nowc_targetTimes_n1: await (async () => {
      logger.trace('Downloading:', apiDefsModule.apiDefs.jmatile_nowc_targetTimes_n1().endpoint, '...');
      const tmpRsp = await apiConnect.apiConnect(apiDefsModule.apiDefs.jmatile_nowc_targetTimes_n1().endpoint, {}, {});
      const tmpRetObj: Array<JmatileNowcTargetTimeRspObjType> = tmpRsp.map((obj: JmatileNowcTargetTimeObjType) => {
        return {
          basetime: DateTime.fromFormat(obj.basetime, 'yyyyMMddHHmmss', { zone: 'UTC' }).setZone('Asia/Tokyo'),
          validtime: DateTime.fromFormat(obj.validtime, 'yyyyMMddHHmmss', { zone: 'UTC' }).setZone('Asia/Tokyo'),
          elements: obj.elements,
        };
      });
      return tmpRetObj;
    })(),
    jmatile_nowc_targetTimes_n2: await (async () => {
      logger.trace('Downloading:', apiDefsModule.apiDefs.jmatile_nowc_targetTimes_n2().endpoint, '...');
      const tmpRsp = await apiConnect.apiConnect(apiDefsModule.apiDefs.jmatile_nowc_targetTimes_n2().endpoint, {}, {});
      const tmpRetObj: Array<JmatileNowcTargetTimeRspObjType> = tmpRsp.map((obj: JmatileNowcTargetTimeObjType) => {
        return {
          basetime: DateTime.fromFormat(obj.basetime, 'yyyyMMddHHmmss', { zone: 'UTC' }).setZone('Asia/Tokyo'),
          validtime: DateTime.fromFormat(obj.validtime, 'yyyyMMddHHmmss', { zone: 'UTC' }).setZone('Asia/Tokyo'),
          elements: obj.elements,
        };
      });
      return tmpRetObj;
    })(),
    jmatile_nowc_targetTimes_n3: await (async () => {
      logger.trace('Downloading:', apiDefsModule.apiDefs.jmatile_nowc_targetTimes_n3().endpoint, '...');
      const tmpRsp = await apiConnect.apiConnect(apiDefsModule.apiDefs.jmatile_nowc_targetTimes_n3().endpoint, {}, {});
      const tmpRetObj: Array<JmatileNowcTargetTimeRspObjType> = tmpRsp.map((obj: JmatileNowcTargetTimeObjType) => {
        return {
          basetime: DateTime.fromFormat(obj.basetime, 'yyyyMMddHHmmss', { zone: 'UTC' }).setZone('Asia/Tokyo'),
          validtime: DateTime.fromFormat(obj.validtime, 'yyyyMMddHHmmss', { zone: 'UTC' }).setZone('Asia/Tokyo'),
          elements: obj.elements,
        };
      });
      return tmpRetObj;
    })(),
    jmatile_rasrf_targetTimes: await (async () => {
      logger.trace('Downloading:', apiDefsModule.apiDefs.jmatile_rasrf_targetTimes().endpoint, '...');
      const tmpRsp = await apiConnect.apiConnect(apiDefsModule.apiDefs.jmatile_rasrf_targetTimes().endpoint, {}, {});
      const tmpRetObj: Array<JmatileRasrfTargetTimeRspObjType> = tmpRsp.map((obj: JmatileRasrfTargetTimeObjType) => {
        return {
          basetime: DateTime.fromFormat(obj.basetime, 'yyyyMMddHHmmss', { zone: 'UTC' }).setZone('Asia/Tokyo'),
          validtime: DateTime.fromFormat(obj.validtime, 'yyyyMMddHHmmss', { zone: 'UTC' }).setZone('Asia/Tokyo'),
          member: obj.member,
          elements: obj.elements,
        };
      });
      return tmpRetObj;
    })(),
  };
  return retObj;
}

export default {
  fetchAllApiData,
};
