import { Link } from "../../common/LinkButton";
import React from "react";

const CODES = {
  transports: {
    label: "Code des transports"
  },
  work: {
    label: "Code du travail"
  }
};

export const LEGAL_ARTICLES = {
  dailyWorkTRM: {
    name: "R.3312-51",
    url:
      "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033450339/",
    code: CODES.transports
  },
  dailyWorkTRV1: {
    name: "D.3312-6",
    url:
      "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043651243/",
    code: CODES.transports
  },
  dailyWorkTRV2: {
    name: "R.3312-28",
    url:
      "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033450281/",
    code: CODES.transports
  },
  dailyWorkTRV3: {
    name: "R.3312-9",
    url:
      "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043651238/",
    code: CODES.transports
  },
  dailyWorkTRV4: {
    name: "R.3312-11",
    url:
      "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043651232/",
    code: CODES.transports
  },
  amplitude: {
    name: "R.3312-2",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033450215",
    code: CODES.transports
  },
  break: {
    name: "L.3312-2",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000026054561",
    code: CODES.transports
  },
  dailyRest: {
    name: "R.3312-53",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033450343",
    code: CODES.transports
  },
  weeklyWorkTRM: {
    name: "R.3312-50",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033450337",
    code: CODES.transports
  },
  weeklyWorkTRV1: {
    name: "L.3121-20",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033020414",
    code: CODES.work
  },
  weeklyWorkTRV2: {
    name: "L.3121-22",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033020402",
    code: CODES.work
  },
  weeklyRest1: {
    name: "L.3132-2",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006902581",
    code: CODES.work
  },
  weeklyRest2: {
    name: "L.3132-1",
    url:
      "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006902580/",
    code: CODES.work
  },
  nightWorker1: {
    name: "L.3122-5",
    url:
      "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033020171/",
    code: CODES.work
  },
  nightWorker2: {
    name: "L.3122-23",
    url:
      "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033020112/",
    code: CODES.work
  },
  calendarWeek: {
    name: "L.3122-1",
    url:
      "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006902494/2008-05-01",
    code: CODES.work
  },
  longDistance: {
    name: "D.3312-36",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033450305",
    code: CODES.transports
  },
  dailyWorkDuringNight: {
    name: "L.3312-1",
    url:
      "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033021297/",
    code: CODES.transports
  },
  nightWork: {
    name: "L.1321-7",
    url:
      "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033021331/",
    code: CODES.transports
  },
  nightBonus: {
    label: "Accord du 14 novembre 2001 relatif au travail de nuit",
    url:
      "https://www.legifrance.gouv.fr/conv_coll/article/KALIARTI000032302217#KALIARTI000032302217"
  }
};

export function RegulationLegalArticleLink({ article, shortLabel = false }) {
  return (
    <Link href={article.url} target="_blank">
      {article.label
        ? article.label
        : !shortLabel
        ? `Article ${article.name} du ${article.code.label}`
        : article.name}
    </Link>
  );
}

export function RegulationArticlesBlock({ articles, className }) {
  return articles instanceof Array ? (
    <ul className={className}>
      {articles.map(article => (
        <li key={article.name || article.label}>
          <RegulationLegalArticleLink article={article} />
        </li>
      ))}
    </ul>
  ) : (
    <ul className={className}>
      {Object.entries(articles).map(([key, value]) => (
        <li key={key}>
          {key}&nbsp;:
          <ul>
            {value.map(link => (
              <li key={link.name || link.label}>
                <RegulationLegalArticleLink article={link} />
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
