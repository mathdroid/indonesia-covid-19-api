import { NowResponse } from "@now/node";

import { fetchKasur } from "../../util/fetcher";

export default async (_, response: NowResponse) => {
  response.json({
    data: await fetchKasur()
  });
};
