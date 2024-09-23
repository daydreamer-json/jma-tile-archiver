import fs from 'fs';

type Freeze<T> = Readonly<{
  [P in keyof T]: T[P] extends object ? Freeze<T[P]> : T[P];
}>;
type AllRequired<T> = Required<{
  [P in keyof T]: T[P] extends object ? Freeze<T[P]> : T[P];
}>;

type ConfigType = AllRequired<
  Freeze<{
    file: {
      outputDir: string;
    };
    mapTile: {
      fetchPolygonCoord: {
        tl: {
          lon: number;
          lat: number;
        };
        tr: {
          lon: number;
          lat: number;
        };
        bl: {
          lon: number;
          lat: number;
        };
        br: {
          lon: number;
          lat: number;
        };
      };
    };
    network: {
      api: {
        baseDomain: string;
        apiPath: string;
        refererUrl: string;
      };
      mapTileApi: {
        baseDomain: string;
        apiPath: string;
        refererUrl: string;
      };
      jmaApi: {
        baseDomain: string;
        apiPath: string;
        refererUrl: string;
      };
      userAgent: {
        chromeWindows: string;
        curl: string;
        curlUnity: string;
        ios: string;
      };
      timeout: number;
      threadCount: number;
      reqWait: {
        min: number;
        max: number;
      };
      adapterName: string;
    };
    logger: {
      logLevel: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
      progressBarConfig: {
        barCompleteChar: string;
        barIncompleteChar: string;
        hideCursor: boolean;
        barsize: number;
        fps: number;
        clearOnComplete: boolean;
      };
    };
  }>
>;

const config: ConfigType = JSON.parse(await fs.promises.readFile('config/config.json', 'utf-8'));

export default config;
