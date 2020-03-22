import { NowResponse, NowRequest } from "@now/node";
import { getHtml } from "../../util/template";
import { writeTempFile, pathToFileURL } from "../../util/file";
import { getScreenshot } from "../../util/chromium";
import { fetchCaseGraph } from "../../util/fetcher";

const isDev = process.env.NOW_REGION === "dev1";

const isDead = node => node.status === "Meninggal";
const isRecovered = node => node.status === "Sembuh";
const isMale = node => node.genderid === 1 || node.genderxid === 1;
const isBaby = node => node.umur <= 5;
const isYoung = node => !isBaby(node) && node.umur <= 20;
const isAdultBelow50 = node => !isYoung(node) && node.umur <= 50;

const getVariant = (node, isMonochrome) =>
  isMonochrome ? 0 : ((node.kasus * node.umur) % 5) + 1;

const emojis = {
  recovered: {
    male: {
      0: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/man-gesturing-ok_1f646-200d-2642-fe0f.png`,
      1: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/man-gesturing-ok-type-1-2_1f646-1f3fb-200d-2642-fe0f.png`,
      2: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/man-gesturing-ok-type-3_1f646-1f3fc-200d-2642-fe0f.png`,
      3: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/man-gesturing-ok-type-4_1f646-1f3fd-200d-2642-fe0f.png`,
      4: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/man-gesturing-ok-type-5_1f646-1f3fe-200d-2642-fe0f.png`,
      5: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/man-gesturing-ok-type-6_1f646-1f3ff-200d-2642-fe0f.png`
    },
    female: {
      0: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/woman-gesturing-ok_1f646-200d-2640-fe0f.png`,
      1: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/woman-gesturing-ok-type-1-2_1f646-1f3fb-200d-2640-fe0f.png`,
      2: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/woman-gesturing-ok-type-3_1f646-1f3fc-200d-2640-fe0f.png`,
      3: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/woman-gesturing-ok-type-4_1f646-1f3fd-200d-2640-fe0f.png`,
      4: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/woman-gesturing-ok-type-5_1f646-1f3fe-200d-2640-fe0f.png`,
      5: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/woman-gesturing-ok-type-6_1f646-1f3ff-200d-2640-fe0f.png`
    }
  },
  baby: {
    0: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/baby_1f476.png`,
    1: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/baby_emoji-modifier-fitzpatrick-type-1-2_1f476-1f3fb_1f3fb.png`,
    2: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/baby_emoji-modifier-fitzpatrick-type-3_1f476-1f3fc_1f3fc.png`,
    3: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/baby_emoji-modifier-fitzpatrick-type-4_1f476-1f3fd_1f3fd.png`,
    4: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/baby_emoji-modifier-fitzpatrick-type-5_1f476-1f3fe_1f3fe.png`,
    5: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/baby_emoji-modifier-fitzpatrick-type-6_1f476-1f3ff_1f3ff.png`
  },
  boy: {
    0: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/boy_1f466.png`,
    1: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/boy_emoji-modifier-fitzpatrick-type-1-2_1f466-1f3fb_1f3fb.png`,
    2: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/boy_emoji-modifier-fitzpatrick-type-3_1f466-1f3fc_1f3fc.png`,
    3: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/boy_emoji-modifier-fitzpatrick-type-4_1f466-1f3fd_1f3fd.png`,
    4: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/boy_emoji-modifier-fitzpatrick-type-5_1f466-1f3fe_1f3fe.png`,
    5: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/boy_emoji-modifier-fitzpatrick-type-6_1f466-1f3ff_1f3ff.png`
  },
  girl: {
    0: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/girl_1f467.png`,
    1: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/girl_emoji-modifier-fitzpatrick-type-1-2_1f467-1f3fb_1f3fb.png`,
    2: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/girl_emoji-modifier-fitzpatrick-type-3_1f467-1f3fc_1f3fc.png`,
    3: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/girl_emoji-modifier-fitzpatrick-type-4_1f467-1f3fd_1f3fd.png`,
    4: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/girl_emoji-modifier-fitzpatrick-type-5_1f467-1f3fe_1f3fe.png`,
    5: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/girl_emoji-modifier-fitzpatrick-type-6_1f467-1f3ff_1f3ff.png`
  },
  man: {
    0: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/man_1f468.png`,
    1: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/man_emoji-modifier-fitzpatrick-type-1-2_1f468-1f3fb_1f3fb.png`,
    2: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/man_emoji-modifier-fitzpatrick-type-3_1f468-1f3fc_1f3fc.png`,
    3: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/man_emoji-modifier-fitzpatrick-type-4_1f468-1f3fd_1f3fd.png`,
    4: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/man_emoji-modifier-fitzpatrick-type-5_1f468-1f3fe_1f3fe.png`,
    5: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/man_emoji-modifier-fitzpatrick-type-6_1f468-1f3ff_1f3ff.png`
  },
  woman: {
    0: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/woman_1f469.png`,
    1: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/woman_emoji-modifier-fitzpatrick-type-1-2_1f469-1f3fb_1f3fb.png`,
    2: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/woman_emoji-modifier-fitzpatrick-type-3_1f469-1f3fc_1f3fc.png`,
    3: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/woman_emoji-modifier-fitzpatrick-type-4_1f469-1f3fd_1f3fd.png`,
    4: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/woman_emoji-modifier-fitzpatrick-type-5_1f469-1f3fe_1f3fe.png`,
    5: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/woman_emoji-modifier-fitzpatrick-type-6_1f469-1f3ff_1f3ff.png`
  },
  olderMan: {
    0: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/older-man_1f474.png",
    1: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/older-man_emoji-modifier-fitzpatrick-type-1-2_1f474-1f3fb_1f3fb.png`,
    2: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/older-man_emoji-modifier-fitzpatrick-type-3_1f474-1f3fc_1f3fc.png`,
    3: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/older-man_emoji-modifier-fitzpatrick-type-4_1f474-1f3fd_1f3fd.png`,
    4: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/older-man_emoji-modifier-fitzpatrick-type-5_1f474-1f3fe_1f3fe.png`,
    5: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/older-man_emoji-modifier-fitzpatrick-type-6_1f474-1f3ff_1f3ff.png`
  },
  olderWoman: {
    0: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/older-woman_1f475.png",
    1: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/older-woman_emoji-modifier-fitzpatrick-type-1-2_1f475-1f3fb_1f3fb.png`,
    2: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/older-woman_emoji-modifier-fitzpatrick-type-3_1f475-1f3fc_1f3fc.png`,
    3: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/older-woman_emoji-modifier-fitzpatrick-type-4_1f475-1f3fd_1f3fd.png`,
    4: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/older-woman_emoji-modifier-fitzpatrick-type-5_1f475-1f3fe_1f3fe.png`,
    5: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/older-woman_emoji-modifier-fitzpatrick-type-6_1f475-1f3ff_1f3ff.png`
  }
};

