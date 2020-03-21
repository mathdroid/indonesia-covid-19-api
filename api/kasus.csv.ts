import { NowResponse } from "@now/node";
import ObjectsToCsv from "objects-to-csv";

import { fetchCaseGraph } from "../util/fetcher";

export default async (_, response: NowResponse) => {
  const { nodes } = await fetchCaseGraph();
  const csv = new ObjectsToCsv(nodes);
  const csvString = await csv.toString();
  response.setHeader("Content-Type", "text/csv");
  response.send(csvString);
};
