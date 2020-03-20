import { NowResponse } from "@now/node";

import { fetchAllKasus } from "../../util/fetcher";

export default async (_, response: NowResponse) => {
  response.json({
    data: fetchAllKasus()
  });
};
