/** PDF paths aligned with the `notes` bucket: indirecttax/goodsandservices(GST)/ and indirecttax/customsact/ */

const GST = "/pdf/indirecttax/goodsandservices(GST)";
const CUSTOMS = "/pdf/indirecttax/customsact";

export interface IndirectTaxPdf {
  title: string;
  src: string;
  download: string;
}

export const indirectTaxGstPdfs: IndirectTaxPdf[] = [
  { title: "Chapter 1 - Fundamentals of GST", src: `${GST}/Chapter-1 Fundamentals of GST.pdf`, download: "Chapter-1 Fundamentals of GST.pdf" },
  { title: "Chapter 2 - Basics of GST", src: `${GST}/Chapter-2 Basics of GST.pdf`, download: "Chapter-2 Basics of GST.pdf" },
  { title: "Chapter 3 - One Nation-One Tax", src: `${GST}/Chapter-3 One Nation-One Tax.pdf`, download: "Chapter-3 One Nation-One Tax.pdf" },
  { title: "Chapter 4 - Goods and Services Tax Network", src: `${GST}/Chapter-4 Goods and Services Tax Network (GSTN).pdf`, download: "Chapter-4 Goods and Services Tax Network (GSTN).pdf" },
  { title: "Chapter 5 - GST Council", src: `${GST}/Chapter-5 GST Council.pdf`, download: "Chapter-5 GST Council.pdf" },
  { title: "Chapter 6 - Important Definitions", src: `${GST}/Chapter-6 Important Definitions.pdf`, download: "Chapter-6 Important Definitions.pdf" },
  { title: "Chapter 7 - Supply", src: `${GST}/Chapter-7 Supply.pdf`, download: "Chapter-7 Supply.pdf" },
  { title: "Chapter 8 - Composite and Mixed Supplies", src: `${GST}/Chapter-8 Composite and Mixed Supplies.pdf`, download: "Chapter-8 Composite and Mixed Supplies.pdf" },
  { title: "Chapter 9 - Levy and Collection", src: `${GST}/Chapter-9 Levy and Collection.pdf`, download: "Chapter-9 Levy and Collection.pdf" },
  { title: "Chapter 10 - Composition Levy", src: `${GST}/Chapter-10Composition Levy.pdf`, download: "Chapter-10Composition Levy.pdf" },
  { title: "Chapter 11 - Exemptions", src: `${GST}/Chapter-11 Exemptions.pdf`, download: "Chapter-11 Exemptions.pdf" },
  { title: "Chapter 12 - Reverse Charge Mechanism", src: `${GST}/Chapter-12 Reverse Charge Mechanism (RCM).pdf`, download: "Chapter-12 Reverse Charge Mechanism (RCM).pdf" },
  { title: "Chapter 13 - Time of Supply", src: `${GST}/Chapter-13 Time of Supply.pdf`, download: "Chapter-13 Time of Supply.pdf" },
  { title: "Chapter 14 - Place of Supply", src: `${GST}/Chapter-14 Place of Supply.pdf`, download: "Chapter-14 Place of Supply.pdf" },
  { title: "Chapter 15 - Value of Supply", src: `${GST}/Chapter-15 Value of Supply.pdf`, download: "Chapter-15 Value of Supply.pdf" },
  { title: "Chapter 16 - Registration under GST", src: `${GST}/Chapter-16 Registration under GST.pdf`, download: "Chapter-16 Registration under GST.pdf" },
  { title: "Chapter 21 - Offences and Penalties under GST", src: `${GST}/Chapter-21 Offences and Penalties under GST.pdf`, download: "Chapter-21 Offences and Penalties under GST.pdf" },
  { title: "Chapter 23 - Accounts and Records", src: `${GST}/Chapter-23 Accounts and Records under GST.pdf`, download: "Chapter-23 Accounts and Records under GST.pdf" },
  { title: "Chapter 24 - Assessment", src: `${GST}/Chapter-24 Assessment.pdf`, download: "Chapter-24 Assessment.pdf" },
  { title: "Chapter 25 - Audit", src: `${GST}/Chapter-25 Audit.pdf`, download: "Chapter-25 Audit.pdf" },
  { title: "Chapter 27 - TDS under GST", src: `${GST}/Chapter-27 TDS under GST.pdf`, download: "Chapter-27 TDS under GST.pdf" },
  { title: "Chapter 28 - TCS under GST", src: `${GST}/Chapter-28 TCS under GST.pdf`, download: "Chapter-28 TCS under GST.pdf" },
  { title: "Chapter 29 - GST Practitioners", src: `${GST}/Chapter-29 GST Practitioners.pdf`, download: "Chapter-29 GST Practitioners.pdf" },
  { title: "Chapter 30 - Anti-Profiteering", src: `${GST}/Chapter-30Anti-Profiteering.pdf`, download: "Chapter-30Anti-Profiteering.pdf" },
  { title: "Chapter 31 - Demand and Adjudication", src: `${GST}/Chapter-31 Demand and Adjudication.pdf`, download: "Chapter-31 Demand and Adjudication.pdf" },
  { title: "Chapter 35 - GST (Compensation to States) Act, 2017", src: `${GST}/Chapter-35 Goods and Services Tax (Compensation to States) Act, 2017.pdf`, download: "Chapter-35 Goods and Services Tax (Compensation to States) Act, 2017.pdf" },
];

