import unfetch from "isomorphic-unfetch";
import withRetry from "@zeit/fetch-retry";
import qs from "qs";

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

export const fetchFeatures = async (url: string, query = {}) => {
  const endpoint = `${url}${isEmpty(query) ? "" : `?${qs.stringify(query)}`}`;
  console.log({ url, query: qs.parse(endpoint), endpoint });
  const response = await fetch(endpoint);

  const json = await response.json();
  const { features } = json;
  if (!Array.isArray(features))
    throw new Error(`Upstream error: ${endpoint} unreachable.`);
  return sanitizeResponse(features);
};
