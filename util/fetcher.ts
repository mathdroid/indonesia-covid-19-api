import unfetch from "isomorphic-unfetch";
import withRetry from "@zeit/fetch-retry";

const fetch = withRetry(unfetch);

import { fetchFeatures, extractSingleValue } from "./data";
import { createArrayQuery, where } from "./query";
import { endpoints } from "./endpoints";
import { addDays } from "./date";

export const fetchDaily = (date = new Date()) => {
  const query = {
    f: "json",
    where: where.beforeToday(date),
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

export const fetchMeninggal = async (date = new Date()) => {
  const query = {
    f: "json",
    returnGeometry: false,
    spatialRel: `esriSpatialRelIntersects`,
    outFields: `*`,
    cacheHint: true,

    where: where.currentDay(date),
    outStatistics: `[{statisticType: "sum",onStatisticField: "Jumlah_Pasien_Meninggal",outStatisticFieldName: "value"}]`
  };
  const result = extractSingleValue(
    await fetchFeatures(endpoints.statistikPerkembangan, query)
  );

  return result > 0 ? result : fetchMeninggal(addDays(date, -1));
};

export const fetchSembuh = async (date = new Date()) => {
  const query = {
    f: "json",
    returnGeometry: false,
    spatialRel: `esriSpatialRelIntersects`,
    outFields: `*`,
    cacheHint: true,

    where: where.currentDay(date),
    outStatistics: `[{statisticType: "sum",onStatisticField: "Jumlah_Pasien_Sembuh",outStatisticFieldName: "value"}]`
  };
  const result = extractSingleValue(
    await fetchFeatures(endpoints.statistikPerkembangan, query)
  );

  return result > 0 ? result : fetchSembuh(addDays(date, -1));
};

export const fetchDalamPerawatan = async (date = new Date()) => {
  const query = {
    f: "json",
    returnGeometry: false,
    spatialRel: `esriSpatialRelIntersects`,
    outFields: `*`,
    cacheHint: true,

    where: where.currentDay(date),
    outStatistics: `[{statisticType: "sum",onStatisticField: "Jumlah_pasien_dalam_perawatan",outStatisticFieldName: "value"}]`
  };
  const result = extractSingleValue(
    await fetchFeatures(endpoints.statistikPerkembangan, query)
  );

  return result > 0 ? result : fetchDalamPerawatan(addDays(date, -1));
};

export const fetchJumlahKasus = async (date = new Date()) => {
  const query = {
    f: "json",
    returnGeometry: false,
    spatialRel: `esriSpatialRelIntersects`,
    outFields: `*`,
    cacheHint: true,

    where: where.currentDay(date),
    outStatistics: `[{statisticType: "sum",onStatisticField: "Jumlah_Kasus_Kumulatif",outStatisticFieldName: "value"}]`
  };
  const result = extractSingleValue(
    await fetchFeatures(endpoints.statistikPerkembangan, query)
  );

  return result > 0 ? result : fetchJumlahKasus(addDays(date, -1));
};

export const fetchProvinsiData = async (orderByFields = "Kasus_Posi desc") => {
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
