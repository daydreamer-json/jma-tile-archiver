/**
 * 緯度経度を元にピクセル座標・世界座標・タイル座標・タイル内のピクセル座標を返す
 * 参照元: https://www.trail-note.net/tech/coordinate/
 * @param {number} lon 経度
 * @param {number} lat 緯度
 * @param {number} zoomLevel マップタイルのズームレベル
 */
function lonLatToCoord(lon: number, lat: number, zoomLevel: number) {
  return {
    pixelCoord: {
      x: 2 ** (zoomLevel + 7) * (lon / 180 + 1),
      y:
        (2 ** (zoomLevel + 7) / Math.PI) *
        (-Math.atanh(Math.sin((Math.PI / 180) * lat)) +
          Math.atanh(Math.sin((Math.PI / 180) * ((180 / Math.PI) * Math.asin(Math.tanh(Math.PI)))))),
    },
    worldCoord: {
      x: (2 ** (zoomLevel + 7) * (lon / 180 + 1)) / 2 ** zoomLevel,
      y:
        ((2 ** (zoomLevel + 7) / Math.PI) *
          (-Math.atanh(Math.sin((Math.PI / 180) * lat)) +
            Math.atanh(Math.sin((Math.PI / 180) * ((180 / Math.PI) * Math.asin(Math.tanh(Math.PI))))))) /
        2 ** zoomLevel,
    },
    tileCoord: {
      x: Math.floor(Math.floor(2 ** (zoomLevel + 7) * (lon / 180 + 1)) / 256),
      y: Math.floor(
        Math.floor(
          (2 ** (zoomLevel + 7) / Math.PI) *
            (-Math.atanh(Math.sin((Math.PI / 180) * lat)) +
              Math.atanh(Math.sin((Math.PI / 180) * ((180 / Math.PI) * Math.asin(Math.tanh(Math.PI)))))),
        ) / 256,
      ),
    },
    tilePixelCoord: {
      x: Math.floor(2 ** (zoomLevel + 7) * (lon / 180 + 1)) % 256,
      y:
        Math.floor(
          (2 ** (zoomLevel + 7) / Math.PI) *
            (-Math.atanh(Math.sin((Math.PI / 180) * lat)) +
              Math.atanh(Math.sin((Math.PI / 180) * ((180 / Math.PI) * Math.asin(Math.tanh(Math.PI)))))),
        ) % 256,
    },
  };
}

/**
 * ピクセル座標とズームレベルを元に緯度経度を返す
 * 単純に逆関数(単純とは言っていない)
 * @param {number} x ピクセルx座標
 * @param {number} y ピクセルy座標
 * @param {number} zoomLevel マップタイルのズームレベル
 */
function pixelCoordToLonLat(x: number, y: number, zoomLevel: number) {
  return {
    lon: 180 * (x / 2 ** (zoomLevel + 7) - 1),
    lat:
      (180 / Math.PI) *
      Math.asin(
        Math.tanh(
          (-Math.PI / 2 ** (zoomLevel + 7)) * y +
            Math.atanh(Math.sin((Math.PI / 180) * ((180 / Math.PI) * Math.asin(Math.tanh(Math.PI))))),
        ),
      ),
  };
}

export default {
  lonLatToCoord,
  pixelCoordToLonLat,
};
