import {
  extractSingleValue,
  fetchFeatures,
  attributeSpreader,
  normalizeKeys
} from "./data";

import { endpoints } from "./endpoints";
import {
  queryTotalDeaths,
  queryTotalConfirmed,
  queryTotalRecovered,
  queryLastUpdate,
  queryCasesTimeSeries,
  querySumMeninggal,
  querySumTerkonfirmasi,
  querySumSembuh,
  querySumDalamPerawatan,
  queryKasus
} from "./query";
import { getCountryName } from "./countries";

export const getTotalConfirmed = async () => {
  return extractSingleValue(
    await fetchFeatures(endpoints.perProvinsi, querySumTerkonfirmasi())
  );
};

export const getTotalRecovered = async (countryName?: string) => {
  return extractSingleValue(
    await fetchFeatures(endpoints.kasus, querySumSembuh())
  );
};

export const getTotalDeaths = async (countryName?: string) => {
  return extractSingleValue(
    await fetchFeatures(endpoints.kasus, querySumMeninggal())
  );
};

export const getTotalActive = async (countryName?: string) => {
  return extractSingleValue(
    await fetchFeatures(endpoints.kasus, querySumDalamPerawatan())
  );
};

export const getLastUpdate = async (countryName?: string) => {
  const f = await fetchFeatures(
    endpoints.cases,
    queryLastUpdate(getCountryName(countryName))
  );
  const feature = f
    ? f.map(attributeSpreader).map(normalizeKeys)[0]
    : { lastUpdate: new Date() };
  return new Date(feature.lastUpdate).toISOString();
};

export const getDailyCases = async () =>
  (await fetchFeatures(endpoints.casesTime, queryCasesTimeSeries()))
    .map(attributeSpreader)
    .map(normalizeKeys);

export const getAllKasus = async () =>
  (await fetchFeatures(endpoints.kasus, queryKasus()))
    .map(attributeSpreader)
    .map(normalizeKeys);
