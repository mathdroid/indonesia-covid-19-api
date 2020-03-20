import { NowResponse } from "@now/node";

import {
  getTotalConfirmed,
  getTotalRecovered,
  getTotalDeaths,
  getTotalActive
} from "../util/api";

export default async (_, response: NowResponse) => {
  const [confirmed, recovered, deaths, active] = await Promise.all([
    getTotalConfirmed(),
    getTotalRecovered(),
    getTotalDeaths(),
    getTotalActive()
  ]);

  response.json({
    confirmed: confirmed,
    recovered: recovered,
    deaths: deaths,
    active: active,

    perKasus: "https://indonesia-covid-19.mathdro.id/api/kasus",

    perProvinsi: "https://indonesia-covid-19.mathdro.id/api/provinsi"
  });
};
