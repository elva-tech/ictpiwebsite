/** PDF paths aligned with the `notes` bucket: directtax/domestic/ and directtax/international/ */

const DOMESTIC = "/pdf/directtax/domestic";
const INTERNATIONAL = "/pdf/directtax/international";

export interface DirectTaxPdf {
  title: string;
  src: string;
  download: string;
}

export type DirectTaxSection = DirectTaxPdf[];
export type DirectTaxCategory = Record<string, Record<string, DirectTaxSection>>;

export const directTaxPdfData: DirectTaxCategory = {
  Domestic: {
    "Special Provisions Regarding Capital Gains and Other Important Topics": [
      {
        title: "Taxation of Employees Stock Options",
        src: `${DOMESTIC}/Taxation of Employees Stock Options .pdf`,
        download: "Taxation of Employees Stock Options .pdf",
      },
      {
        title: "TDS and Tax Payment on ESOP's",
        src: `${DOMESTIC}/TDS and Tax Payment on ESOP's.pdf`,
        download: "TDS and Tax Payment on ESOP's.pdf",
      },
      {
        title: "Taxation of income on units",
        src: `${DOMESTIC}/Taxation of income on units.pdf`,
        download: "Taxation of income on units.pdf",
      },
    ],
    "Taxation of different entities and related special provisions": [
      {
        title: "Taxation of HUF's",
        src: `${DOMESTIC}/Taxation of HUF's.pdf`,
        download: "Taxation of HUF's.pdf",
      },
      {
        title: "Taxation of Firms",
        src: `${DOMESTIC}/Taxation of Firms.pdf`,
        download: "Taxation of Firms.pdf",
      },
      {
        title: "Taxation of LLP",
        src: `${DOMESTIC}/Taxation of LLP.pdf`,
        download: "Taxation of LLP.pdf",
      },
      {
        title: "Tonnage Taxation",
        src: `${DOMESTIC}/Tonnage Taxation.pdf`,
        download: "Tonnage Taxation.pdf",
      },
      {
        title: "Taxation of securitization trust and its investors",
        src: `${DOMESTIC}/Taxation of securitization trust and its investors.pdf`,
        download: "Taxation of securitization trust and its investors.pdf",
      },
      {
        title: "Taxation of securitization trust and its investors (1)",
        src: `${DOMESTIC}/Taxation of securitization trust and its investors (1).pdf`,
        download: "Taxation of securitization trust and its investors (1).pdf",
      },
      {
        title: "Taxation of Political Parties",
        src: `${DOMESTIC}/Taxation of Political Parties.pdf`,
        download: "Taxation of Political Parties.pdf",
      },
      {
        title: "Taxation of Electoral Trusts",
        src: `${DOMESTIC}/Taxation of Electoral Trusts.pdf`,
        download: "Taxation of Electoral Trusts.pdf",
      },
      {
        title: "Taxation of Investment Fund and it's investors",
        src: `${DOMESTIC}/Taxation of Investment Fund and it's investors.pdf`,
        download: "Taxation of Investment Fund and it's investors.pdf",
      },
    ],
  },
  International: {
    "International Taxation": [
      {
        title: "Business Connections",
        src: `${INTERNATIONAL}/Business Connections.pdf`,
        download: "Business Connections.pdf",
      },
      {
        title: "Convert of Indian branch of foreign bank into a subsidiary co.",
        src: `${INTERNATIONAL}/Convert of Indian branch of foreign bank into a subsidiary co..pdf`,
        download: "Convert of Indian branch of foreign bank into a subsidiary co..pdf",
      },
      {
        title: "Exempt incomes of Non residents",
        src: `${INTERNATIONAL}/Exempt incomes of Non residents.pdf`,
        download: "Exempt incomes of Non residents.pdf",
      },
      {
        title: "Foreign tax credit",
        src: `${INTERNATIONAL}/Foreign tax credit.pdf`,
        download: "Foreign tax credit.pdf",
      },
      {
        title: "Miscellaneous Amendments by FA 2022",
        src: `${INTERNATIONAL}/Miscellaneous Amendments by FA 2022.pdf`,
        download: "Miscellaneous Amendments by FA 2022.pdf",
      },
      {
        title: "Notified Jurisdictional Area",
        src: `${INTERNATIONAL}/Notified Jurisdictional Area.pdf`,
        download: "Notified Jurisdictional Area.pdf",
      },
    ],
  },
};

const VLOG_MENTORS = [
  "CA Vikram Malhotra",
  "Adv. Priya Singh",
  "Prof. Neeraj Gupta",
] as const;

export interface DirectTaxVlogPdf extends DirectTaxPdf {
  mentor: string;
}

/** Flat list of all bucket PDFs for vlogs pages. */
export function getDirectTaxVlogPdfs(): DirectTaxVlogPdf[] {
  const flat: DirectTaxPdf[] = [];
  for (const sections of Object.values(directTaxPdfData)) {
    for (const pdfs of Object.values(sections)) {
      flat.push(...pdfs);
    }
  }

  return flat.map((pdf, index) => ({
    ...pdf,
    mentor: VLOG_MENTORS[index % VLOG_MENTORS.length],
  }));
}
