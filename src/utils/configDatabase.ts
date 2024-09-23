import fs from 'fs';
import { DateTime } from 'luxon';

type DatabaseType = {
  hrpns: Array<DateTime | never>;
  rasrf: Array<DateTime | never>;
  rasrf03h: Array<DateTime | never>;
  rasrf24h: Array<DateTime | never>;
};

type DatabaseFileType = {
  hrpns: Array<string | never>;
  rasrf: Array<string | never>;
  rasrf03h: Array<string | never>;
  rasrf24h: Array<string | never>;
};

const initDatabaseData: DatabaseType = {
  hrpns: [],
  rasrf: [],
  rasrf03h: [],
  rasrf24h: [],
};

const fileExistsCheck = async (path: string) => {
  try {
    await fs.promises.access(path, fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
};
if ((await fileExistsCheck('config/database.json')) === false) {
  await fs.promises.writeFile('config/database.json', JSON.stringify(initDatabaseData, null, '  '), {
    encoding: 'utf-8',
  });
}

let database = await (async (): Promise<DatabaseType> => {
  const tmpObj: DatabaseFileType = JSON.parse(await fs.promises.readFile('config/database.json', 'utf-8'));
  const outObj: DatabaseType = initDatabaseData;
  outObj.hrpns = tmpObj.hrpns.map((str) => DateTime.fromISO(str));
  outObj.rasrf = tmpObj.rasrf.map((str) => DateTime.fromISO(str));
  outObj.rasrf03h = tmpObj.rasrf03h.map((str) => DateTime.fromISO(str));
  outObj.rasrf24h = tmpObj.rasrf24h.map((str) => DateTime.fromISO(str));
  return outObj;
})();

export default {
  getConfig: () => database,
  setConfig: (newValue: DatabaseType) => {
    database = newValue;
  },
  writeConfigToFile: async () => {
    const outObj: DatabaseFileType = {
      hrpns: [],
      rasrf: [],
      rasrf03h: [],
      rasrf24h: [],
    };
    outObj.hrpns = database.hrpns.map((dtobj) => dtobj.toISO() ?? '');
    outObj.rasrf = database.rasrf.map((dtobj) => dtobj.toISO() ?? '');
    outObj.rasrf03h = database.rasrf03h.map((dtobj) => dtobj.toISO() ?? '');
    outObj.rasrf24h = database.rasrf24h.map((dtobj) => dtobj.toISO() ?? '');
    await fs.promises.writeFile('config/database.json', JSON.stringify(outObj, null, '  '), 'utf-8');
  },
};
