import { NowResponse } from "@vercel/node";

import { fetchWismaAtletRuangan } from "../../util/fetcher";

export default async (_, response: NowResponse) => {
  response.json({
    data: await fetchWismaAtletRuangan()
  });
};
