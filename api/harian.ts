import { NowResponse } from "@now/node";
import { fetchDaily } from "../util/fetcher";
import { addDays } from "../util/date";

export default async (_, response: NowResponse) => {
  response.json({
    data: await fetchDaily()
  });
};
