import fs from 'fs';
import path from 'path';
import simpleStatsModule from 'simple-statistics';
import cliProgress from 'cli-progress';
import { DateTime } from 'luxon';
import appConfig from './config.js';
import logger from './logger.js';
import apiDefsModule from './apiDefs.js';
import apiConnect from './apiConnect.js';
import argvUtils from './argv.js';
import waitUtils from './waitUtils.js';
import mapTileCoordTransformUtils from './mapTileCoordTransformUtils.js';
import tarballUtils from './tarballUtils.js';
import writerUtils from './writerUtils.js';
import jmaApiUtils from './jmaApiUtils.js';
import imageUtils from './imageUtils.js';
import { AxiosResponseHeaders } from 'axios';
import databaseUtils from './databaseUtils.js';

// type jmaApiRspValid = {
//   hrpns_past:
// }

async function batchDownload() {
  const jmaApiRsp = await jmaApiUtils.fetchAllApiData();
  if (jmaApiRsp.jmatile_nowc_dataStatus.dataStatus !== 'Normal') {
    logger.warn('JMA data status is not Normal:', jmaApiRsp.jmatile_nowc_dataStatus);
  } else {
    logger.debug('JMA data status:', jmaApiRsp.jmatile_nowc_dataStatus);
  }
  const jmaApiRspValid = {
    hrpns_past: jmaApiRsp.jmatile_nowc_targetTimes_n1,
    hrpns_future: jmaApiRsp.jmatile_nowc_targetTimes_n2,
    rasrf_past: jmaApiRsp.jmatile_rasrf_targetTimes.filter((obj) => {
      if (obj.member === 'none' && obj.elements.includes('slmcs')) return true;
    }),
    rasrf_future: jmaApiRsp.jmatile_rasrf_targetTimes.filter((obj) => {
      if (obj.member === 'none' && !obj.elements.includes('slmcs')) return true;
    }),
    rasrf03h_past: jmaApiRsp.jmatile_rasrf_targetTimes.filter((obj) => {
      if (obj.member === 'none' && obj.elements.includes('slmcs') && obj.elements.includes('rasrf03h')) return true;
    }),
    rasrf24h_past: jmaApiRsp.jmatile_rasrf_targetTimes.filter((obj) => {
      if (obj.member === 'none' && obj.elements.includes('slmcs') && obj.elements.includes('rasrf03h')) return true;
    }),
  };
  const needDLEntry = databaseUtils.getNeedDLEntry(jmaApiRspValid);
  for (const targetTimeObj of needDLEntry.hrpns_past) {
    await singleTimeDL(targetTimeObj.basetime, 'hrpns', 10);
  }
  for (const targetTimeObj of needDLEntry.rasrf_past) {
    await singleTimeDL(targetTimeObj.basetime, 'rasrf', 10);
  }
  for (const targetTimeObj of needDLEntry.rasrf03h_past) {
    await singleTimeDL(targetTimeObj.basetime, 'rasrf03h', 10);
  }
  for (const targetTimeObj of needDLEntry.rasrf24h_past) {
    await singleTimeDL(targetTimeObj.basetime, 'rasrf24h', 10);
  }
  databaseUtils.updateDbFromNeedDLEntry(needDLEntry);
}

