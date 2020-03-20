import { NowResponse } from "@now/node";
import ObjectsToCsv from "objects-to-csv";

import { fetchDaily } from "../util/fetcher";

export default async (_, response: NowResponse) => {
  const data = await fetchDaily();
  const csv = new ObjectsToCsv(data);
  const csvString = await csv.toString();
  response.setHeader("Content-Type", "text/csv");
  response.send(csvString);
};
