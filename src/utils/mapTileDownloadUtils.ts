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
import { AxiosResponseHeaders } from 'axios';

async function bgTileDownload(zoomLevel: number, mapTileTypeKey: 'std' | 'pale' | 'blank' | 'seamlessphoto') {
  const gsiTileFileExtension = (() => {
    if (mapTileTypeKey === 'seamlessphoto') {
      return 'jpg';
    } else {
      return 'png';
    }
  })();
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
      // let builtUrl =
      //   'https://' +
      //   appConfig.network.mapTileApi.baseDomain +
      //   appConfig.network.mapTileApi.apiPath +
      //   `/${mapTileTypeKey}` +
      //   `/${zoomLevel}` +
      //   `/${i}` +
      //   `/${j}` +
      //   `.${gsiTileFileExtension}`;
      needDlTileList.push({ threadId: tmp_threadId, x: i, y: j });
      tmp_threadId === argvUtils.getArgv().thread - 1 ? (tmp_threadId = 0) : (tmp_threadId += 1);
    }
  }
  let needDlTileListChunked = new Array();
  Array.from(new Set(needDlTileList.map((obj) => obj.threadId))).forEach((threadId) => {
    needDlTileListChunked.push(needDlTileList.filter((obj) => obj.threadId === threadId));
  });

  logger.info(`Base map tile downloading: ${mapTileTypeKey}, z=${zoomLevel} ...`);
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
          let builtUrl =
            'https://' +
            appConfig.network.mapTileApi.baseDomain +
            appConfig.network.mapTileApi.apiPath +
            `/${mapTileTypeKey}` +
            `/${zoomLevel}` +
            `/${tileCoordObj.x}` +
            `/${tileCoordObj.y}` +
            `.${gsiTileFileExtension}`;
          try {
            tempRspArray.push({
              threadId: tileCoordObj.threadId,
              x: tileCoordObj.x,
              y: tileCoordObj.y,
              data: await apiConnect.apiConnectBinary(builtUrl, {}, {}),
              rspHeader: await apiConnect.apiHeadConnect(builtUrl, {}, {}),
            });
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
                    `Tile not found. Skipped: ${mapTileTypeKey}, z=${zoomLevel}, x=${tileCoordObj.x}, y=${tileCoordObj.y}`,
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
  logger.info(`Base map tile download completed: ${mapTileTypeKey}, z=${zoomLevel}`);
  argvUtils.getArgv().benchmark === false
    ? await (async () => {
        const tarBufRsp = await tarballUtils.createTarFile(
          path.join(argvUtils.getArgv().outputDir, 'gsi', `${mapTileTypeKey}.tar`),
          chunkResultArray.map((obj) => ({
            path: `${obj.x}/${obj.y}.${gsiTileFileExtension}`,
            data: obj.data,
            modifiedTime: DateTime.fromHTTP(obj.rspHeader['last-modified']).toJSDate(),
          })),
        );
        await writerUtils.writeZstdData(
          tarBufRsp,
          path.join(argvUtils.getArgv().outputDir, 'gsi', `${mapTileTypeKey}_z${('0' + zoomLevel).slice(-2)}.tar.zst`),
          16,
        );
      })()
    : null;
}

export default {
  bgTileDownload,
};
