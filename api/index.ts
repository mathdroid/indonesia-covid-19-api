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

    perKasus: "https://indonesia-covid-19.mathdro.id/api/kasus",

    perProvinsi: "https://indonesia-covid-19.mathdro.id/api/provinsi",
    perHari: "https://indonesia-covid-19.mathdro.id/api/harian"
  });
};
