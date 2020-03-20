import { NowResponse } from "@now/node";
import ObjectsToCsv from "objects-to-csv";

import { fetchAllKasus } from "../../util/fetcher";

export default async (_, response: NowResponse) => {
  const data = await fetchAllKasus();
  const csv = new ObjectsToCsv(data);
  const csvString = await csv.toString();
  response.setHeader("Content-Type", "text/csv");
  response.send(csvString);
};
