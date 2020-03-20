import { NowResponse } from "@now/node";
import { fetchDaily } from "../util/fetcher";

export default async (_, response: NowResponse) => {
  response.json({
    data: await fetchDaily()
  });
};