export const indirectTaxCustomsPdfs: IndirectTaxPdf[] = [
  { title: "Chapter 1 - Basic Concepts", src: `${CUSTOMS}/Chapter-1 Basic Concepts.pdf`, download: "Chapter-1 Basic Concepts.pdf" },
  { title: "Chapter 2 - Valuation under Customs", src: `${CUSTOMS}/Chapter-2 Valuation under Customs.pdf`, download: "Chapter-2 Valuation under Customs.pdf" },
  { title: "Chapter 3 - Types of Duties", src: `${CUSTOMS}/Chapter-3Types of Duties.pdf`, download: "Chapter-3Types of Duties.pdf" },
  { title: "Chapter 4 - Administrative and Other Aspects", src: `${CUSTOMS}/Chapter-4 Administrative and Other Aspects.pdf`, download: "Chapter-4 Administrative and Other Aspects.pdf" },
  { title: "Chapter 5 - Import and Export Procedure", src: `${CUSTOMS}/Chapter-5 Import and Export Procedure.pdf`, download: "Chapter-5 Import and Export Procedure.pdf" },
  { title: "Chapter 6 - Baggage", src: `${CUSTOMS}/Chapter-6 Baggage.pdf`, download: "Chapter-6 Baggage.pdf" },
  { title: "Chapter 7 - Appeals under Customs", src: `${CUSTOMS}/Chapter-7 Appeals under Customs.pdf`, download: "Chapter-7 Appeals under Customs.pdf" },
  { title: "Chapter 8 - Appeal to Commissioner (Appeal)", src: `${CUSTOMS}/Chapter-8 Appeal to Commissioner (Appeal).pdf`, download: "Chapter-8 Appeal to Commissioner (Appeal).pdf" },
  { title: "Chapter 9 - Appeals to CESTAT", src: `${CUSTOMS}/Chapter-9 Appeals to the Customs, Excise and Service Tax Appellate Tribunal (CESTAT).pdf`, download: "Chapter-9 Appeals to the Customs, Excise and Service Tax Appellate Tribunal (CESTAT).pdf" },
  { title: "Chapter 10 - Appeals to High Court", src: `${CUSTOMS}/Chapter-10 Appeals to High Court.pdf`, download: "Chapter-10 Appeals to High Court.pdf" },
  { title: "Chapter 12 - Appeals to the Settlement Commission", src: `${CUSTOMS}/Chapter-12 Appeals to the Settlement Commission.pdf`, download: "Chapter-12 Appeals to the Settlement Commission.pdf" },
  { title: "Chapter 13 - Authority for Advance Ruling", src: `${CUSTOMS}/Chapter-13 Authority for Advance Ruling.pdf`, download: "Chapter-13 Authority for Advance Ruling.pdf" },
  { title: "Chapter 14 - Foreign Trade Policy 2015-2020", src: `${CUSTOMS}/Chapter-14 Foreign Trade Policy 2015-2020.pdf`, download: "Chapter-14 Foreign Trade Policy 2015-2020.pdf" },
  { title: "Chapter 15 - Comprehensive Issues under Customs", src: `${CUSTOMS}/Chapter-15 Comprehensive Issues under Customs.pdf`, download: "Chapter-15 Comprehensive Issues under Customs.pdf" },
];

export const indirectTaxConceptPdfs: Record<string, IndirectTaxPdf[]> = {
  "GST LAWS": indirectTaxGstPdfs,
  "Customs Act": indirectTaxCustomsPdfs,
};
