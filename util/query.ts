export const where = {
  confirmed: `(Confirmed > 0)`,
  deaths: `(Confirmed > 0) AND (Deaths > 0)`,
  recovered: `(Confirmed > 0) AND (Recovered <> 0)`,
  all: `1=1`,
  indo: `(Provinsi = 'Indonesia') OR (Provinsi <> 'Indonesia')`
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
