import { NowResponse } from "@now/node";
import { getAllKasus } from "../util/api";

export default async (_, response: NowResponse) => {
  response.json(await getAllKasus());
};
