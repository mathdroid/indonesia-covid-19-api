import { fetchFeatures } from "./data";

export const fetchDaily = () => {
  const endpoint = `https://services5.arcgis.com/VS6HdKS0VfIhv8Ct/arcgis/rest/services/Statistik_Perkembangan_COVID19_Indonesia/FeatureServer/0/query`;

  const query = {
    f: "json",
    where: `Tanggal<timestamp '2020-03-20 17:00:00'`,
    returnGeometry: false,
    spatialRel: `esriSpatialRelIntersects`,
    outFields: `*`,
    orderByFields: `Tanggal asc`,
    resultOffset: `0`,
    resultRecordCount: `2000`,
    cacheHint: true
  };
  return fetchFeatures(endpoint, query);
};

export const fetchMeninggal = () => {
  const endpoint = `https://services5.arcgis.com/VS6HdKS0VfIhv8Ct/arcgis/rest/services/Statistik_Perkembangan_COVID19_Indonesia/FeatureServer/0/query`;

  const query = {
    f: "json",
    returnGeometry: false,
    spatialRel: `esriSpatialRelIntersects`,
    outFields: `*`,
    cacheHint: true,

    where: `Tanggal>=timestamp '2020-03-18 17:00:00' AND Tanggal<=timestamp '2020-03-19 16:59:59'`,
    outStatistics: `[{statisticType: "sum",onStatisticField: "Jumlah_Pasien_Meninggal",outStatisticFieldName: "value"}]`
  };
  return fetchFeatures(endpoint, query);
};

export const fetchSembuh = () => {
  const endpoint = `https://services5.arcgis.com/VS6HdKS0VfIhv8Ct/arcgis/rest/services/Statistik_Perkembangan_COVID19_Indonesia/FeatureServer/0/query`;

  const query = {
    f: "json",
    returnGeometry: false,
    spatialRel: `esriSpatialRelIntersects`,
    outFields: `*`,
    cacheHint: true,

    where: `Tanggal>=timestamp '2020-03-18 17:00:00' AND Tanggal<=timestamp '2020-03-19 16:59:59'`,
    outStatistics: `[{statisticType: "sum",onStatisticField: "Jumlah_Pasien_Sembuh",outStatisticFieldName: "value"}]`
  };
  return fetchFeatures(endpoint, query);
};

export const fetchDalamPerawatan = () => {
  const endpoint = `https://services5.arcgis.com/VS6HdKS0VfIhv8Ct/arcgis/rest/services/Statistik_Perkembangan_COVID19_Indonesia/FeatureServer/0/query`;

  const query = {
    f: "json",
    returnGeometry: false,
    spatialRel: `esriSpatialRelIntersects`,
    outFields: `*`,
    cacheHint: true,

    where: `Tanggal>=timestamp '2020-03-18 17:00:00' AND Tanggal<=timestamp '2020-03-19 16:59:59'`,
    outStatistics: `[{statisticType: "sum",onStatisticField: "Jumlah_pasien_dalam_perawatan",outStatisticFieldName: "value"}]`
  };
  return fetchFeatures(endpoint, query);
};

export const fetchJumlahKasus = () => {
  const endpoint = `https://services5.arcgis.com/VS6HdKS0VfIhv8Ct/arcgis/rest/services/Statistik_Perkembangan_COVID19_Indonesia/FeatureServer/0/query`;

  const query = {
    f: "json",
    returnGeometry: false,
    spatialRel: `esriSpatialRelIntersects`,
    outFields: `*`,
    cacheHint: true,

    where: `Tanggal>=timestamp '2020-03-18 17:00:00' AND Tanggal<=timestamp '2020-03-19 16:59:59'`,
    outStatistics: `[{statisticType: "sum",onStatisticField: "Jumlah_Kasus_Kumulatif",outStatisticFieldName: "value"}]`
  };
  return fetchFeatures(endpoint, query);
};
