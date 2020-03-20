import unfetch from "isomorphic-unfetch";
import qs from "qs";
import withRetry from "@zeit/fetch-retry";

const fetch = withRetry(unfetch);

export const attributeSpreader = ({ attributes }) => ({
  ...attributes
});

const sanitizeToPascal = (str: string) =>
  str.replace("/", "_").replace(" ", "_");

const pascalSnakeToCamel = (str: string) => {
  const [first, ...rest] = sanitizeToPascal(str).split("_");
  return `${first.toLowerCase()}${rest.join("")}`;
};

const idKeyFilter = ([key, _]) => key !== "OBJECTID";

export const normalizeKeys = object => {
  return Object.entries(object)
    .filter(idKeyFilter)
    .reduce((previous, [currentKey, currentValue]) => {
      return {
        ...previous,
        [pascalSnakeToCamel(currentKey)]: currentValue
      };
    }, {});
};

export const extractSingleValue = features =>
  (features && features[0] && features[0].value) || 0;

const isEmpty = obj => {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
};

export const sanitizeResponse = (data: any[]) =>
  data.map(attributeSpreader).map(normalizeKeys);

export const fetchFeatures = async (url, query = {}) => {
  console.log(query);
  const endpoint = `${url}${isEmpty(query) ? "" : `?${qs.stringify(query)}`}`;
  const response = await fetch(endpoint);
  const { features } = await response.json();
  console.log({ url, query: qs.parse(endpoint), endpoint });

  console.log(features);
  if (!Array.isArray(features))
    throw new Error(`Upstream error: ${endpoint} unreachable.`);
  return sanitizeResponse(features);
};
