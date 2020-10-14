// (Tanggal>=timestamp '2020-03-20 17:00:00' AND Tanggal<=timestamp '2020-03-21 16:59:59' OR Tanggal>=timestamp '2020-03-19 17:00:00' AND Tanggal<=timestamp '2020-03-20 16:59:59')

import { addDays, getISODate } from "./date";

export const where = {
  confirmed: `(Confirmed > 0)`,
  deaths: `(Confirmed > 0) AND (Deaths > 0)`,
  recovered: `(Confirmed > 0) AND (Recovered <> 0)`,
  all: `1=1`,
  indo: `(Provinsi = 'Indonesia') OR (Provinsi <> 'Indonesia')`,
  currentDay: (date: Date) =>
    `(Tanggal>=timestamp '${getISODate(
      date
    )} 17:00:00' AND Tanggal<=timestamp '${getISODate(
      addDays(date, 1)
    )} 16:59:59' OR Tanggal>=timestamp '${getISODate(
      addDays(date, -1)
    )} 17:00:00' AND Tanggal<=timestamp '${getISODate(date)} 16:59:59')`,
  beforeToday: (date: Date) =>
    `Tanggal<timestamp '${getISODate(date)} 17:00:00'`,
  lastUpdate: () => `Jumlah_Kasus_Kumulatif IS NOT NULL AND Jumlah_Pasien_Sembuh IS NOT NULL AND Jumlah_Pasien_Meninggal IS NOT NULL`
};

export const createQuery = ({ where }) => ({
  f: "json",
  outFields: "*",
  returnGeometry: false,
  where
});

export const withCountryRegion = (where: string, countryRegion?: string) =>
  countryRegion ? `${where} AND (Country_Region='${countryRegion}')` : where;

export const createArrayQuery = ({ where, orderByFields }) => ({
  ...createQuery({ where }),
  orderByFields,
  resultRecordCount: 2000
});

export const createOutStatistics = (field: string) =>
  `[{"statisticType":"sum","onStatisticField":"${field}","outStatisticFieldName":"value"}]`;

export const createTotalQuery = ({ where, field }) => ({
  ...createQuery({ where }),
  outStatistics: createOutStatistics(field)
});
