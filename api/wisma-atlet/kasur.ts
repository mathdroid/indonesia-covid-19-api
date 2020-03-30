import unfetch from "isomorphic-unfetch";
import withRetry from "@zeit/fetch-retry";
import { NowResponse } from "@now/node";

const fetch = withRetry(unfetch);

export const fetchKasur = async () => {
  return await fetch("https://u071.zicare.id/house/getBedStatus", {
    method: "POST",
    headers: {
      "x-requested-with": "XMLHttpRequest"
    },
    body: JSON.stringify({
      jns_rr: ["RU", "RA", "ICU", "HCU"]
    })
  }).then(res => res.json());
};

export default async (_, response: NowResponse) => {
  response.json({
    // warning: `The data source for this endpoint is no longer being maintained. See https://twitter.com/salmayarista/status/1240959718580826113`,
    data: await fetchKasur()
  });
};
