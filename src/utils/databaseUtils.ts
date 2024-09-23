import { DateTime } from 'luxon';
import logger from './logger.js';
import appDatabase from './configDatabase.js';

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

type NeedDLEntryType = {
  hrpns_past: Array<JmatileNowcTargetTimeRspObjType | never>;
  hrpns_future: Array<JmatileNowcTargetTimeRspObjType | never>;
  rasrf_past: Array<JmatileRasrfTargetTimeRspObjType | never>;
  rasrf_future: Array<JmatileRasrfTargetTimeRspObjType | never>;
  rasrf03h_past: Array<JmatileRasrfTargetTimeRspObjType | never>;
  rasrf24h_past: Array<JmatileRasrfTargetTimeRspObjType | never>;
};

function getNeedDLEntry(jmaApiRspValid: {
  hrpns_past: Array<JmatileNowcTargetTimeRspObjType>;
  hrpns_future: Array<JmatileNowcTargetTimeRspObjType>;
  rasrf_past: Array<JmatileRasrfTargetTimeRspObjType>;
  rasrf_future: Array<JmatileRasrfTargetTimeRspObjType>;
  rasrf03h_past: Array<JmatileRasrfTargetTimeRspObjType>;
  rasrf24h_past: Array<JmatileRasrfTargetTimeRspObjType>;
}) {
  const needObj: NeedDLEntryType = {
    hrpns_past: (() => {
      const tmpArr = new Array();
      jmaApiRspValid.hrpns_past.forEach((obj) => {
        if (
          !appDatabase
            .getConfig()
            .hrpns.map((obj2) => obj2.toISO())
            .includes(obj.basetime.toISO())
        ) {
          tmpArr.push(obj);
        }
      });
      return tmpArr;
    })(),
    hrpns_future: (() => {
      const tmpArr = new Array();
      return tmpArr;
    })(),
    rasrf_past: (() => {
      const tmpArr = new Array();
      jmaApiRspValid.rasrf_past.forEach((obj) => {
        if (
          !appDatabase
            .getConfig()
            .rasrf.map((obj2) => obj2.toISO())
            .includes(obj.basetime.toISO())
        ) {
          tmpArr.push(obj);
        }
      });
      return tmpArr;
    })(),
    rasrf_future: (() => {
      const tmpArr = new Array();
      return tmpArr;
    })(),
    rasrf03h_past: (() => {
      const tmpArr = new Array();
      jmaApiRspValid.rasrf03h_past.forEach((obj) => {
        if (
          !appDatabase
            .getConfig()
            .rasrf03h.map((obj2) => obj2.toISO())
            .includes(obj.basetime.toISO())
        ) {
          tmpArr.push(obj);
        }
      });
      return tmpArr;
    })(),
    rasrf24h_past: (() => {
      const tmpArr = new Array();
      jmaApiRspValid.rasrf24h_past.forEach((obj) => {
        if (
          !appDatabase
            .getConfig()
            .rasrf03h.map((obj2) => obj2.toISO())
            .includes(obj.basetime.toISO())
        ) {
          tmpArr.push(obj);
        }
      });
      return tmpArr;
    })(),
  };
  console.log(needObj);
  return needObj;
}

async function updateDbFromNeedDLEntry(needDLEntry: NeedDLEntryType) {
  const newObj = {
    hrpns: [...needDLEntry.hrpns_past.map((obj) => obj.basetime), ...appDatabase.getConfig().hrpns].sort(
      (a: DateTime, b: DateTime) => b.toMillis() - a.toMillis(),
    ),
    rasrf: [...needDLEntry.rasrf_past.map((obj) => obj.basetime), ...appDatabase.getConfig().rasrf].sort(
      (a: DateTime, b: DateTime) => b.toMillis() - a.toMillis(),
    ),
    rasrf03h: [...needDLEntry.rasrf03h_past.map((obj) => obj.basetime), ...appDatabase.getConfig().rasrf03h].sort(
      (a: DateTime, b: DateTime) => b.toMillis() - a.toMillis(),
    ),
    rasrf24h: [...needDLEntry.rasrf24h_past.map((obj) => obj.basetime), ...appDatabase.getConfig().rasrf24h].sort(
      (a: DateTime, b: DateTime) => b.toMillis() - a.toMillis(),
    ),
  };
  appDatabase.setConfig(newObj);
  appDatabase.writeConfigToFile();
}

export default {
  getNeedDLEntry,
  updateDbFromNeedDLEntry,
};