const getRecoveredEmoji = (node, isMonochrome) =>
  emojis.recovered[isMale(node) ? "male" : "female"][
    getVariant(node, isMonochrome)
  ];

const sortByKasus = (nodeA, nodeB) => nodeA.kasus - nodeB.kasus;

const getEmoji = (node, isMonochrome) => {
  // console.log(
  //   isMale(node),
  //   node.gender,
  //   node.genderid,
  //   node.genderxid,
  //   node.kasus
  // );
  if (isDead(node)) {
    return "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/coffin_26b0.png";
  }

  if (isRecovered(node)) {
    return getRecoveredEmoji(node, isMonochrome);
  }
  if (isBaby(node)) {
    return emojis.baby[getVariant(node, isMonochrome)];
  }
  if (isYoung(node)) {
    return emojis[isMale(node) ? "boy" : "girl"][
      getVariant(node, isMonochrome)
    ];
  }
  if (isAdultBelow50(node)) {
    return emojis[isMale(node) ? "man" : "woman"][
      getVariant(node, isMonochrome)
    ];
  } else {
    return emojis[isMale(node) ? "olderMan" : "olderWoman"][
      getVariant(node, isMonochrome)
    ];
  }
};

const srcToImg = ({ src, node }) =>
  `<img src="${src}" class="person" ${
    isDev
      ? `data="${Object.entries(node)
          .map(d => d.join("="))
          .join("&")}"`
      : ""
  } />`;

export default async function handler(req: NowRequest, res: NowResponse) {
  try {
    const width = parseInt(req.query.width as string, 10) || 1200;
    const height = parseInt(req.query.height as string, 10) || 627;
    const isHtmlDebug =
      isDev &&
      (process.env.OG_HTML_DEBUG === "1" || req.query.debug === "true");
    const isMonochrome = req.query.mono === "true";
    const [{ nodes }] = await Promise.all([fetchCaseGraph()]);
    // res.json({ cases });
    const sorted = nodes.sort(sortByKasus);

    const html = getHtml({
      //@ts-ignore
      emojis: sorted
        .map(n => ({ src: getEmoji(n, isMonochrome), node: n }))
        .map(srcToImg),
      width,
      height
    });
    if (isHtmlDebug) {
      res.setHeader("Content-Type", "text/html");
      res.end(html);
      return;
    }
    const text = "textwoot";
    const filePath = await writeTempFile(text, html);
    const fileUrl = pathToFileURL(filePath);
    const file = await getScreenshot(fileUrl, isDev, width, height);
    res.setHeader("Content-Type", `image/png`);
    res.end(file);
  } catch (e) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/html");
    res.end("<h1>Internal Error</h1><p>Sorry, there was a problem</p>");
    console.error(e);
  }
}
