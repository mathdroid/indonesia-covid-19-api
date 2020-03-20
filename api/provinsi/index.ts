import { NowResponse } from "@now/node";
import {
  fetchFeatures,
  attributeSpreader,
  normalizeKeys
} from "../../util/data";
import { endpoints } from "../../util/endpoints";
import { createArrayQuery, where } from "../../util/query";

const getProvinsiData = async (
  orderByFields = "Kasus_Terkonfirmasi_Kumulatif desc"
) => {
  const features = await fetchFeatures(
    endpoints.perProvinsi,
    createArrayQuery({
      where: where.all,
      orderByFields
    })
  );

  const data = features.map(attributeSpreader).map(normalizeKeys);

  return data;
};

export default async (_, response: NowResponse) => {
  response.json({
    data: await getProvinsiData()
  });
};
