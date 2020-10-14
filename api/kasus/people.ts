import { NowResponse, NowRequest } from "@vercel/node";
import { getHtml } from "../../util/template";
import { writeTempFile, pathToFileURL } from "../../util/file";
import { getScreenshot } from "../../util/chromium";
import { fetchCaseGraph } from "../../util/fetcher";

const isDev = process.env.NOW_REGION === "dev1";

const getAgeKey = pasien => {
  if (!pasien.umur) return `U`;
  if (pasien.umur < 5) {
    return `B`;
  } else if (pasien.umur < 19) {
    return `A`;
  } else if (pasien.umur < 50) {
    return `D`;
  } else {
    return `T`;
  }
};

// const umurReducer = (accumulated, current) => {
//   const ageKey = getAgeKey(current)
//   return {
//     ...accumulated,
//     [ageKey]: {
//       L: (accumulated[ageKey] && accumulated[ageKey].L || 0) + (current.jenis_kelamin === 1 ? 1 : 0),
//       P: (accumulated[ageKey] && accumulated[ageKey].P || 0) + (current.jenis_kelamin === 0 ? 1 : 0),
//       U: (accumulated[ageKey] && accumulated[ageKey].U || 0) + (current.jenis_kelamin === 2 ? 1 : 0),
//     }
//   }
// }

