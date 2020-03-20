import { NowResponse } from "@now/node";
import { fetchFeatures } from "../../util/data";
import { where, createArrayQuery } from "../../util/query";

export default async (_, response: NowResponse) => {
  response.json({
    data: await fetchFeatures(
      `https://services8.arcgis.com/mpSDBlkEzjS62WgX/arcgis/rest/services/Kasus_COVID19_Indonesia_gsheet/FeatureServer/0/query`,
      createArrayQuery({
        where: where.indo,
        orderByFields: "Positif asc"
      })
    )
  });
};
