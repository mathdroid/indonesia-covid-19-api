import { NowResponse } from "@now/node";

import { fetchProvinsiData } from "../../util/fetcher";

export default async (_, response: NowResponse) => {
  response.json({
    data: await fetchProvinsiData()
  });
};
