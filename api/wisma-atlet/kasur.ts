import { NowResponse } from "@vercel/node";

import { fetchKasur } from "../../util/fetcher";

export default async (_, response: NowResponse) => {
  response.json({
    data: await fetchKasur()
  });
};
