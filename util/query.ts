// (Tanggal>=timestamp '2020-03-20 17:00:00' AND Tanggal<=timestamp '2020-03-21 16:59:59' OR Tanggal>=timestamp '2020-03-19 17:00:00' AND Tanggal<=timestamp '2020-03-20 16:59:59')

const addDays = (date: Date, days: number) =>
  new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
const getISODate = (date: Date) => date.toISOString().split("T")[0];

const tomorrow = new Date();

const today = addDays(tomorrow, -1);
const yesterday = addDays(tomorrow, -2);

const toDate = getISODate(today);
const yesterDate = getISODate(yesterday);
const tomDate = getISODate(tomorrow);

export const where = {
  confirmed: `(Confirmed > 0)`,
  deaths: `(Confirmed > 0) AND (Deaths > 0)`,
  recovered: `(Confirmed > 0) AND (Recovered <> 0)`,
  all: `1=1`,
  indo: `(Provinsi = 'Indonesia') OR (Provinsi <> 'Indonesia')`,
  currentDay: `(Tanggal>=timestamp '${toDate} 17:00:00' AND Tanggal<=timestamp '${tomDate} 16:59:59' OR Tanggal>=timestamp '${yesterDate} 17:00:00' AND Tanggal<=timestamp '${toDate} 16:59:59')`,
  beforeToday: `Tanggal<timestamp '${toDate} 17:00:00'`
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
