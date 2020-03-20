import { NowResponse } from "@now/node";
import ObjectsToCsv from "objects-to-csv";

import { fetchProvinsiData } from "../util/fetcher";

export default async (_, response: NowResponse) => {
  const data = await fetchProvinsiData();
  const csv = new ObjectsToCsv(data);
  const csvString = await csv.toString();
  response.setHeader("Content-Type", "text/csv");
  response.send(csvString);
};