const emojis = {
  B: {
    0: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/baby_1f476.png`,
    1: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/baby_emoji-modifier-fitzpatrick-type-1-2_1f476-1f3fb_1f3fb.png`,
    2: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/baby_emoji-modifier-fitzpatrick-type-3_1f476-1f3fc_1f3fc.png`,
    3: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/baby_emoji-modifier-fitzpatrick-type-4_1f476-1f3fd_1f3fd.png`,
    4: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/baby_emoji-modifier-fitzpatrick-type-5_1f476-1f3fe_1f3fe.png`,
    5: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/baby_emoji-modifier-fitzpatrick-type-6_1f476-1f3ff_1f3ff.png`
  },
  A: {
    U: {
      0: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/child_1f9d2.png`,
      1: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/child_emoji-modifier-fitzpatrick-type-1-2_1f9d2-1f3fb_1f3fb.png`,
      2: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/child_emoji-modifier-fitzpatrick-type-3_1f9d2-1f3fc_1f3fc.png`,
      3: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/child_emoji-modifier-fitzpatrick-type-4_1f9d2-1f3fd_1f3fd.png`,
      4: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/child_emoji-modifier-fitzpatrick-type-5_1f9d2-1f3fe_1f3fe.png`,
      5: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/child_emoji-modifier-fitzpatrick-type-6_1f9d2-1f3ff_1f3ff.png`
    },
    L: {
      0: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/boy_1f466.png`,
      1: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/boy_emoji-modifier-fitzpatrick-type-1-2_1f466-1f3fb_1f3fb.png`,
      2: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/boy_emoji-modifier-fitzpatrick-type-3_1f466-1f3fc_1f3fc.png`,
      3: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/boy_emoji-modifier-fitzpatrick-type-4_1f466-1f3fd_1f3fd.png`,
      4: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/boy_emoji-modifier-fitzpatrick-type-5_1f466-1f3fe_1f3fe.png`,
      5: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/boy_emoji-modifier-fitzpatrick-type-6_1f466-1f3ff_1f3ff.png`
    },
    P: {
      0: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/girl_1f467.png`,
      1: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/girl_emoji-modifier-fitzpatrick-type-1-2_1f467-1f3fb_1f3fb.png`,
      2: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/girl_emoji-modifier-fitzpatrick-type-3_1f467-1f3fc_1f3fc.png`,
      3: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/girl_emoji-modifier-fitzpatrick-type-4_1f467-1f3fd_1f3fd.png`,
      4: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/girl_emoji-modifier-fitzpatrick-type-5_1f467-1f3fe_1f3fe.png`,
      5: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/girl_emoji-modifier-fitzpatrick-type-6_1f467-1f3ff_1f3ff.png`
    }
  },
  D: {
    U: {
      0: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/adult_1f9d1.png`,
      1: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/adult_emoji-modifier-fitzpatrick-type-1-2_1f9d1-1f3fb_1f3fb.png`,
      2: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/adult_emoji-modifier-fitzpatrick-type-3_1f9d1-1f3fc_1f3fc.png`,
      3: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/adult_emoji-modifier-fitzpatrick-type-4_1f9d1-1f3fd_1f3fd.png`,
      4: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/adult_emoji-modifier-fitzpatrick-type-5_1f9d1-1f3fe_1f3fe.png`,
      5: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/adult_emoji-modifier-fitzpatrick-type-6_1f9d1-1f3ff_1f3ff.png`
    },
    L: {
      0: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/man_1f468.png`,
      1: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/man_emoji-modifier-fitzpatrick-type-1-2_1f468-1f3fb_1f3fb.png`,
      2: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/man_emoji-modifier-fitzpatrick-type-3_1f468-1f3fc_1f3fc.png`,
      3: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/man_emoji-modifier-fitzpatrick-type-4_1f468-1f3fd_1f3fd.png`,
      4: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/man_emoji-modifier-fitzpatrick-type-5_1f468-1f3fe_1f3fe.png`,
      5: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/man_emoji-modifier-fitzpatrick-type-6_1f468-1f3ff_1f3ff.png`
    },
    P: {
      0: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/woman_1f469.png`,
      1: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/woman_emoji-modifier-fitzpatrick-type-1-2_1f469-1f3fb_1f3fb.png`,
      2: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/woman_emoji-modifier-fitzpatrick-type-3_1f469-1f3fc_1f3fc.png`,
      3: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/woman_emoji-modifier-fitzpatrick-type-4_1f469-1f3fd_1f3fd.png`,
      4: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/woman_emoji-modifier-fitzpatrick-type-5_1f469-1f3fe_1f3fe.png`,
      5: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/woman_emoji-modifier-fitzpatrick-type-6_1f469-1f3ff_1f3ff.png`
    }
  },
  T: {
    U: {
      0: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/older-adult_1f9d3.png",
      1: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/older-adult_emoji-modifier-fitzpatrick-type-1-2_1f9d3-1f3fb_1f3fb.png`,
      2: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/older-adult_emoji-modifier-fitzpatrick-type-3_1f9d3-1f3fc_1f3fc.png`,
      3: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/older-adult_emoji-modifier-fitzpatrick-type-4_1f9d3-1f3fd_1f3fd.png`,
      4: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/older-adult_emoji-modifier-fitzpatrick-type-5_1f9d3-1f3fe_1f3fe.png`,
      5: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/older-adult_emoji-modifier-fitzpatrick-type-6_1f9d3-1f3ff_1f3ff.png`
    },
    L: {
      0: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/older-man_1f474.png",
      1: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/older-man_emoji-modifier-fitzpatrick-type-1-2_1f474-1f3fb_1f3fb.png`,
      2: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/older-man_emoji-modifier-fitzpatrick-type-3_1f474-1f3fc_1f3fc.png`,
      3: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/older-man_emoji-modifier-fitzpatrick-type-4_1f474-1f3fd_1f3fd.png`,
      4: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/older-man_emoji-modifier-fitzpatrick-type-5_1f474-1f3fe_1f3fe.png`,
      5: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/older-man_emoji-modifier-fitzpatrick-type-6_1f474-1f3ff_1f3ff.png`
    },
    P: {
      0: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/older-woman_1f475.png",
      1: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/older-woman_emoji-modifier-fitzpatrick-type-1-2_1f475-1f3fb_1f3fb.png`,
      2: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/older-woman_emoji-modifier-fitzpatrick-type-3_1f475-1f3fc_1f3fc.png`,
      3: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/older-woman_emoji-modifier-fitzpatrick-type-4_1f475-1f3fd_1f3fd.png`,
      4: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/older-woman_emoji-modifier-fitzpatrick-type-5_1f475-1f3fe_1f3fe.png`,
      5: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/older-woman_emoji-modifier-fitzpatrick-type-6_1f475-1f3ff_1f3ff.png`
    }
  },
  U: {
    U: {
      0: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/person-bald_1f9d1-200d-1f9b2.png",
      1: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/person-light-skin-tone-bald_1f9d1-1f3fb-200d-1f9b2.png`,
      2: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/person-medium-light-skin-tone-bald_1f9d1-1f3fc-200d-1f9b2.png`,
      3: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/person-medium-skin-tone-bald_1f9d1-1f3fd-200d-1f9b2.png`,
      4: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/person-medium-dark-skin-tone-bald_1f9d1-1f3fe-200d-1f9b2.png`,
      5: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/person-dark-skin-tone-bald_1f9d1-1f3ff-200d-1f9b2.png`
    },
    L: {
      0: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/man-bald_1f468-200d-1f9b2.png",
      1: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/man-bald-light-skin-tone_1f468-1f3fb-200d-1f9b2.png`,
      2: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/man-bald-medium-light-skin-tone_1f468-1f3fc-200d-1f9b2.png`,
      3: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/man-bald-medium-skin-tone_1f468-1f3fd-200d-1f9b2.png`,
      4: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/man-bald-medium-dark-skin-tone_1f468-1f3fe-200d-1f9b2.png`,
      5: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/man-bald-dark-skin-tone_1f468-1f3ff-200d-1f9b2.png`
    },
    P: {
      0: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/woman-bald_1f469-200d-1f9b2.png",
      1: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/woman-bald-light-skin-tone_1f469-1f3fb-200d-1f9b2.png`,
      2: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/woman-bald-medium-light-skin-tone_1f469-1f3fc-200d-1f9b2.png`,
      3: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/woman-bald-medium-skin-tone_1f469-1f3fd-200d-1f9b2.png`,
      4: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/woman-bald-medium-dark-skin-tone_1f469-1f3fe-200d-1f9b2.png`,
      5: `https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/woman-bald-dark-skin-tone_1f469-1f3ff-200d-1f9b2.png`
    }
  }
};

const metaMapper = pasien => ({
  age: getAgeKey(pasien),
  gender: ["P", "L", "U"][pasien.jenis_kelamin ?? 2],
  status: ["Meninggal", "Sembuh", "Masih Dirawat"][pasien.id_status ?? 2],
  variant: ((pasien.id_pasien * (pasien.umur ?? 0)) % 5) + 1
});

const emojiMapper = meta => ({
  src:
    meta.age === "B"
      ? emojis[meta.age][meta.variant]
      : emojis[meta.age][meta.gender][meta.variant],
  status: meta.status
});

const sortByKasus = (pasienA, pasienB) =>
  pasienA.kode_pasien - pasienB.kode_pasien;

const srcToImg = ({ src, status }) =>
  status === "Meninggal"
    ? `<div class="person"><img class="img back" src="${src}" /><img class="img front" src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/cross-mark_274c.png" /></div>`
    : status === "Sembuh"
    ? `<div class="person"><img class="img back" src="${src}" /><img class="img front" src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/white-heavy-check-mark_2705.png" /></div>`
    : `<div class="person"><img src="${src}" class="img" /></div>`;

const dateReducer = (accumulated, current) => {
  return {
    ...accumulated,
    [current.added_date]: (accumulated[current.added_date] || 0) + 1
  };
};

export default async function handler(req: NowRequest, res: NowResponse) {
  try {
    const width = parseInt(req.query.width as string, 10) || 1200;
    const height = parseInt(req.query.height as string, 10) || 627;
    const isHtmlDebug =
      isDev &&
      (process.env.OG_HTML_DEBUG === "1" || req.query.debug === "true");
    const daysOffset = req.query.daysOffset
      ? parseInt(req.query.daysOffset as string, 10)
      : 0;
    const data = await fetchCaseGraph();
    const days = Object.keys(data.reduce(dateReducer, {}));
    const day = days.slice(-1 * daysOffset - 1)[0];
    const sorted = data.sort(sortByKasus);
    const emojis = sorted
      .filter(p => p.added_date <= day)
      .map(metaMapper)
      .map(emojiMapper)
      .map(srcToImg);

    const html = getHtml({
      emojis,
      width,
      height
    });
    if (isHtmlDebug) {
      res.setHeader("Content-Type", "text/html");
      res.end(html);
      return;
    }
    const text = JSON.stringify({
      emojis,
      width,
      height
    });
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
