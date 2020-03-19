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
    confirmed: {
      value: confirmed,
      detail: "https://indonesia-covid-19.mathdro.id/api/kasus"
    },
    recovered: {
      value: recovered,
      detail: "https://indonesia-covid-19.mathdro.id/api/kasus"
    },
    deaths: {
      value: deaths,
      detail: "https://indonesia-covid-19.mathdro.id/api/kasus"
    },
    active: {
      value: active,
      detail: "https://indonesia-covid-19.mathdro.id/api/kasus"
    }
  });
};
