import { NowResponse } from "@now/node";
import ObjectsToCsv from "objects-to-csv";
import { fetch } from "../../../util/fetcher";

export default async (_req, res: NowResponse) => {
  const raw = await fetch(
    `https://pertamananpemakaman.jakarta.go.id/v813/t1p1/csv-data25.csv/YXNzZXRzL2RhdGEvY3N2LXBlbWFrYW1hbi8-`
  ).then(res => res.json());
  const data = raw
    .map(({ Ym, q }) => ({
      month: Ym,
      amount: q
    }))
    .sort((a, b) => (a.month < b.month ? -1 : 1));

  const csv = new ObjectsToCsv(data);
  const csvString = await csv.toString();
  res.setHeader("Content-Type", "text/csv");
  res.send(csvString);
};
