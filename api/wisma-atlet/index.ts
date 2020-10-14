import { NowResponse } from "@vercel/node";

import { fetchWismaAtlet } from "../../util/fetcher";

export default async (_, response: NowResponse) => {
  response.json({
    data: await fetchWismaAtlet()
  });
};