async function singleTimeDL(
  dtobj: DateTime,
  mapTileType: 'hrpns' | 'rasrf' | 'rasrf03h' | 'rasrf24h',
  zoomLevel: number = 10,
) {
  const baseUrl =
    appConfig.network.jmaApi.baseDomain +
    appConfig.network.jmaApi.apiPath +
    '/jmatile/data/' +
    (() => {
      if (mapTileType.includes('rasrf')) {
        return 'rasrf';
      } else {
        return 'nowc';
      }
    })() +
    `/${dtobj.setZone('UTC').toFormat('yyyyMMddHHmmss')}/none` +
    `/${dtobj.setZone('UTC').toFormat('yyyyMMddHHmmss')}` +
    `/surf/${mapTileType}`;
  const configCoordCalcRsp = {
    tl: mapTileCoordTransformUtils.lonLatToCoord(
      appConfig.mapTile.fetchPolygonCoord.tl.lon,
      appConfig.mapTile.fetchPolygonCoord.tl.lat,
      zoomLevel,
    ),
    tr: mapTileCoordTransformUtils.lonLatToCoord(
      appConfig.mapTile.fetchPolygonCoord.tr.lon,
      appConfig.mapTile.fetchPolygonCoord.tr.lat,
      zoomLevel,
    ),
    bl: mapTileCoordTransformUtils.lonLatToCoord(
      appConfig.mapTile.fetchPolygonCoord.bl.lon,
      appConfig.mapTile.fetchPolygonCoord.bl.lat,
      zoomLevel,
    ),
    br: mapTileCoordTransformUtils.lonLatToCoord(
      appConfig.mapTile.fetchPolygonCoord.br.lon,
      appConfig.mapTile.fetchPolygonCoord.br.lat,
      zoomLevel,
    ),
  };
  const needDlTileList = new Array();
  let tmp_threadId = 0;
  for (let i = configCoordCalcRsp.tl.tileCoord.x; i <= configCoordCalcRsp.tr.tileCoord.x; i++) {
    for (let j = configCoordCalcRsp.tl.tileCoord.y; j <= configCoordCalcRsp.bl.tileCoord.y; j++) {
      needDlTileList.push({ threadId: tmp_threadId, x: i, y: j });
      tmp_threadId === argvUtils.getArgv().thread - 1 ? (tmp_threadId = 0) : (tmp_threadId += 1);
    }
  }
  let needDlTileListChunked = new Array();
  Array.from(new Set(needDlTileList.map((obj) => obj.threadId))).forEach((threadId) => {
    needDlTileListChunked.push(needDlTileList.filter((obj) => obj.threadId === threadId));
  });

  logger.info(`JMA tile downloading: ${mapTileType}, z=${zoomLevel}, ${dtobj.toISO()}`);
  const progressBar =
    argvUtils.getArgv().noShowProgress === false
      ? new cliProgress.MultiBar({
          format: 'Requesting {bar} {percentage}% | {value}/{total} files | {duration_formatted}/{eta_formatted}',
          ...appConfig.logger.progressBarConfig,
        })
      : null;
  interface singleTileRspObjIF {
    threadId: number;
    x: number;
    y: number;
    data: Buffer | ArrayBuffer;
    rspHeader: AxiosResponseHeaders;
  }
  const chunkPromises: Array<Promise<Array<singleTileRspObjIF>>> = new Array();
  needDlTileListChunked.forEach((chunkArray) => {
    chunkPromises.push(
      new Promise(async (resolve, reject) => {
        let connectionTimer = process.hrtime();
        const subProgressBar = progressBar !== null ? progressBar.create(chunkArray.length, 0) : null;
        const tempRspArray: Array<singleTileRspObjIF> = new Array();
        for (const tileCoordObj of chunkArray) {
          let builtUrl = 'https://' + baseUrl + `/${zoomLevel}` + `/${tileCoordObj.x}` + `/${tileCoordObj.y}` + `.png`;
          try {
            const tmpRsp = {
              threadId: tileCoordObj.threadId,
              x: tileCoordObj.x,
              y: tileCoordObj.y,
              data: await apiConnect.apiConnectBinary(builtUrl, {}, {}),
              rspHeader: await apiConnect.apiHeadConnect(builtUrl, {}, {}),
            };
            if ((await imageUtils.isImageAllAlpha(tmpRsp.data)) === false) {
              tempRspArray.push(tmpRsp);
            }
            subProgressBar !== null ? subProgressBar.increment(1) : null;
          } catch (error: any) {
            if (
              typeof error.response !== 'undefined' &&
              typeof error.response.status === 'number' &&
              error.response.status === 404
            ) {
              subProgressBar !== null ? subProgressBar.increment(1) : null;
              subProgressBar === null
                ? logger.warn(
                    `Tile not found. Skipped: ${mapTileType}, z=${zoomLevel}, x=${tileCoordObj.x}, y=${tileCoordObj.y}`,
                  )
                : null;
            } else {
              throw error;
            }
          }
        }
        let connectionTimeResult = process.hrtime(connectionTimer);
        subProgressBar === null
          ? logger.trace(
              `Chunk completed: #${chunkArray[0].threadId}, ${chunkArray.length} files, ${(connectionTimeResult[0] * 1e9 + connectionTimeResult[1]) / 1e6} ms`,
            )
          : null;
        resolve(tempRspArray);
      }),
    );
  });
  const chunkResultArray = (await Promise.all(chunkPromises)).flat().sort((a, b) => {
    if (a.x === b.x) {
      return a.y - b.y;
    }
    return a.x - b.x;
  });
  progressBar !== null ? progressBar.stop() : null;
  argvUtils.getArgv().benchmark === false
    ? await (async () => {
        const tarBufRsp = await tarballUtils.createTarFile(
          chunkResultArray.map((obj) => ({
            path: `${obj.x}/${obj.y}.png`,
            data: obj.data,
            modifiedTime: DateTime.fromHTTP(obj.rspHeader['last-modified']).toJSDate(),
          })),
        );
        await writerUtils.writeZstdData(
          tarBufRsp,
          path.join(
            argvUtils.getArgv().outputDir,
            'jma',
            mapTileType,
            dtobj.toFormat('yyyyMMdd'),
            `${dtobj.toFormat('yyyyMMdd_HHmmss')}_z${('0' + zoomLevel).slice(-2)}.tar.zst`,
          ),
          16,
        );
      })()
    : null;
}

export default {
  batchDownload,
  singleTimeDL,
};
