import { Link } from "../../common/LinkButton";
import React from "react";

const CODES = {
  transports: {
    label: "code des transports"
  },
  work: {
    label: "code du travail"
  }
};

export const LEGAL_ARTICLES = {
  dailyWork: {
    name: "R.3312-51",
    url:
      "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033450339/",
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
  weeklyWork: {
    name: "R.3312-50",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033450337",
    code: CODES.transports
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
  return (
    <ul className={className}>
      {articles.map((article, index) => (
        <li key={index}>
          <RegulationLegalArticleLink article={article} />
        </li>
      ))}
    </ul>
  );
}
