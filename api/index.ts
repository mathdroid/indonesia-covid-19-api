import { NowResponse } from "@now/node";

import {
  fetchMeninggal,
  fetchSembuh,
  fetchDalamPerawatan,
  fetchJumlahKasus
} from "../util/fetcher";

export default async (_, response: NowResponse) => {
  const [meninggal, sembuh, perawatan, jumlahKasus] = await Promise.all([
    fetchMeninggal(),
    fetchSembuh(),
    fetchDalamPerawatan(),
    fetchJumlahKasus()
  ]);

  response.json({
    meninggal,
    sembuh,
    perawatan,
    jumlahKasus,

    perKasus: {
      json: "https://indonesia-covid-19.mathdro.id/api/kasus",
      csv: "https://indonesia-covid-19.mathdro.id/api/kasus.csv"
    },
    perProvinsi: {
      json: "https://indonesia-covid-19.mathdro.id/api/provinsi",
      csv: "https://indonesia-covid-19.mathdro.id/api/provinsi.csv"
    },
    perHari: {
      json: "https://indonesia-covid-19.mathdro.id/api/harian",
      csv: "https://indonesia-covid-19.mathdro.id/api/harian.csv"
    }
  });
};
