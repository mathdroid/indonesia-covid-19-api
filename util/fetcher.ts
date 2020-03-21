import unfetch from "isomorphic-unfetch";
import withRetry from "@zeit/fetch-retry";

const fetch = withRetry(unfetch);

import { fetchFeatures, extractSingleValue } from "./data";
import { createArrayQuery, where } from "./query";
import { endpoints } from "./endpoints";

// const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
// const yesterday = addDays(today, -1)

// const yesterDate = yesterday.toISOString().split('T')[0]

export const fetchDaily = () => {
  const query = {
    f: "json",
    where: where.beforeToday,
    returnGeometry: false,
    spatialRel: `esriSpatialRelIntersects`,
    outFields: `*`,
    orderByFields: `Tanggal asc`,
    resultOffset: `0`,
    resultRecordCount: `2000`,
    cacheHint: true
  };
  return fetchFeatures(endpoints.statistikPerkembangan, query);
};

export const fetchMeninggal = async () => {
  const query = {
    f: "json",
    returnGeometry: false,
    spatialRel: `esriSpatialRelIntersects`,
    outFields: `*`,
    cacheHint: true,

    where: where.currentDay,
    outStatistics: `[{statisticType: "sum",onStatisticField: "Jumlah_Pasien_Meninggal",outStatisticFieldName: "value"}]`
  };
  return extractSingleValue(
    await fetchFeatures(endpoints.statistikPerkembangan, query)
  );
};

export const fetchSembuh = async () => {
  const query = {
    f: "json",
    returnGeometry: false,
    spatialRel: `esriSpatialRelIntersects`,
    outFields: `*`,
    cacheHint: true,

    where: where.currentDay,
    outStatistics: `[{statisticType: "sum",onStatisticField: "Jumlah_Pasien_Sembuh",outStatisticFieldName: "value"}]`
  };
  return extractSingleValue(
    await fetchFeatures(endpoints.statistikPerkembangan, query)
  );
};

export const fetchDalamPerawatan = async () => {
  const query = {
    f: "json",
    returnGeometry: false,
    spatialRel: `esriSpatialRelIntersects`,
    outFields: `*`,
    cacheHint: true,

    where: where.currentDay,
    outStatistics: `[{statisticType: "sum",onStatisticField: "Jumlah_pasien_dalam_perawatan",outStatisticFieldName: "value"}]`
  };
  return extractSingleValue(
    await fetchFeatures(endpoints.statistikPerkembangan, query)
  );
};

export const fetchJumlahKasus = async () => {
  const query = {
    f: "json",
    returnGeometry: false,
    spatialRel: `esriSpatialRelIntersects`,
    outFields: `*`,
    cacheHint: true,

    where: where.currentDay,
    outStatistics: `[{statisticType: "sum",onStatisticField: "Jumlah_Kasus_Kumulatif",outStatisticFieldName: "value"}]`
  };
  return extractSingleValue(
    await fetchFeatures(endpoints.statistikPerkembangan, query)
  );
};

export const fetchProvinsiData = async (
  orderByFields = "Kasus_Terkonfirmasi_Akumulatif desc"
) => {
  return fetchFeatures(
    endpoints.perProvinsi,
    createArrayQuery({
      where: where.all,
      orderByFields
    })
  );
};

export const fetchAllKasus = async () =>
  fetchFeatures(
    endpoints.kasusCOVIDGsheet,
    createArrayQuery({
      where: where.all,
      orderByFields: "Positif asc"
    })
  );

export const fetchCaseGraph = async () =>
  fetch(`http://covid-monitoring2.kemkes.go.id/`).then(res => res.json());
