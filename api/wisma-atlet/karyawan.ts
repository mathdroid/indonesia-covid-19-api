import { NowResponse } from "@vercel/node";

import { fetchWismaAtletKaryawan } from "../../util/fetcher";

export default async (_, response: NowResponse) => {
  response.json({
    data: await fetchWismaAtletKaryawan()
  });
};
