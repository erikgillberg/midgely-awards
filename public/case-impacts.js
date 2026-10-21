// Impacts over time: what each fix gave and what it cost, year by year, so a backfire can be graphed and weighed.
// This file is the source of truth; the worker copies it into the database (impact_series, impact_points,
// impact_money) whenever IMPACTS_VERSION changes, so editing data here and deploying is enough.
//
//   series: one measured quantity, in one unit, for one fix of a case
//     { key, fix, label, direction: "harm" | "benefit" | "context", unit, kind: "flow" | "level" | "cumulative",
//       geography, method, source, url, points: [ { year, value, low, high, projected, estimate, note, source, url } ] }
//   events: dated turning points drawn across every chart of the case { year, label }
//   money:  a dollar estimate, so harms and benefits can be set side by side. direction: "harm" (damage that happened),
//           "avoided" (harm prevented by fixing the backfire) or "benefit" (what the fix gave)
//   gaps:   what we looked for and could not find, shown with the chart
//     { key, fix, label, direction, usd_year, total_usd, per_year_usd, low_usd, high_usd, years, source, url, note, caption (shown on the card) }
//
// Rules: every point has a source; projections and estimates are marked; units never mix inside a series;
// nothing is interpolated. Different units are never drawn on one axis: each series gets its own small chart,
// on a shared timeline, and only dollar figures are compared directly.

export const IMPACTS_VERSION = "4";

// "featured" series are the ones drawn on the dashboard; the rest are stored and served by the API.
export const CASE_IMPACTS = [
 {
  "nominee": "midgley",
  "series": [
   {
    "key": "us-lead-emissions-highway-vehicles",
    "fix": "lead",
    "label": "US lead emissions from highway vehicles",
    "direction": "harm",
    "unit": "thousand short tons of lead per year",
    "kind": "flow",
    "geography": "US",
    "method": "EPA emissions inventory estimate of airborne lead emitted by on-road vehicles, which was almost entirely tailpipe lead from leaded gasoline.",
    "source": "US EPA, National Air Pollutant Emission Trends Update 1970-1997, as tabulated in BTS National Transportation Statistics 2001, Table 4-46 (Estimated National Emissions of Lead)",
    "url": "https://www.bts.gov/archive/publications/national_transportation_statistics/2001/table_04_46",
    "points": [
     {
      "year": 1970,
      "value": 171.96,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "Archived copy: https://web.archive.org/web/2005/http://www.bts.gov/publications/national_transportation_statistics/2001/html/table_04_46.html",
      "source": "US EPA, National Air Pollutant Emission Trends Update 1970-1997, as tabulated in BTS National Transportation Statistics 2001, Table 4-46 (Estimated National Emissions of Lead)",
      "url": "https://www.bts.gov/archive/publications/national_transportation_statistics/2001/table_04_46"
     },
     {
      "year": 1975,
      "value": 130.21,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "",
      "source": "US EPA, National Air Pollutant Emission Trends Update 1970-1997, as tabulated in BTS National Transportation Statistics 2001, Table 4-46 (Estimated National Emissions of Lead)",
      "url": "https://www.bts.gov/archive/publications/national_transportation_statistics/2001/table_04_46"
     },
     {
      "year": 1980,
      "value": 60.5,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "",
      "source": "US EPA, National Air Pollutant Emission Trends Update 1970-1997, as tabulated in BTS National Transportation Statistics 2001, Table 4-46 (Estimated National Emissions of Lead)",
      "url": "https://www.bts.gov/archive/publications/national_transportation_statistics/2001/table_04_46"
     },
     {
      "year": 1985,
      "value": 18.05,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "",
      "source": "US EPA, National Air Pollutant Emission Trends Update 1970-1997, as tabulated in BTS National Transportation Statistics 2001, Table 4-46 (Estimated National Emissions of Lead)",
      "url": "https://www.bts.gov/archive/publications/national_transportation_statistics/2001/table_04_46"
     },
     {
      "year": 1986,
      "value": 10.25,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "",
      "source": "US EPA, National Air Pollutant Emission Trends Update 1970-1997, as tabulated in BTS National Transportation Statistics 2001, Table 4-46 (Estimated National Emissions of Lead)",
      "url": "https://www.bts.gov/archive/publications/national_transportation_statistics/2001/table_04_46"
     },
     {
      "year": 1987,
      "value": 3.32,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "",
      "source": "US EPA, National Air Pollutant Emission Trends Update 1970-1997, as tabulated in BTS National Transportation Statistics 2001, Table 4-46 (Estimated National Emissions of Lead)",
      "url": "https://www.bts.gov/archive/publications/national_transportation_statistics/2001/table_04_46"
     },
     {
      "year": 1988,
      "value": 2.57,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "",
      "source": "US EPA, National Air Pollutant Emission Trends Update 1970-1997, as tabulated in BTS National Transportation Statistics 2001, Table 4-46 (Estimated National Emissions of Lead)",
      "url": "https://www.bts.gov/archive/publications/national_transportation_statistics/2001/table_04_46"
     },
     {
      "year": 1989,
      "value": 0.98,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "",
      "source": "US EPA, National Air Pollutant Emission Trends Update 1970-1997, as tabulated in BTS National Transportation Statistics 2001, Table 4-46 (Estimated National Emissions of Lead)",
      "url": "https://www.bts.gov/archive/publications/national_transportation_statistics/2001/table_04_46"
     },
     {
      "year": 1990,
      "value": 0.42,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "",
      "source": "US EPA, National Air Pollutant Emission Trends Update 1970-1997, as tabulated in BTS National Transportation Statistics 2001, Table 4-46 (Estimated National Emissions of Lead)",
      "url": "https://www.bts.gov/archive/publications/national_transportation_statistics/2001/table_04_46"
     },
     {
      "year": 1991,
      "value": 0.02,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "",
      "source": "US EPA, National Air Pollutant Emission Trends Update 1970-1997, as tabulated in BTS National Transportation Statistics 2001, Table 4-46 (Estimated National Emissions of Lead)",
      "url": "https://www.bts.gov/archive/publications/national_transportation_statistics/2001/table_04_46"
     },
     {
      "year": 1992,
      "value": 0.02,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "",
      "source": "US EPA, National Air Pollutant Emission Trends Update 1970-1997, as tabulated in BTS National Transportation Statistics 2001, Table 4-46 (Estimated National Emissions of Lead)",
      "url": "https://www.bts.gov/archive/publications/national_transportation_statistics/2001/table_04_46"
     },
     {
      "year": 1993,
      "value": 0.02,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "",
      "source": "US EPA, National Air Pollutant Emission Trends Update 1970-1997, as tabulated in BTS National Transportation Statistics 2001, Table 4-46 (Estimated National Emissions of Lead)",
      "url": "https://www.bts.gov/archive/publications/national_transportation_statistics/2001/table_04_46"
     },
     {
      "year": 1994,
      "value": 0.02,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "",
      "source": "US EPA, National Air Pollutant Emission Trends Update 1970-1997, as tabulated in BTS National Transportation Statistics 2001, Table 4-46 (Estimated National Emissions of Lead)",
      "url": "https://www.bts.gov/archive/publications/national_transportation_statistics/2001/table_04_46"
     },
     {
      "year": 1995,
      "value": 0.02,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "",
      "source": "US EPA, National Air Pollutant Emission Trends Update 1970-1997, as tabulated in BTS National Transportation Statistics 2001, Table 4-46 (Estimated National Emissions of Lead)",
      "url": "https://www.bts.gov/archive/publications/national_transportation_statistics/2001/table_04_46"
     },
     {
      "year": 1996,
      "value": 0.02,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "",
      "source": "US EPA, National Air Pollutant Emission Trends Update 1970-1997, as tabulated in BTS National Transportation Statistics 2001, Table 4-46 (Estimated National Emissions of Lead)",
      "url": "https://www.bts.gov/archive/publications/national_transportation_statistics/2001/table_04_46"
     },
     {
      "year": 1997,
      "value": 0.02,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "",
      "source": "US EPA, National Air Pollutant Emission Trends Update 1970-1997, as tabulated in BTS National Transportation Statistics 2001, Table 4-46 (Estimated National Emissions of Lead)",
      "url": "https://www.bts.gov/archive/publications/national_transportation_statistics/2001/table_04_46"
     },
     {
      "year": 1998,
      "value": 0.02,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "",
      "source": "US EPA, National Air Pollutant Emission Trends Update 1970-1997, as tabulated in BTS National Transportation Statistics 2001, Table 4-46 (Estimated National Emissions of Lead)",
      "url": "https://www.bts.gov/archive/publications/national_transportation_statistics/2001/table_04_46"
     },
     {
      "year": 1999,
      "value": 0.02,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "",
      "source": "US EPA, National Air Pollutant Emission Trends Update 1970-1997, as tabulated in BTS National Transportation Statistics 2001, Table 4-46 (Estimated National Emissions of Lead)",
      "url": "https://www.bts.gov/archive/publications/national_transportation_statistics/2001/table_04_46"
     }
    ],
    "featured": true
   },
   {
    "key": "us-gasoline-lead-content",
    "fix": "lead",
    "label": "Lead content of US leaded gasoline",
    "direction": "context",
    "unit": "grams of lead per leaded gallon",
    "kind": "level",
    "geography": "US",
    "method": "Average lead content (1973) and the EPA regulatory limit for leaded gasoline thereafter; 0 marks the on-road sales ban.",
    "source": "US EPA Journal, Vol. 11 No. 4, May 1985, Phasing Down Lead in Gasoline",
    "url": "https://epaalumni.org/userdata/pdf/1985-05-93000E80.PDF",
    "points": [
     {
      "year": 1973,
      "value": null,
      "low": 2,
      "high": 3,
      "projected": false,
      "estimate": true,
      "note": "Average actual content, 2 to 3 grams per gallon; EPA gives only the range.",
      "source": "US EPA press release, EPA Takes Final Step in Phaseout of Leaded Gasoline, January 29, 1996",
      "url": "https://www.epa.gov/archive/epa/aboutepa/epa-takes-final-step-phaseout-leaded-gasoline.html"
     },
     {
      "year": 1984,
      "value": 1.1,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "Standard in force before July 1, 1985 (1.1 gplg).",
      "source": "US EPA Journal, Vol. 11 No. 4, May 1985, Phasing Down Lead in Gasoline",
      "url": "https://epaalumni.org/userdata/pdf/1985-05-93000E80.PDF"
     },
     {
      "year": 1985,
      "value": 0.5,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "Standard from July 1, 1985.",
      "source": "US EPA Journal, Vol. 11 No. 4, May 1985, Phasing Down Lead in Gasoline",
      "url": "https://epaalumni.org/userdata/pdf/1985-05-93000E80.PDF"
     },
     {
      "year": 1986,
      "value": 0.1,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "Standard from January 1, 1986.",
      "source": "US EPA Journal, Vol. 11 No. 4, May 1985, Phasing Down Lead in Gasoline",
      "url": "https://epaalumni.org/userdata/pdf/1985-05-93000E80.PDF"
     },
     {
      "year": 1996,
      "value": 0,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "Clean Air Act ban on leaded fuel for on-road vehicles effective January 1, 1996; off-road uses (aviation, racing, farm, marine) still allowed.",
      "source": "US EPA press release, EPA Takes Final Step in Phaseout of Leaded Gasoline, January 29, 1996",
      "url": "https://www.epa.gov/archive/epa/aboutepa/epa-takes-final-step-phaseout-leaded-gasoline.html"
     }
    ],
    "featured": true
   },
   {
    "key": "us-child-blood-lead-median",
    "fix": "lead",
    "label": "Median blood lead, US children ages 1 to 5",
    "direction": "harm",
    "unit": "micrograms per deciliter (ug/dL)",
    "kind": "level",
    "geography": "US",
    "method": "Median blood lead concentration measured in nationally representative NHANES samples of children ages 1 to 5.",
    "source": "US EPA, America's Children and the Environment, Table B1 (data: CDC NCHS and NCEH, NHANES), August 2019 update",
    "url": "https://19january2021snapshot.epa.gov/sites/static/files/2019-07/documents/biomonitoring-lead-data.pdf",
    "points": [
     {
      "year": 1978,
      "value": 15.0,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "NHANES survey period 1976-1980; year is the period midpoint rounded down.",
      "source": "US EPA, America's Children and the Environment, Table B1 (data: CDC NCHS and NCEH, NHANES), August 2019 update",
      "url": "https://19january2021snapshot.epa.gov/sites/static/files/2019-07/documents/biomonitoring-lead-data.pdf"
     },
     {
      "year": 1989,
      "value": 3.5,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "NHANES survey period 1988-1991; year is the period midpoint rounded down.",
      "source": "US EPA, America's Children and the Environment, Table B1 (data: CDC NCHS and NCEH, NHANES), August 2019 update",
      "url": "https://19january2021snapshot.epa.gov/sites/static/files/2019-07/documents/biomonitoring-lead-data.pdf"
     },
     {
      "year": 1992,
      "value": 2.6,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "NHANES survey period 1991-1994; year is the period midpoint rounded down.",
      "source": "US EPA, America's Children and the Environment, Table B1 (data: CDC NCHS and NCEH, NHANES), August 2019 update",
      "url": "https://19january2021snapshot.epa.gov/sites/static/files/2019-07/documents/biomonitoring-lead-data.pdf"
     },
     {
      "year": 1999,
      "value": 2.2,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "NHANES survey period 1999-2000; year is the period midpoint rounded down.",
      "source": "US EPA, America's Children and the Environment, Table B1 (data: CDC NCHS and NCEH, NHANES), August 2019 update",
      "url": "https://19january2021snapshot.epa.gov/sites/static/files/2019-07/documents/biomonitoring-lead-data.pdf"
     },
     {
      "year": 2001,
      "value": 1.6,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "NHANES survey period 2001-2002; year is the period midpoint rounded down.",
      "source": "US EPA, America's Children and the Environment, Table B1 (data: CDC NCHS and NCEH, NHANES), August 2019 update",
      "url": "https://19january2021snapshot.epa.gov/sites/static/files/2019-07/documents/biomonitoring-lead-data.pdf"
     },
     {
      "year": 2003,
      "value": 1.6,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "NHANES survey period 2003-2004; year is the period midpoint rounded down.",
      "source": "US EPA, America's Children and the Environment, Table B1 (data: CDC NCHS and NCEH, NHANES), August 2019 update",
      "url": "https://19january2021snapshot.epa.gov/sites/static/files/2019-07/documents/biomonitoring-lead-data.pdf"
     },
     {
      "year": 2005,
      "value": 1.4,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "NHANES survey period 2005-2006; year is the period midpoint rounded down.",
      "source": "US EPA, America's Children and the Environment, Table B1 (data: CDC NCHS and NCEH, NHANES), August 2019 update",
      "url": "https://19january2021snapshot.epa.gov/sites/static/files/2019-07/documents/biomonitoring-lead-data.pdf"
     },
     {
      "year": 2007,
      "value": 1.4,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "NHANES survey period 2007-2008; year is the period midpoint rounded down.",
      "source": "US EPA, America's Children and the Environment, Table B1 (data: CDC NCHS and NCEH, NHANES), August 2019 update",
      "url": "https://19january2021snapshot.epa.gov/sites/static/files/2019-07/documents/biomonitoring-lead-data.pdf"
     },
     {
      "year": 2009,
      "value": 1.2,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "NHANES survey period 2009-2010; year is the period midpoint rounded down.",
      "source": "US EPA, America's Children and the Environment, Table B1 (data: CDC NCHS and NCEH, NHANES), August 2019 update",
      "url": "https://19january2021snapshot.epa.gov/sites/static/files/2019-07/documents/biomonitoring-lead-data.pdf"
     },
     {
      "year": 2011,
      "value": 1.0,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "NHANES survey period 2011-2012; year is the period midpoint rounded down.",
      "source": "US EPA, America's Children and the Environment, Table B1 (data: CDC NCHS and NCEH, NHANES), August 2019 update",
      "url": "https://19january2021snapshot.epa.gov/sites/static/files/2019-07/documents/biomonitoring-lead-data.pdf"
     },
     {
      "year": 2013,
      "value": 0.7,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "NHANES survey period 2013-2014; year is the period midpoint rounded down.",
      "source": "US EPA, America's Children and the Environment, Table B1 (data: CDC NCHS and NCEH, NHANES), August 2019 update",
      "url": "https://19january2021snapshot.epa.gov/sites/static/files/2019-07/documents/biomonitoring-lead-data.pdf"
     },
     {
      "year": 2015,
      "value": 0.7,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "NHANES survey period 2015-2016; year is the period midpoint rounded down.",
      "source": "US EPA, America's Children and the Environment, Table B1 (data: CDC NCHS and NCEH, NHANES), August 2019 update",
      "url": "https://19january2021snapshot.epa.gov/sites/static/files/2019-07/documents/biomonitoring-lead-data.pdf"
     },
     {
      "year": 2018,
      "value": 0.6,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "NHANES survey period 2017-2020 (pandemic-shortened cycle); year is the period midpoint rounded down.",
      "source": "US EPA, America's Children and the Environment, Biomonitoring: Lead (Indicator B1), web update 2023",
      "url": "https://www.epa.gov/americaschildrenenvironment/biomonitoring-lead"
     }
    ],
    "featured": true
   },
   {
    "key": "us-cohort-share-childhood-bll-over-5",
    "fix": "lead",
    "label": "Share of each US birth cohort with early childhood blood lead above 5 ug/dL",
    "direction": "harm",
    "unit": "percent of birth cohort (alive in 2015)",
    "kind": "level",
    "geography": "US",
    "method": "Modeled share of people alive in 2015, by 5-year birth cohort, whose early childhood blood lead exceeded 5 ug/dL; pre-1976 levels imputed from leaded gasoline consumption.",
    "source": "McFarland MJ, Hauer ME, Reuben A. Half of US population exposed to adverse lead levels in early childhood. PNAS 2022;119(11):e2118631119",
    "url": "https://www.pnas.org/doi/10.1073/pnas.2118631119",
    "points": [
     {
      "year": 1940,
      "value": 50.9,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "Birth cohort 1940-1945; year is the first birth year. 80% CI margin of error: plus or minus 152,093 people (Table 2).",
      "source": "McFarland MJ, Hauer ME, Reuben A. Half of US population exposed to adverse lead levels in early childhood. PNAS 2022;119(11):e2118631119",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC8931364/"
     },
     {
      "year": 1946,
      "value": 62.8,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "Birth cohort 1946-1950; year is the first birth year. 80% CI margin of error: plus or minus 225,690 people (Table 2).",
      "source": "McFarland MJ, Hauer ME, Reuben A. Half of US population exposed to adverse lead levels in early childhood. PNAS 2022;119(11):e2118631119",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC8931364/"
     },
     {
      "year": 1951,
      "value": 89.6,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "Birth cohort 1951-1955; year is the first birth year. 80% CI margin of error: plus or minus 301,423 people (Table 2).",
      "source": "McFarland MJ, Hauer ME, Reuben A. Half of US population exposed to adverse lead levels in early childhood. PNAS 2022;119(11):e2118631119",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC8931364/"
     },
     {
      "year": 1956,
      "value": 93.7,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "Birth cohort 1956-1960; year is the first birth year. 80% CI margin of error: plus or minus 341,126 people (Table 2).",
      "source": "McFarland MJ, Hauer ME, Reuben A. Half of US population exposed to adverse lead levels in early childhood. PNAS 2022;119(11):e2118631119",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC8931364/"
     },
     {
      "year": 1961,
      "value": 97.1,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "Birth cohort 1961-1965; year is the first birth year. 80% CI margin of error: plus or minus 403,448 people (Table 2).",
      "source": "McFarland MJ, Hauer ME, Reuben A. Half of US population exposed to adverse lead levels in early childhood. PNAS 2022;119(11):e2118631119",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC8931364/"
     },
     {
      "year": 1966,
      "value": 100.0,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "Birth cohort 1966-1970; year is the first birth year. 80% CI margin of error: plus or minus 775,766 people (Table 2).",
      "source": "McFarland MJ, Hauer ME, Reuben A. Half of US population exposed to adverse lead levels in early childhood. PNAS 2022;119(11):e2118631119",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC8931364/"
     },
     {
      "year": 1971,
      "value": 100.0,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "Birth cohort 1971-1975; year is the first birth year. 80% CI margin of error: plus or minus 755,208 people (Table 2).",
      "source": "McFarland MJ, Hauer ME, Reuben A. Half of US population exposed to adverse lead levels in early childhood. PNAS 2022;119(11):e2118631119",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC8931364/"
     },
     {
      "year": 1976,
      "value": 99.0,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "Birth cohort 1976-1980; year is the first birth year. 80% CI margin of error: plus or minus 100,549 people (Table 2).",
      "source": "McFarland MJ, Hauer ME, Reuben A. Half of US population exposed to adverse lead levels in early childhood. PNAS 2022;119(11):e2118631119",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC8931364/"
     },
     {
      "year": 1981,
      "value": 72.5,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "Birth cohort 1981-1985; year is the first birth year. 80% CI margin of error: plus or minus 246,715 people (Table 2).",
      "source": "McFarland MJ, Hauer ME, Reuben A. Half of US population exposed to adverse lead levels in early childhood. PNAS 2022;119(11):e2118631119",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC8931364/"
     },
     {
      "year": 1986,
      "value": 37.0,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "Birth cohort 1986-1990; year is the first birth year. 80% CI margin of error: plus or minus 289,680 people (Table 2).",
      "source": "McFarland MJ, Hauer ME, Reuben A. Half of US population exposed to adverse lead levels in early childhood. PNAS 2022;119(11):e2118631119",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC8931364/"
     },
     {
      "year": 1991,
      "value": 23.8,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "Birth cohort 1991-1995; year is the first birth year. 80% CI margin of error: plus or minus 298,058 people (Table 2).",
      "source": "McFarland MJ, Hauer ME, Reuben A. Half of US population exposed to adverse lead levels in early childhood. PNAS 2022;119(11):e2118631119",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC8931364/"
     },
     {
      "year": 1996,
      "value": 13.1,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "Birth cohort 1996-2000; year is the first birth year. 80% CI margin of error: plus or minus 266,359 people (Table 2).",
      "source": "McFarland MJ, Hauer ME, Reuben A. Half of US population exposed to adverse lead levels in early childhood. PNAS 2022;119(11):e2118631119",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC8931364/"
     },
     {
      "year": 2001,
      "value": 6.2,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "Birth cohort 2001-2005; year is the first birth year. 80% CI margin of error: plus or minus 122,263 people (Table 2).",
      "source": "McFarland MJ, Hauer ME, Reuben A. Half of US population exposed to adverse lead levels in early childhood. PNAS 2022;119(11):e2118631119",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC8931364/"
     },
     {
      "year": 2006,
      "value": 2.9,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "Birth cohort 2006-2010; year is the first birth year. 80% CI margin of error: plus or minus 93,538 people (Table 2).",
      "source": "McFarland MJ, Hauer ME, Reuben A. Half of US population exposed to adverse lead levels in early childhood. PNAS 2022;119(11):e2118631119",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC8931364/"
     },
     {
      "year": 2011,
      "value": 1.4,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "Birth cohort 2011-2015; year is the first birth year. 80% CI margin of error: plus or minus 67,586 people (Table 2).",
      "source": "McFarland MJ, Hauer ME, Reuben A. Half of US population exposed to adverse lead levels in early childhood. PNAS 2022;119(11):e2118631119",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC8931364/"
     }
    ],
    "featured": true
   },
   {
    "key": "afeas-cfc11-cfc12-production",
    "fix": "cfc",
    "label": "Global production of CFC-11 and CFC-12 (Freon)",
    "direction": "context",
    "unit": "metric tons per year",
    "kind": "flow",
    "geography": "world",
    "method": "Sum of the two AFEAS production columns for CFC-11 and CFC-12, the main Freon compounds; AFEAS covers reporting producers only and misses some later output (for example in developing countries), so post-1990 values understate world totals.",
    "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
    "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf",
    "points": [
     {
      "year": 1931,
      "value": 544,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-12 only (544); no CFC-11 reported. Archived copy: https://web.archive.org/web/2010/https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1932,
      "value": 136,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-12 only (136); no CFC-11 reported.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1933,
      "value": 318,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-12 only (318); no CFC-11 reported.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1934,
      "value": 725,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 45 + CFC-12 680.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1935,
      "value": 1043,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 45 + CFC-12 998.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1936,
      "value": 1815,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 91 + CFC-12 1,724.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1937,
      "value": 3220,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 136 + CFC-12 3,084.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1938,
      "value": 2903,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 91 + CFC-12 2,812.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1939,
      "value": 4037,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 91 + CFC-12 3,946.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1940,
      "value": 4717,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 181 + CFC-12 4,536.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1941,
      "value": 6532,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 272 + CFC-12 6,260.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1942,
      "value": 6260,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 318 + CFC-12 5,942.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1943,
      "value": 8618,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 408 + CFC-12 8,210.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1944,
      "value": 17101,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 363 + CFC-12 16,738.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1945,
      "value": 20457,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 363 + CFC-12 20,094.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1946,
      "value": 17373,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 726 + CFC-12 16,647.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1947,
      "value": 21455,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 1,315 + CFC-12 20,140.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1948,
      "value": 27760,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 2,994 + CFC-12 24,766.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1949,
      "value": 30618,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 4,491 + CFC-12 26,127.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1950,
      "value": 41187,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 6,623 + CFC-12 34,564.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1951,
      "value": 45314,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 9,072 + CFC-12 36,242.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1952,
      "value": 50802,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 13,562 + CFC-12 37,240.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1953,
      "value": 63775,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 17,282 + CFC-12 46,493.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1954,
      "value": 70035,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 20,911 + CFC-12 49,124.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1955,
      "value": 83869,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 26,263 + CFC-12 57,606.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1956,
      "value": 101151,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 32,477 + CFC-12 68,674.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1957,
      "value": 108092,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 33,929 + CFC-12 74,163.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1958,
      "value": 102966,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 29,529 + CFC-12 73,437.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1959,
      "value": 123151,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 35,562 + CFC-12 87,589.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1960,
      "value": 149142,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 49,714 + CFC-12 99,428.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1961,
      "value": 168963,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 60,464 + CFC-12 108,499.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1962,
      "value": 206204,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 78,109 + CFC-12 128,095.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1963,
      "value": 239724,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 93,304 + CFC-12 146,420.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1964,
      "value": 281182,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 111,085 + CFC-12 170,097.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1965,
      "value": 312889,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 122,833 + CFC-12 190,056.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1966,
      "value": 357204,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 141,022 + CFC-12 216,182.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1967,
      "value": 402519,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 159,756 + CFC-12 242,763.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1968,
      "value": 450600,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 183,116 + CFC-12 267,484.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1969,
      "value": 514556,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 217,271 + CFC-12 297,285.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1970,
      "value": 559235,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 238,136 + CFC-12 321,099.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1971,
      "value": 604731,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 263,175 + CFC-12 341,556.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1972,
      "value": 686740,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 306,856 + CFC-12 379,884.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1973,
      "value": 772423,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 349,085 + CFC-12 423,338.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1974,
      "value": 812522,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 369,724 + CFC-12 442,798.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1975,
      "value": 695041,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 314,068 + CFC-12 380,973.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1976,
      "value": 750561,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 339,832 + CFC-12 410,729.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1977,
      "value": 703297,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 320,464 + CFC-12 382,833.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1978,
      "value": 680934,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 308,852 + CFC-12 372,082.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1979,
      "value": 646642,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 289,483 + CFC-12 357,159.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1980,
      "value": 639838,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 289,619 + CFC-12 350,219.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1981,
      "value": 638251,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 286,943 + CFC-12 351,308.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1982,
      "value": 599482,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 271,443 + CFC-12 328,039.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1983,
      "value": 647062,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 291,731 + CFC-12 355,331.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1984,
      "value": 694462,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 312,355 + CFC-12 382,107.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1985,
      "value": 703153,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 326,814 + CFC-12 376,339.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1986,
      "value": 748511,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 350,148 + CFC-12 398,363.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1987,
      "value": 806776,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 382,050 + CFC-12 424,726.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1988,
      "value": 796988,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 375,986 + CFC-12 421,002.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1989,
      "value": 682267,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 302,489 + CFC-12 379,778.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1990,
      "value": 463866,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 232,916 + CFC-12 230,950.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1991,
      "value": 438291,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 213,486 + CFC-12 224,805.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1992,
      "value": 402641,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 186,434 + CFC-12 216,207.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1993,
      "value": 361795,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 147,131 + CFC-12 214,664.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1994,
      "value": 193832,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 60,232 + CFC-12 133,600.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1995,
      "value": 115505,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 32,683 + CFC-12 82,822.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1996,
      "value": 70979,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 22,123 + CFC-12 48,856.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1997,
      "value": 51477,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 18,577 + CFC-12 32,900.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1998,
      "value": 47869,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 14,600 + CFC-12 33,269.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 1999,
      "value": 40003,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 12,871 + CFC-12 27,132.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     },
     {
      "year": 2000,
      "value": 34464,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "CFC-11 9,900 + CFC-12 24,564.",
      "source": "AFEAS, Annual Global Fluorocarbon Production (metric tons), as posted by UNFCCC",
      "url": "https://unfccc.int/files/methods/other_methodological_issues/interactions_with_ozone_layer/application/pdf/afeasprod.pdf"
     }
    ],
    "featured": true
   },
   {
    "key": "antarctic-ozone-hole-max-area",
    "fix": "cfc",
    "label": "Antarctic ozone hole, maximum area each year",
    "direction": "harm",
    "unit": "million square kilometers",
    "kind": "level",
    "geography": "Antarctica",
    "method": "Largest single-day area with total column ozone below 220 Dobson units over the Southern Hemisphere each season, from satellite data.",
    "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
    "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html",
    "points": [
     {
      "year": 1979,
      "value": 1.1,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 1980,
      "value": 3.3,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 1981,
      "value": 3.1,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 1982,
      "value": 10.8,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 1983,
      "value": 12.2,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 1984,
      "value": 14.7,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 1985,
      "value": 18.8,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 1986,
      "value": 14.4,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 1987,
      "value": 22.5,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 1988,
      "value": 13.8,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 1989,
      "value": 21.7,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 1990,
      "value": 21.1,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 1991,
      "value": 22.6,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 1992,
      "value": 24.9,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 1993,
      "value": 25.8,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 1994,
      "value": 25.2,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 1996,
      "value": 26.9,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "NASA lists no value for 1995.",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 1997,
      "value": 25.1,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 1998,
      "value": 27.9,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 1999,
      "value": 25.8,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 2000,
      "value": 29.9,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 2001,
      "value": 26.5,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 2002,
      "value": 21.9,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 2003,
      "value": 28.4,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 2004,
      "value": 22.8,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 2005,
      "value": 27.2,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 2006,
      "value": 29.6,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 2007,
      "value": 25.2,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 2008,
      "value": 27.0,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 2009,
      "value": 24.4,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 2010,
      "value": 22.6,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 2011,
      "value": 26.1,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 2012,
      "value": 21.1,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 2013,
      "value": 24.0,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 2014,
      "value": 24.1,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 2015,
      "value": 28.2,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 2016,
      "value": 22.8,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 2017,
      "value": 19.6,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 2018,
      "value": 24.8,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 2019,
      "value": 16.4,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 2020,
      "value": 24.8,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 2021,
      "value": 24.8,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 2022,
      "value": 26.5,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 2023,
      "value": 26.0,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 2024,
      "value": 22.4,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     },
     {
      "year": 2025,
      "value": 22.9,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NASA Ozone Watch, Annual Records (maximum Antarctic ozone hole area)",
      "url": "https://ozonewatch.gsfc.nasa.gov/statistics/annual_data.html"
     }
    ],
    "featured": true
   },
   {
    "key": "antarctic-odgi",
    "fix": "cfc",
    "label": "Antarctic Ozone Depleting Gas Index (100 = peak, 0 = 1980 level)",
    "direction": "harm",
    "unit": "index (0 to 100)",
    "kind": "level",
    "geography": "Antarctica",
    "method": "NOAA index of how far Antarctic EESC sits between its 1980 benchmark (0) and its 2001 to 2002 peak (100); the projected 0 marks recovery to 1980 chemistry.",
    "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
    "url": "https://gml.noaa.gov/odgi/",
    "points": [
     {
      "year": 1992,
      "value": 69.6,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 1993,
      "value": 75.7,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 1994,
      "value": 81.6,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 1995,
      "value": 86.8,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 1996,
      "value": 91.1,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 1997,
      "value": 94.5,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 1998,
      "value": 96.8,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 1999,
      "value": 98.4,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2000,
      "value": 99.4,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2001,
      "value": 100.0,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2002,
      "value": 100.0,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2003,
      "value": 99.3,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2004,
      "value": 98.3,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2005,
      "value": 97.1,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2006,
      "value": 95.9,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2007,
      "value": 94.6,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2008,
      "value": 93.3,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2009,
      "value": 91.9,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2010,
      "value": 90.6,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2011,
      "value": 89.1,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2012,
      "value": 87.5,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2013,
      "value": 86.0,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2014,
      "value": 84.6,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2015,
      "value": 83.2,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2016,
      "value": 81.7,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2017,
      "value": 80.4,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2018,
      "value": 79.2,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2019,
      "value": 78.0,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2020,
      "value": 76.7,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2021,
      "value": 75.4,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2022,
      "value": 74.2,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2023,
      "value": 72.9,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2024,
      "value": 71.6,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2070,
      "value": 0.0,
      "low": null,
      "high": null,
      "projected": true,
      "estimate": true,
      "note": "Projection: Antarctic index returns to 0 (the 1980 benchmark) sometime around 2070, assuming full Montreal Protocol compliance.",
      "source": "NOAA Global Monitoring Laboratory, ODGI page, citing WMO/UNEP 2022 scenarios",
      "url": "https://gml.noaa.gov/odgi/"
     }
    ],
    "featured": true
   },
   {
    "key": "cfc-radiative-forcing",
    "fix": "cfc",
    "label": "Global warming effect of CFCs (radiative forcing)",
    "direction": "harm",
    "unit": "watts per square meter",
    "kind": "level",
    "geography": "world",
    "method": "Direct radiative forcing from atmospheric CFCs relative to 1750; CFCs are potent greenhouse gases as well as ozone destroyers. For scale, CO2 was 1.054 in 1979.",
    "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
    "url": "https://gml.noaa.gov/aggi/aggi.html",
    "points": [
     {
      "year": 1979,
      "value": 0.194,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "NOAA 'CFCs' column (CFC-12, CFC-11 and minor CFCs).",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 1980,
      "value": 0.204,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 1981,
      "value": 0.215,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 1982,
      "value": 0.226,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 1983,
      "value": 0.237,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 1984,
      "value": 0.248,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 1985,
      "value": 0.26,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 1986,
      "value": 0.273,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 1987,
      "value": 0.287,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 1988,
      "value": 0.304,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 1989,
      "value": 0.317,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 1990,
      "value": 0.327,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 1991,
      "value": 0.335,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 1992,
      "value": 0.343,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 1993,
      "value": 0.346,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 1994,
      "value": 0.348,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 1995,
      "value": 0.349,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 1996,
      "value": 0.35,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 1997,
      "value": 0.35,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 1998,
      "value": 0.35,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 1999,
      "value": 0.35,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 2000,
      "value": 0.349,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 2001,
      "value": 0.348,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 2002,
      "value": 0.347,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 2003,
      "value": 0.345,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 2004,
      "value": 0.344,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 2005,
      "value": 0.342,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 2006,
      "value": 0.34,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 2007,
      "value": 0.338,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 2008,
      "value": 0.336,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 2009,
      "value": 0.334,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 2010,
      "value": 0.331,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 2011,
      "value": 0.329,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 2012,
      "value": 0.327,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 2013,
      "value": 0.324,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 2014,
      "value": 0.322,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 2015,
      "value": 0.32,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 2016,
      "value": 0.318,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 2017,
      "value": 0.316,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 2018,
      "value": 0.314,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 2019,
      "value": 0.312,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 2020,
      "value": 0.309,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 2021,
      "value": 0.306,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 2022,
      "value": 0.303,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 2023,
      "value": 0.301,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     },
     {
      "year": 2024,
      "value": 0.298,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Annual Greenhouse Gas Index (AGGI), Table 2",
      "url": "https://gml.noaa.gov/aggi/aggi.html"
     }
    ],
    "featured": true
   },
   {
    "key": "us-lead-in-gasoline",
    "fix": "lead",
    "label": "Lead burned in US gasoline",
    "direction": "harm",
    "unit": "tons of lead per year (as stated by EPA)",
    "kind": "flow",
    "geography": "US",
    "method": "Approximate tonnage of lead added to US gasoline in a year, as stated by EPA.",
    "source": "US EPA press release, EPA Takes Final Step in Phaseout of Leaded Gasoline, January 29, 1996",
    "url": "https://www.epa.gov/archive/epa/aboutepa/epa-takes-final-step-phaseout-leaded-gasoline.html",
    "points": [
     {
      "year": 1973,
      "value": 200000,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "EPA: about 200,000 tons of lead a year in 1973 (average 2 to 3 grams per gallon).",
      "source": "US EPA press release, EPA Takes Final Step in Phaseout of Leaded Gasoline, January 29, 1996",
      "url": "https://www.epa.gov/archive/epa/aboutepa/epa-takes-final-step-phaseout-leaded-gasoline.html"
     },
     {
      "year": 1995,
      "value": 2000,
      "low": null,
      "high": 2000,
      "projected": false,
      "estimate": true,
      "note": "EPA: under 2,000 tons a year; leaded fuel was 0.6 percent of gasoline sales. Value is an upper bound.",
      "source": "US EPA press release, EPA Takes Final Step in Phaseout of Leaded Gasoline, January 29, 1996",
      "url": "https://www.epa.gov/archive/epa/aboutepa/epa-takes-final-step-phaseout-leaded-gasoline.html"
     }
    ]
   },
   {
    "key": "us-child-blood-lead-p95",
    "fix": "lead",
    "label": "95th percentile blood lead, US children ages 1 to 5",
    "direction": "harm",
    "unit": "micrograms per deciliter (ug/dL)",
    "kind": "level",
    "geography": "US",
    "method": "95th percentile blood lead concentration in NHANES samples of children ages 1 to 5 (the most exposed 5 percent).",
    "source": "US EPA, America's Children and the Environment, Table B1 (data: CDC NCHS and NCEH, NHANES), August 2019 update",
    "url": "https://19january2021snapshot.epa.gov/sites/static/files/2019-07/documents/biomonitoring-lead-data.pdf",
    "points": [
     {
      "year": 1978,
      "value": 29.0,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "NHANES survey period 1976-1980; year is the period midpoint rounded down.",
      "source": "US EPA, America's Children and the Environment, Table B1 (data: CDC NCHS and NCEH, NHANES), August 2019 update",
      "url": "https://19january2021snapshot.epa.gov/sites/static/files/2019-07/documents/biomonitoring-lead-data.pdf"
     },
     {
      "year": 1989,
      "value": 12.0,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "NHANES survey period 1988-1991; year is the period midpoint rounded down.",
      "source": "US EPA, America's Children and the Environment, Table B1 (data: CDC NCHS and NCEH, NHANES), August 2019 update",
      "url": "https://19january2021snapshot.epa.gov/sites/static/files/2019-07/documents/biomonitoring-lead-data.pdf"
     },
     {
      "year": 1992,
      "value": 9.7,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "NHANES survey period 1991-1994; year is the period midpoint rounded down.",
      "source": "US EPA, America's Children and the Environment, Table B1 (data: CDC NCHS and NCEH, NHANES), August 2019 update",
      "url": "https://19january2021snapshot.epa.gov/sites/static/files/2019-07/documents/biomonitoring-lead-data.pdf"
     },
     {
      "year": 1999,
      "value": 7.0,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "NHANES survey period 1999-2000; year is the period midpoint rounded down.",
      "source": "US EPA, America's Children and the Environment, Table B1 (data: CDC NCHS and NCEH, NHANES), August 2019 update",
      "url": "https://19january2021snapshot.epa.gov/sites/static/files/2019-07/documents/biomonitoring-lead-data.pdf"
     },
     {
      "year": 2001,
      "value": 5.8,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "NHANES survey period 2001-2002; year is the period midpoint rounded down.",
      "source": "US EPA, America's Children and the Environment, Table B1 (data: CDC NCHS and NCEH, NHANES), August 2019 update",
      "url": "https://19january2021snapshot.epa.gov/sites/static/files/2019-07/documents/biomonitoring-lead-data.pdf"
     },
     {
      "year": 2003,
      "value": 5.1,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "NHANES survey period 2003-2004; year is the period midpoint rounded down.",
      "source": "US EPA, America's Children and the Environment, Table B1 (data: CDC NCHS and NCEH, NHANES), August 2019 update",
      "url": "https://19january2021snapshot.epa.gov/sites/static/files/2019-07/documents/biomonitoring-lead-data.pdf"
     },
     {
      "year": 2005,
      "value": 3.8,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "NHANES survey period 2005-2006; year is the period midpoint rounded down.",
      "source": "US EPA, America's Children and the Environment, Table B1 (data: CDC NCHS and NCEH, NHANES), August 2019 update",
      "url": "https://19january2021snapshot.epa.gov/sites/static/files/2019-07/documents/biomonitoring-lead-data.pdf"
     },
     {
      "year": 2007,
      "value": 4.1,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "NHANES survey period 2007-2008; year is the period midpoint rounded down.",
      "source": "US EPA, America's Children and the Environment, Table B1 (data: CDC NCHS and NCEH, NHANES), August 2019 update",
      "url": "https://19january2021snapshot.epa.gov/sites/static/files/2019-07/documents/biomonitoring-lead-data.pdf"
     },
     {
      "year": 2009,
      "value": 3.4,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "NHANES survey period 2009-2010; year is the period midpoint rounded down.",
      "source": "US EPA, America's Children and the Environment, Table B1 (data: CDC NCHS and NCEH, NHANES), August 2019 update",
      "url": "https://19january2021snapshot.epa.gov/sites/static/files/2019-07/documents/biomonitoring-lead-data.pdf"
     },
     {
      "year": 2011,
      "value": 2.9,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "NHANES survey period 2011-2012; year is the period midpoint rounded down.",
      "source": "US EPA, America's Children and the Environment, Table B1 (data: CDC NCHS and NCEH, NHANES), August 2019 update",
      "url": "https://19january2021snapshot.epa.gov/sites/static/files/2019-07/documents/biomonitoring-lead-data.pdf"
     },
     {
      "year": 2013,
      "value": 2.2,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "NHANES survey period 2013-2014; year is the period midpoint rounded down.",
      "source": "US EPA, America's Children and the Environment, Table B1 (data: CDC NCHS and NCEH, NHANES), August 2019 update",
      "url": "https://19january2021snapshot.epa.gov/sites/static/files/2019-07/documents/biomonitoring-lead-data.pdf"
     },
     {
      "year": 2015,
      "value": 2.8,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "NHANES survey period 2015-2016; year is the period midpoint rounded down.",
      "source": "US EPA, America's Children and the Environment, Table B1 (data: CDC NCHS and NCEH, NHANES), August 2019 update",
      "url": "https://19january2021snapshot.epa.gov/sites/static/files/2019-07/documents/biomonitoring-lead-data.pdf"
     }
    ]
   },
   {
    "key": "us-iq-points-lost-living-population",
    "fix": "lead",
    "label": "Total IQ points lost to childhood lead among living Americans",
    "direction": "harm",
    "unit": "IQ points",
    "kind": "level",
    "geography": "US",
    "method": "Sum of lead-linked IQ deficits across the whole US population alive in the given year; falls over time as exposed cohorts die.",
    "source": "McFarland MJ, Hauer ME, Reuben A. Half of US population exposed to adverse lead levels in early childhood. PNAS 2022;119(11):e2118631119",
    "url": "https://www.pnas.org/doi/10.1073/pnas.2118631119",
    "points": [
     {
      "year": 2015,
      "value": 824097690,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "Average 2.6 IQ points per person; over 170 million people had early childhood blood lead above 5 ug/dL.",
      "source": "McFarland MJ, Hauer ME, Reuben A. Half of US population exposed to adverse lead levels in early childhood. PNAS 2022;119(11):e2118631119",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC8931364/"
     },
     {
      "year": 2030,
      "value": 709054633,
      "low": null,
      "high": null,
      "projected": true,
      "estimate": true,
      "note": "Projection; average 2.03 IQ points per person.",
      "source": "McFarland MJ, Hauer ME, Reuben A. Half of US population exposed to adverse lead levels in early childhood. PNAS 2022;119(11):e2118631119",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC8931364/"
     }
    ]
   },
   {
    "key": "us-iq-loss-per-person-by-cohort",
    "fix": "lead",
    "label": "Average IQ points lost per person, by birth cohort",
    "direction": "harm",
    "unit": "IQ points per person",
    "kind": "level",
    "geography": "US",
    "method": "Average lead-linked IQ deficit for people in a 5-year birth cohort (only the cohorts the paper reports in text).",
    "source": "McFarland MJ, Hauer ME, Reuben A. Half of US population exposed to adverse lead levels in early childhood. PNAS 2022;119(11):e2118631119",
    "url": "https://www.pnas.org/doi/10.1073/pnas.2118631119",
    "points": [
     {
      "year": 1961,
      "value": 4.8,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "Born 1961 to 1965.",
      "source": "McFarland MJ, Hauer ME, Reuben A. Half of US population exposed to adverse lead levels in early childhood. PNAS 2022;119(11):e2118631119",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC8931364/"
     },
     {
      "year": 1966,
      "value": 5.9,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "Born 1966 to 1970, the peak cohort (about 20.8 million people).",
      "source": "McFarland MJ, Hauer ME, Reuben A. Half of US population exposed to adverse lead levels in early childhood. PNAS 2022;119(11):e2118631119",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC8931364/"
     },
     {
      "year": 1971,
      "value": 5.7,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "Born 1971 to 1975.",
      "source": "McFarland MJ, Hauer ME, Reuben A. Half of US population exposed to adverse lead levels in early childhood. PNAS 2022;119(11):e2118631119",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC8931364/"
     }
    ]
   },
   {
    "key": "us-phasedown-benefits-excl-bp",
    "fix": "lead",
    "label": "Monetized harm avoided by the 1985 US lead phasedown (excluding blood pressure)",
    "direction": "harm",
    "unit": "million US dollars per year (1983 dollars, see note)",
    "kind": "flow",
    "geography": "US",
    "method": "EPA estimate of annual benefits of cutting gasoline lead: children's health, conventional pollutants, vehicle maintenance and fuel economy; equals harm leaded gasoline was causing at the margin.",
    "source": "US EPA Journal, Vol. 11 No. 4, May 1985, Phasing Down Lead in Gasoline",
    "url": "https://epaalumni.org/userdata/pdf/1985-05-93000E80.PDF",
    "points": [
     {
      "year": 1985,
      "value": 360,
      "low": null,
      "high": null,
      "projected": true,
      "estimate": true,
      "note": "Table 2 in Albert L. Nichols, EPA Journal May 1985. 1985 covers only the second half of the year at 0.5 gplg; 1986 and 1987 are full years at 0.1 gplg. Forecast at the time.",
      "source": "US EPA Journal, Vol. 11 No. 4, May 1985, Phasing Down Lead in Gasoline",
      "url": "https://epaalumni.org/userdata/pdf/1985-05-93000E80.PDF"
     },
     {
      "year": 1986,
      "value": 1924,
      "low": null,
      "high": null,
      "projected": true,
      "estimate": true,
      "note": "Table 2 in Albert L. Nichols, EPA Journal May 1985. 1985 covers only the second half of the year at 0.5 gplg; 1986 and 1987 are full years at 0.1 gplg. Forecast at the time. Children's health 600, conventional pollutants 222, maintenance 914, fuel economy 187.",
      "source": "US EPA Journal, Vol. 11 No. 4, May 1985, Phasing Down Lead in Gasoline",
      "url": "https://epaalumni.org/userdata/pdf/1985-05-93000E80.PDF"
     },
     {
      "year": 1987,
      "value": 1799,
      "low": null,
      "high": null,
      "projected": true,
      "estimate": true,
      "note": "Table 2 in Albert L. Nichols, EPA Journal May 1985. 1985 covers only the second half of the year at 0.5 gplg; 1986 and 1987 are full years at 0.1 gplg. Forecast at the time.",
      "source": "US EPA Journal, Vol. 11 No. 4, May 1985, Phasing Down Lead in Gasoline",
      "url": "https://epaalumni.org/userdata/pdf/1985-05-93000E80.PDF"
     }
    ]
   },
   {
    "key": "us-phasedown-adult-bp-benefits",
    "fix": "lead",
    "label": "Adult blood pressure benefits of the 1985 US lead phasedown (preliminary)",
    "direction": "harm",
    "unit": "million US dollars per year (1983 dollars, see note)",
    "kind": "flow",
    "geography": "US",
    "method": "EPA preliminary estimate of avoided hypertension, heart attacks, strokes and deaths in white men 40 to 59; EPA did not rely on it for the rule.",
    "source": "US EPA Journal, Vol. 11 No. 4, May 1985, Phasing Down Lead in Gasoline",
    "url": "https://epaalumni.org/userdata/pdf/1985-05-93000E80.PDF",
    "points": [
     {
      "year": 1985,
      "value": 1724,
      "low": null,
      "high": null,
      "projected": true,
      "estimate": true,
      "note": "Table 2 in Albert L. Nichols, EPA Journal May 1985. 1985 covers only the second half of the year at 0.5 gplg; 1986 and 1987 are full years at 0.1 gplg. Preliminary. Deaths avoided: 1,497.",
      "source": "US EPA Journal, Vol. 11 No. 4, May 1985, Phasing Down Lead in Gasoline",
      "url": "https://epaalumni.org/userdata/pdf/1985-05-93000E80.PDF"
     },
     {
      "year": 1986,
      "value": 5897,
      "low": null,
      "high": null,
      "projected": true,
      "estimate": true,
      "note": "Table 2 in Albert L. Nichols, EPA Journal May 1985. 1985 covers only the second half of the year at 0.5 gplg; 1986 and 1987 are full years at 0.1 gplg. Preliminary. Deaths avoided: 5,134.",
      "source": "US EPA Journal, Vol. 11 No. 4, May 1985, Phasing Down Lead in Gasoline",
      "url": "https://epaalumni.org/userdata/pdf/1985-05-93000E80.PDF"
     },
     {
      "year": 1987,
      "value": 5675,
      "low": null,
      "high": null,
      "projected": true,
      "estimate": true,
      "note": "Table 2 in Albert L. Nichols, EPA Journal May 1985. 1985 covers only the second half of the year at 0.5 gplg; 1986 and 1987 are full years at 0.1 gplg. Preliminary. Deaths avoided: 4,942.",
      "source": "US EPA Journal, Vol. 11 No. 4, May 1985, Phasing Down Lead in Gasoline",
      "url": "https://epaalumni.org/userdata/pdf/1985-05-93000E80.PDF"
     }
    ]
   },
   {
    "key": "us-children-over-25-avoided",
    "fix": "lead",
    "label": "US children kept below 25 ug/dL by the 1985 phasedown",
    "direction": "harm",
    "unit": "children per year",
    "kind": "flow",
    "geography": "US",
    "method": "EPA estimate of the reduction in the number of children with blood lead above 25 ug/dL (the CDC action level then).",
    "source": "US EPA Journal, Vol. 11 No. 4, May 1985, Phasing Down Lead in Gasoline",
    "url": "https://epaalumni.org/userdata/pdf/1985-05-93000E80.PDF",
    "points": [
     {
      "year": 1985,
      "value": 64000,
      "low": null,
      "high": null,
      "projected": true,
      "estimate": true,
      "note": "Table 2 in Albert L. Nichols, EPA Journal May 1985. 1985 covers only the second half of the year at 0.5 gplg; 1986 and 1987 are full years at 0.1 gplg.",
      "source": "US EPA Journal, Vol. 11 No. 4, May 1985, Phasing Down Lead in Gasoline",
      "url": "https://epaalumni.org/userdata/pdf/1985-05-93000E80.PDF"
     },
     {
      "year": 1986,
      "value": 172000,
      "low": null,
      "high": null,
      "projected": true,
      "estimate": true,
      "note": "Table 2 in Albert L. Nichols, EPA Journal May 1985. 1985 covers only the second half of the year at 0.5 gplg; 1986 and 1987 are full years at 0.1 gplg.",
      "source": "US EPA Journal, Vol. 11 No. 4, May 1985, Phasing Down Lead in Gasoline",
      "url": "https://epaalumni.org/userdata/pdf/1985-05-93000E80.PDF"
     },
     {
      "year": 1987,
      "value": 156000,
      "low": null,
      "high": null,
      "projected": true,
      "estimate": true,
      "note": "Table 2 in Albert L. Nichols, EPA Journal May 1985. 1985 covers only the second half of the year at 0.5 gplg; 1986 and 1987 are full years at 0.1 gplg.",
      "source": "US EPA Journal, Vol. 11 No. 4, May 1985, Phasing Down Lead in Gasoline",
      "url": "https://epaalumni.org/userdata/pdf/1985-05-93000E80.PDF"
     }
    ]
   },
   {
    "key": "us-refining-cost-of-removing-lead",
    "fix": "lead",
    "label": "Refining cost of replacing lead as an octane booster",
    "direction": "benefit",
    "unit": "million US dollars per year (1983 dollars, see note)",
    "kind": "flow",
    "geography": "US",
    "method": "EPA estimate of extra refinery cost to make octane without lead; the best available measure of the economic value lead provided to fuel makers.",
    "source": "US EPA Journal, Vol. 11 No. 4, May 1985, Phasing Down Lead in Gasoline",
    "url": "https://epaalumni.org/userdata/pdf/1985-05-93000E80.PDF",
    "points": [
     {
      "year": 1985,
      "value": 96,
      "low": null,
      "high": null,
      "projected": true,
      "estimate": true,
      "note": "Table 2 in Albert L. Nichols, EPA Journal May 1985. 1985 covers only the second half of the year at 0.5 gplg; 1986 and 1987 are full years at 0.1 gplg.",
      "source": "US EPA Journal, Vol. 11 No. 4, May 1985, Phasing Down Lead in Gasoline",
      "url": "https://epaalumni.org/userdata/pdf/1985-05-93000E80.PDF"
     },
     {
      "year": 1986,
      "value": 608,
      "low": null,
      "high": null,
      "projected": true,
      "estimate": true,
      "note": "Table 2 in Albert L. Nichols, EPA Journal May 1985. 1985 covers only the second half of the year at 0.5 gplg; 1986 and 1987 are full years at 0.1 gplg.",
      "source": "US EPA Journal, Vol. 11 No. 4, May 1985, Phasing Down Lead in Gasoline",
      "url": "https://epaalumni.org/userdata/pdf/1985-05-93000E80.PDF"
     },
     {
      "year": 1987,
      "value": 558,
      "low": null,
      "high": null,
      "projected": true,
      "estimate": true,
      "note": "Table 2 in Albert L. Nichols, EPA Journal May 1985. 1985 covers only the second half of the year at 0.5 gplg; 1986 and 1987 are full years at 0.1 gplg.",
      "source": "US EPA Journal, Vol. 11 No. 4, May 1985, Phasing Down Lead in Gasoline",
      "url": "https://epaalumni.org/userdata/pdf/1985-05-93000E80.PDF"
     }
    ]
   },
   {
    "key": "countries-using-leaded-petrol",
    "fix": "lead",
    "label": "Countries still selling leaded petrol",
    "direction": "context",
    "unit": "countries",
    "kind": "level",
    "geography": "world",
    "method": "Number of countries where leaded petrol was still in use.",
    "source": "UNEP press release, Era of leaded petrol over, eliminating a major threat to human and planetary health, 30 August 2021",
    "url": "https://www.unep.org/news-and-stories/press-release/era-leaded-petrol-over-eliminating-major-threat-human-and-planetary",
    "points": [
     {
      "year": 2002,
      "value": 117,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "When the Partnership for Clean Fuels and Vehicles launched. A UNEP program page gives 82 for the same year; the 2021 press release figure is used.",
      "source": "UNEP press release, Era of leaded petrol over, eliminating a major threat to human and planetary health, 30 August 2021",
      "url": "https://www.unep.org/news-and-stories/press-release/era-leaded-petrol-over-eliminating-major-threat-human-and-planetary"
     },
     {
      "year": 2021,
      "value": 0,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "Algeria, the last country, stopped selling leaded petrol in July 2021.",
      "source": "UNEP press release, Era of leaded petrol over, eliminating a major threat to human and planetary health, 30 August 2021",
      "url": "https://www.unep.org/news-and-stories/press-release/era-leaded-petrol-over-eliminating-major-threat-human-and-planetary"
     }
    ]
   },
   {
    "key": "world-cfc-consumption-odp",
    "fix": "cfc",
    "label": "World CFC consumption reported under the Montreal Protocol",
    "direction": "context",
    "unit": "ODP tonnes per year",
    "kind": "flow",
    "geography": "world",
    "method": "Production plus imports minus exports of CFCs reported by parties to the Montreal Protocol, weighted by ozone depletion potential.",
    "source": "UNEP Ozone Secretariat consumption data, via Our World in Data, Ozone-depleting substance consumption (CFC column)",
    "url": "https://ourworldindata.org/grapher/ozone-depleting-substance-consumption",
    "points": [
     {
      "year": 1986,
      "value": 1084638.5,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "UNEP Ozone Secretariat consumption data, via Our World in Data, Ozone-depleting substance consumption (CFC column)",
      "url": "https://ourworldindata.org/grapher/ozone-depleting-substance-consumption"
     },
     {
      "year": 1989,
      "value": 1041673.2,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "UNEP Ozone Secretariat consumption data, via Our World in Data, Ozone-depleting substance consumption (CFC column)",
      "url": "https://ourworldindata.org/grapher/ozone-depleting-substance-consumption"
     },
     {
      "year": 1990,
      "value": 732449.2,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "UNEP Ozone Secretariat consumption data, via Our World in Data, Ozone-depleting substance consumption (CFC column)",
      "url": "https://ourworldindata.org/grapher/ozone-depleting-substance-consumption"
     },
     {
      "year": 1991,
      "value": 615878.7,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "UNEP Ozone Secretariat consumption data, via Our World in Data, Ozone-depleting substance consumption (CFC column)",
      "url": "https://ourworldindata.org/grapher/ozone-depleting-substance-consumption"
     },
     {
      "year": 1992,
      "value": 566976.6,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "UNEP Ozone Secretariat consumption data, via Our World in Data, Ozone-depleting substance consumption (CFC column)",
      "url": "https://ourworldindata.org/grapher/ozone-depleting-substance-consumption"
     },
     {
      "year": 1993,
      "value": 489382.3,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "UNEP Ozone Secretariat consumption data, via Our World in Data, Ozone-depleting substance consumption (CFC column)",
      "url": "https://ourworldindata.org/grapher/ozone-depleting-substance-consumption"
     },
     {
      "year": 1994,
      "value": 358946.8,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "UNEP Ozone Secretariat consumption data, via Our World in Data, Ozone-depleting substance consumption (CFC column)",
      "url": "https://ourworldindata.org/grapher/ozone-depleting-substance-consumption"
     },
     {
      "year": 1995,
      "value": 285589.8,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "UNEP Ozone Secretariat consumption data, via Our World in Data, Ozone-depleting substance consumption (CFC column)",
      "url": "https://ourworldindata.org/grapher/ozone-depleting-substance-consumption"
     },
     {
      "year": 1996,
      "value": 177772.2,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "UNEP Ozone Secretariat consumption data, via Our World in Data, Ozone-depleting substance consumption (CFC column)",
      "url": "https://ourworldindata.org/grapher/ozone-depleting-substance-consumption"
     },
     {
      "year": 1997,
      "value": 175267.9,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "UNEP Ozone Secretariat consumption data, via Our World in Data, Ozone-depleting substance consumption (CFC column)",
      "url": "https://ourworldindata.org/grapher/ozone-depleting-substance-consumption"
     },
     {
      "year": 1998,
      "value": 163234.2,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "UNEP Ozone Secretariat consumption data, via Our World in Data, Ozone-depleting substance consumption (CFC column)",
      "url": "https://ourworldindata.org/grapher/ozone-depleting-substance-consumption"
     },
     {
      "year": 1999,
      "value": 149484.2,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "UNEP Ozone Secretariat consumption data, via Our World in Data, Ozone-depleting substance consumption (CFC column)",
      "url": "https://ourworldindata.org/grapher/ozone-depleting-substance-consumption"
     },
     {
      "year": 2000,
      "value": 146951.6,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "UNEP Ozone Secretariat consumption data, via Our World in Data, Ozone-depleting substance consumption (CFC column)",
      "url": "https://ourworldindata.org/grapher/ozone-depleting-substance-consumption"
     },
     {
      "year": 2001,
      "value": 110010.9,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "UNEP Ozone Secretariat consumption data, via Our World in Data, Ozone-depleting substance consumption (CFC column)",
      "url": "https://ourworldindata.org/grapher/ozone-depleting-substance-consumption"
     },
     {
      "year": 2002,
      "value": 92326.9,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "UNEP Ozone Secretariat consumption data, via Our World in Data, Ozone-depleting substance consumption (CFC column)",
      "url": "https://ourworldindata.org/grapher/ozone-depleting-substance-consumption"
     },
     {
      "year": 2003,
      "value": 77842.0,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "UNEP Ozone Secretariat consumption data, via Our World in Data, Ozone-depleting substance consumption (CFC column)",
      "url": "https://ourworldindata.org/grapher/ozone-depleting-substance-consumption"
     },
     {
      "year": 2004,
      "value": 65795.2,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "UNEP Ozone Secretariat consumption data, via Our World in Data, Ozone-depleting substance consumption (CFC column)",
      "url": "https://ourworldindata.org/grapher/ozone-depleting-substance-consumption"
     },
     {
      "year": 2005,
      "value": 44173.6,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "UNEP Ozone Secretariat consumption data, via Our World in Data, Ozone-depleting substance consumption (CFC column)",
      "url": "https://ourworldindata.org/grapher/ozone-depleting-substance-consumption"
     },
     {
      "year": 2006,
      "value": 37052.3,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "UNEP Ozone Secretariat consumption data, via Our World in Data, Ozone-depleting substance consumption (CFC column)",
      "url": "https://ourworldindata.org/grapher/ozone-depleting-substance-consumption"
     },
     {
      "year": 2007,
      "value": 15385.9,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "UNEP Ozone Secretariat consumption data, via Our World in Data, Ozone-depleting substance consumption (CFC column)",
      "url": "https://ourworldindata.org/grapher/ozone-depleting-substance-consumption"
     },
     {
      "year": 2008,
      "value": 5816.2,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "UNEP Ozone Secretariat consumption data, via Our World in Data, Ozone-depleting substance consumption (CFC column)",
      "url": "https://ourworldindata.org/grapher/ozone-depleting-substance-consumption"
     },
     {
      "year": 2009,
      "value": 2200.0,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "UNEP Ozone Secretariat consumption data, via Our World in Data, Ozone-depleting substance consumption (CFC column)",
      "url": "https://ourworldindata.org/grapher/ozone-depleting-substance-consumption"
     },
     {
      "year": 2010,
      "value": -208.9,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "Negative value: reported destruction and exports exceeded production plus imports; it is not real negative use.",
      "source": "UNEP Ozone Secretariat consumption data, via Our World in Data, Ozone-depleting substance consumption (CFC column)",
      "url": "https://ourworldindata.org/grapher/ozone-depleting-substance-consumption"
     },
     {
      "year": 2011,
      "value": -2209.1,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "Negative value: reported destruction and exports exceeded production plus imports; it is not real negative use.",
      "source": "UNEP Ozone Secretariat consumption data, via Our World in Data, Ozone-depleting substance consumption (CFC column)",
      "url": "https://ourworldindata.org/grapher/ozone-depleting-substance-consumption"
     },
     {
      "year": 2012,
      "value": -1414.8,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "Negative value: reported destruction and exports exceeded production plus imports; it is not real negative use.",
      "source": "UNEP Ozone Secretariat consumption data, via Our World in Data, Ozone-depleting substance consumption (CFC column)",
      "url": "https://ourworldindata.org/grapher/ozone-depleting-substance-consumption"
     },
     {
      "year": 2013,
      "value": -1848.7,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "Negative value: reported destruction and exports exceeded production plus imports; it is not real negative use.",
      "source": "UNEP Ozone Secretariat consumption data, via Our World in Data, Ozone-depleting substance consumption (CFC column)",
      "url": "https://ourworldindata.org/grapher/ozone-depleting-substance-consumption"
     },
     {
      "year": 2014,
      "value": -1399.7,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "Negative value: reported destruction and exports exceeded production plus imports; it is not real negative use.",
      "source": "UNEP Ozone Secretariat consumption data, via Our World in Data, Ozone-depleting substance consumption (CFC column)",
      "url": "https://ourworldindata.org/grapher/ozone-depleting-substance-consumption"
     },
     {
      "year": 2015,
      "value": -1493.0,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "Negative value: reported destruction and exports exceeded production plus imports; it is not real negative use.",
      "source": "UNEP Ozone Secretariat consumption data, via Our World in Data, Ozone-depleting substance consumption (CFC column)",
      "url": "https://ourworldindata.org/grapher/ozone-depleting-substance-consumption"
     },
     {
      "year": 2016,
      "value": -1539.8,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "Negative value: reported destruction and exports exceeded production plus imports; it is not real negative use.",
      "source": "UNEP Ozone Secretariat consumption data, via Our World in Data, Ozone-depleting substance consumption (CFC column)",
      "url": "https://ourworldindata.org/grapher/ozone-depleting-substance-consumption"
     },
     {
      "year": 2017,
      "value": -1607.8,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "Negative value: reported destruction and exports exceeded production plus imports; it is not real negative use.",
      "source": "UNEP Ozone Secretariat consumption data, via Our World in Data, Ozone-depleting substance consumption (CFC column)",
      "url": "https://ourworldindata.org/grapher/ozone-depleting-substance-consumption"
     },
     {
      "year": 2018,
      "value": -1154.6,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "Negative value: reported destruction and exports exceeded production plus imports; it is not real negative use.",
      "source": "UNEP Ozone Secretariat consumption data, via Our World in Data, Ozone-depleting substance consumption (CFC column)",
      "url": "https://ourworldindata.org/grapher/ozone-depleting-substance-consumption"
     },
     {
      "year": 2019,
      "value": -1609.9,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "Negative value: reported destruction and exports exceeded production plus imports; it is not real negative use.",
      "source": "UNEP Ozone Secretariat consumption data, via Our World in Data, Ozone-depleting substance consumption (CFC column)",
      "url": "https://ourworldindata.org/grapher/ozone-depleting-substance-consumption"
     },
     {
      "year": 2020,
      "value": -807.0,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "Negative value: reported destruction and exports exceeded production plus imports; it is not real negative use.",
      "source": "UNEP Ozone Secretariat consumption data, via Our World in Data, Ozone-depleting substance consumption (CFC column)",
      "url": "https://ourworldindata.org/grapher/ozone-depleting-substance-consumption"
     },
     {
      "year": 2021,
      "value": -847.9,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "Negative value: reported destruction and exports exceeded production plus imports; it is not real negative use.",
      "source": "UNEP Ozone Secretariat consumption data, via Our World in Data, Ozone-depleting substance consumption (CFC column)",
      "url": "https://ourworldindata.org/grapher/ozone-depleting-substance-consumption"
     }
    ]
   },
   {
    "key": "antarctic-eesc",
    "fix": "cfc",
    "label": "Ozone-destroying chlorine and bromine over Antarctica (EESC)",
    "direction": "harm",
    "unit": "parts per trillion (ppt)",
    "kind": "level",
    "geography": "Antarctica",
    "method": "Equivalent Effective Stratospheric Chlorine for the Antarctic spring stratosphere, derived from measured surface concentrations with transport lag (new ODGI method).",
    "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
    "url": "https://gml.noaa.gov/odgi/",
    "points": [
     {
      "year": 1992,
      "value": 3544,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 1993,
      "value": 3666,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 1994,
      "value": 3784,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 1995,
      "value": 3888,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 1996,
      "value": 3974,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 1997,
      "value": 4041,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 1998,
      "value": 4088,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 1999,
      "value": 4119,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2000,
      "value": 4140,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2001,
      "value": 4151,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2002,
      "value": 4151,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2003,
      "value": 4137,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2004,
      "value": 4117,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2005,
      "value": 4094,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2006,
      "value": 4069,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2007,
      "value": 4043,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2008,
      "value": 4017,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2009,
      "value": 3990,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2010,
      "value": 3963,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2011,
      "value": 3933,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2012,
      "value": 3902,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2013,
      "value": 3872,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2014,
      "value": 3843,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2015,
      "value": 3815,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2016,
      "value": 3786,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2017,
      "value": 3759,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2018,
      "value": 3735,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2019,
      "value": 3711,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2020,
      "value": 3686,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2021,
      "value": 3660,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2022,
      "value": 3635,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2023,
      "value": 3609,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     },
     {
      "year": 2024,
      "value": 3583,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": false,
      "note": "",
      "source": "NOAA Global Monitoring Laboratory, Ozone Depleting Gas Index (ODGI), Table 1 (Antarctic)",
      "url": "https://gml.noaa.gov/odgi/odgi_table1.csv"
     }
    ]
   },
   {
    "key": "ozone-return-to-1980-projected",
    "fix": "cfc",
    "label": "Projected year ozone returns to 1980 values",
    "direction": "context",
    "unit": "ozone shortfall versus 1980 (0 = recovered)",
    "kind": "level",
    "geography": "rest of world, Arctic, Antarctica",
    "method": "Milestones only: each point marks the projected year total column ozone in a region returns to its 1980 value under current policies; value 0 means no shortfall versus 1980.",
    "source": "WMO/UNEP Scientific Assessment of Ozone Depletion 2022, as reported in WMO press release of 9 January 2023",
    "url": "https://wmo.int/news/media-centre/ozone-layer-recovery-track-helping-avoid-global-warming-05degc",
    "points": [
     {
      "year": 2040,
      "value": 0,
      "low": null,
      "high": null,
      "projected": true,
      "estimate": true,
      "note": "Rest of world (near-global average).",
      "source": "WMO/UNEP Scientific Assessment of Ozone Depletion 2022, as reported in WMO press release of 9 January 2023",
      "url": "https://wmo.int/news/media-centre/ozone-layer-recovery-track-helping-avoid-global-warming-05degc"
     },
     {
      "year": 2045,
      "value": 0,
      "low": null,
      "high": null,
      "projected": true,
      "estimate": true,
      "note": "Arctic.",
      "source": "WMO/UNEP Scientific Assessment of Ozone Depletion 2022, as reported in WMO press release of 9 January 2023",
      "url": "https://wmo.int/news/media-centre/ozone-layer-recovery-track-helping-avoid-global-warming-05degc"
     },
     {
      "year": 2066,
      "value": 0,
      "low": null,
      "high": null,
      "projected": true,
      "estimate": true,
      "note": "Antarctic. NOAA's ODGI page gives about 2070 for Antarctic halogen recovery.",
      "source": "WMO/UNEP Scientific Assessment of Ozone Depletion 2022, as reported in WMO press release of 9 January 2023",
      "url": "https://wmo.int/news/media-centre/ozone-layer-recovery-track-helping-avoid-global-warming-05degc"
     }
    ]
   },
   {
    "key": "world-avoided-global-ozone-loss",
    "fix": "cfc",
    "label": "Global ozone loss in the 'world avoided' (no Montreal Protocol)",
    "direction": "context",
    "unit": "percent of global column ozone lost versus 1980",
    "kind": "level",
    "geography": "world",
    "method": "NASA model run in which CFC production keeps growing 3 percent a year with no regulation; shows the harm the treaty prevented, not what happened.",
    "source": "Newman PA and others, What would have happened to the ozone layer if chlorofluorocarbons (CFCs) had not been regulated? Atmos. Chem. Phys. 9, 2113 to 2128, 2009",
    "url": "https://acp.copernicus.org/articles/9/2113/2009/",
    "points": [
     {
      "year": 2020,
      "value": 17,
      "low": null,
      "high": null,
      "projected": false,
      "estimate": true,
      "note": "Counterfactual model result, not an observation.",
      "source": "Newman PA and others, What would have happened to the ozone layer if chlorofluorocarbons (CFCs) had not been regulated? Atmos. Chem. Phys. 9, 2113 to 2128, 2009",
      "url": "https://acp.copernicus.org/articles/9/2113/2009/"
     },
     {
      "year": 2065,
      "value": 67,
      "low": null,
      "high": null,
      "projected": true,
      "estimate": true,
      "note": "Counterfactual projection; erythemal UV more than doubles in northern midlatitude summer by 2060.",
      "source": "Newman PA and others, What would have happened to the ozone layer if chlorofluorocarbons (CFCs) had not been regulated? Atmos. Chem. Phys. 9, 2113 to 2128, 2009",
      "url": "https://acp.copernicus.org/articles/9/2113/2009/"
     }
    ]
   },
   {
    "key": "us-skin-cancer-cases-avoided",
    "fix": "cfc",
    "label": "US skin cancer cases avoided by the Montreal Protocol",
    "direction": "harm",
    "unit": "cases (cumulative)",
    "kind": "cumulative",
    "geography": "US",
    "method": "Modeled skin cancer cases (melanoma and non-melanoma) avoided for Americans born 1890 to 2100, Protocol with amendments versus no controls; one cumulative total plotted at the cohort end year.",
    "source": "US EPA, Updating Ozone Calculations and Emissions Profiles for Use in the Atmospheric and Health Effects Framework Model, February 2015, Table 2 (WMO 2011 A1 baseline)",
    "url": "https://www.epa.gov/sites/default/files/2015-11/documents/ahef_2015_update_report-final_508.pdf",
    "points": [
     {
      "year": 2100,
      "value": 283063900,
      "low": null,
      "high": null,
      "projected": true,
      "estimate": true,
      "note": "Cumulative for birth cohorts 1890 to 2100, not a value for the year 2100. A 2021 EPA-funded NCAR/ICF update raised these to 443 million skin cancers, 2.3 million deaths and 63 million cataracts (https://news.ucar.edu/132812/protecting-ozone-layer-delivering-vast-health-benefits).",
      "source": "US EPA, Updating Ozone Calculations and Emissions Profiles for Use in the Atmospheric and Health Effects Framework Model, February 2015, Table 2 (WMO 2011 A1 baseline)",
      "url": "https://www.epa.gov/sites/default/files/2015-11/documents/ahef_2015_update_report-final_508.pdf"
     }
    ]
   },
   {
    "key": "us-skin-cancer-deaths-avoided",
    "fix": "cfc",
    "label": "US skin cancer deaths avoided by the Montreal Protocol",
    "direction": "harm",
    "unit": "deaths (cumulative)",
    "kind": "cumulative",
    "geography": "US",
    "method": "Modeled skin cancer deaths avoided for Americans born 1890 to 2100, Protocol with amendments versus no controls.",
    "source": "US EPA, Updating Ozone Calculations and Emissions Profiles for Use in the Atmospheric and Health Effects Framework Model, February 2015, Table 2 (WMO 2011 A1 baseline)",
    "url": "https://www.epa.gov/sites/default/files/2015-11/documents/ahef_2015_update_report-final_508.pdf",
    "points": [
     {
      "year": 2100,
      "value": 1552700,
      "low": null,
      "high": null,
      "projected": true,
      "estimate": true,
      "note": "Cumulative for birth cohorts 1890 to 2100. A 2021 EPA-funded NCAR/ICF update raised these to 443 million skin cancers, 2.3 million deaths and 63 million cataracts (https://news.ucar.edu/132812/protecting-ozone-layer-delivering-vast-health-benefits).",
      "source": "US EPA, Updating Ozone Calculations and Emissions Profiles for Use in the Atmospheric and Health Effects Framework Model, February 2015, Table 2 (WMO 2011 A1 baseline)",
      "url": "https://www.epa.gov/sites/default/files/2015-11/documents/ahef_2015_update_report-final_508.pdf"
     }
    ]
   },
   {
    "key": "us-cataracts-avoided",
    "fix": "cfc",
    "label": "US cataract cases avoided by the Montreal Protocol",
    "direction": "harm",
    "unit": "cases (cumulative)",
    "kind": "cumulative",
    "geography": "US",
    "method": "Modeled cataract cases avoided for Americans born 1890 to 2100, Protocol with amendments versus no controls.",
    "source": "US EPA, Updating Ozone Calculations and Emissions Profiles for Use in the Atmospheric and Health Effects Framework Model, February 2015, Table 2 (WMO 2011 A1 baseline)",
    "url": "https://www.epa.gov/sites/default/files/2015-11/documents/ahef_2015_update_report-final_508.pdf",
    "points": [
     {
      "year": 2100,
      "value": 45553000,
      "low": null,
      "high": null,
      "projected": true,
      "estimate": true,
      "note": "Cumulative for birth cohorts 1890 to 2100. A 2021 EPA-funded NCAR/ICF update raised these to 443 million skin cancers, 2.3 million deaths and 63 million cataracts (https://news.ucar.edu/132812/protecting-ozone-layer-delivering-vast-health-benefits).",
      "source": "US EPA, Updating Ozone Calculations and Emissions Profiles for Use in the Atmospheric and Health Effects Framework Model, February 2015, Table 2 (WMO 2011 A1 baseline)",
      "url": "https://www.epa.gov/sites/default/files/2015-11/documents/ahef_2015_update_report-final_508.pdf"
     }
    ]
   },
   {
    "key": "world-skin-cancers-avoided-per-year",
    "fix": "cfc",
    "label": "Skin cancer cases avoided worldwide each year",
    "direction": "harm",
    "unit": "cases per year",
    "kind": "flow",
    "geography": "world",
    "method": "Estimate of annual skin cancer cases prevented by the Montreal Protocol, as cited by the UNEP Environmental Effects Assessment Panel.",
    "source": "UNEP press release on the Environmental Effects Assessment Panel 2014 report, Montreal Protocol averts threat of large increases in skin cancers",
    "url": "https://www.unep.org/news-and-stories/press-release/montreal-protocol-averts-threat-large-increases-skin-cancers",
    "points": [
     {
      "year": 2030,
      "value": 2000000,
      "low": null,
      "high": 2000000,
      "projected": true,
      "estimate": true,
      "note": "'Up to' 2 million a year by 2030; value is an upper bound.",
      "source": "UNEP press release on the Environmental Effects Assessment Panel 2014 report, Montreal Protocol averts threat of large increases in skin cancers",
      "url": "https://www.unep.org/news-and-stories/press-release/montreal-protocol-averts-threat-large-increases-skin-cancers"
     }
    ]
   }
  ],
  "money": [
   {
    "key": "unep-leaded-petrol-phaseout-benefit",
    "label": "Global annual benefit of ending leaded petrol (cost of leaded petrol avoided)",
    "direction": "avoided",
    "usd_year": null,
    "total_usd": null,
    "per_year_usd": 2450000000000.0,
    "years": "per year after global phase-out (2021 on)",
    "source": "UNEP press release, Era of leaded petrol over, eliminating a major threat to human and planetary health, 30 August 2021; underlying study Tsai PL and Hatfield TH, Global benefits from the phaseout of leaded fuel, J Environ Health 74(5):8-14, 2011",
    "url": "https://www.unep.org/news-and-stories/press-release/era-leaded-petrol-over-eliminating-major-threat-human-and-planetary",
    "note": "Also more than 1.2 million premature deaths avoided per year (125,000 children). Dollar year not stated; study published 2011. Other UNEP and AFP text rounds to 2.4 trillion. No low/high published in the release."
   },
   {
    "key": "grosse-us-iq-gain-per-cohort",
    "label": "US productivity gain per birth cohort from lower child blood lead since 1976",
    "direction": "avoided",
    "usd_year": 2000,
    "total_usd": null,
    "per_year_usd": null,
    "years": "each annual cohort of 2-year-olds, late 1990s",
    "source": "Grosse SD, Matte TD, Schwartz J, Jackson RJ. Economic gains resulting from the reduction in children's exposure to lead in the United States. Environ Health Perspect 2002;110(6):563-569",
    "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC1240871/",
    "note": "Range 110 billion to 319 billion dollars per annual cohort of 3.8 million children (low 1.10e11, high 3.19e11; no central value given, so per_year_usd is null). Covers all lead sources, mostly gasoline in that era; children were 2.2 to 4.7 IQ points higher than with late-1970s blood lead.",
    "low_usd": 110000000000,
    "high_usd": 319000000000
   },
   {
    "key": "epa-1985-phasedown-net-benefit-1986",
    "label": "Net benefit of the 1985 US lead phasedown in 1986 (excluding blood pressure)",
    "direction": "avoided",
    "usd_year": 1983,
    "total_usd": null,
    "per_year_usd": 1316000000.0,
    "years": "1986",
    "source": "US EPA Journal, Vol. 11 No. 4, May 1985, Phasing Down Lead in Gasoline",
    "url": "https://epaalumni.org/userdata/pdf/1985-05-93000E80.PDF",
    "note": "Benefits 1.924 billion minus refining costs 608 million. Including preliminary adult blood pressure benefits, net was 7.213 billion. Dollar year is 1983 per Schwartz et al. 1985 as cited by LEAD Action News (https://www.lead.org.au/lanv8n2/l8v2-7f.html); the EPA Journal table itself does not state it."
   },
   {
    "key": "epa-1985-refining-cost-1986",
    "label": "Value of lead as cheap octane: added US refining cost to remove it, 1986",
    "direction": "benefit",
    "usd_year": 1983,
    "total_usd": null,
    "per_year_usd": 608000000.0,
    "years": "1986",
    "source": "US EPA Journal, Vol. 11 No. 4, May 1985, Phasing Down Lead in Gasoline",
    "url": "https://epaalumni.org/userdata/pdf/1985-05-93000E80.PDF",
    "note": "The only credible quantified 'benefit' of tetraethyl lead found: what refiners saved by using lead instead of other octane sources. EPA expected it to fall to 558 million in 1987. Same dollar-year caveat as above."
   },
   {
    "key": "attina-lmic-lead-cost",
    "label": "Annual cost of childhood lead exposure in low and middle income countries (all sources)",
    "direction": "harm",
    "usd_year": 2011,
    "total_usd": null,
    "per_year_usd": 977000000000.0,
    "years": "2011",
    "source": "Attina TM, Trasande L. Economic costs of childhood lead exposure in low- and middle-income countries. Environ Health Perspect 2013;121(9):1097-1102",
    "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC3764081/",
    "note": "International dollars, lost lifetime productivity from IQ loss; sensitivity range 728.6 billion to 1,162.5 billion. All lead sources, not gasoline only, and measured a decade after most countries had dropped leaded petrol."
   },
   {
    "key": "epa-2007-us-ozone-health-benefit",
    "label": "US societal health benefit of protecting the ozone layer",
    "direction": "avoided",
    "usd_year": null,
    "total_usd": 4200000000000.0,
    "per_year_usd": null,
    "years": "1990 to 2165",
    "source": "US EPA, The Montreal Protocol: A Landmark Environmental Treaty (backgrounder, 2007), citing EPA Achievements in Stratospheric Ozone Protection progress report, April 2007",
    "url": "https://19january2021snapshot.epa.gov/sites/static/files/2015-07/documents/the_montreal_protocol_-_a_landmark_environmental_treaty.pdf",
    "note": "Also 6.3 million US skin cancer deaths prevented. Dollar year not stated. This is harm from CFCs that the treaty avoided, not harm that occurred."
   },
   {
    "key": "epa-1988-ria-skin-cancer-benefit",
    "label": "US present value of avoided skin cancers from CFC and halon controls (1988 RIA)",
    "direction": "avoided",
    "usd_year": 1985,
    "total_usd": null,
    "per_year_usd": null,
    "years": "people born before 2075",
    "source": "US EPA, Regulatory Impact Analysis: Protection of Stratospheric Ozone, Volume I, August 1, 1988",
    "url": "https://biotech.law.lsu.edu/blog/EPA-ozone-CFC-cost-benefit.pdf",
    "note": "Range 1.4 trillion to 3.5 trillion across regulatory options (total_usd shows the high end); 1.2 to 3.7 million deaths avoided; 2 percent discount rate; 3 million dollars per statistical life. Dollar year 1985 per Exhibit ES-2.",
    "low_usd": 1400000000000.0,
    "high_usd": 3500000000000.0
   },
   {
    "key": "epa-1988-ria-cost-of-giving-up-cfcs",
    "label": "US present value cost of cutting CFC and halon use (value CFCs provided)",
    "direction": "benefit",
    "usd_year": 1985,
    "total_usd": null,
    "per_year_usd": null,
    "years": "through 2075",
    "source": "US EPA, Regulatory Impact Analysis: Protection of Stratospheric Ozone, Volume I, August 1, 1988",
    "url": "https://biotech.law.lsu.edu/blog/EPA-ozone-CFC-cost-benefit.pdf",
    "note": "Proxy for the economic value of CFCs: 7 to 19 billion for a CFC freeze, 24 to 65 billion for the strictest option (80 percent US cut plus halon freeze); total_usd shows the high end. No credible estimate of the value of refrigeration or air conditioning attributable to CFCs was found. Range shown is for the strictest control option; a freeze alone was estimated at 7 to 19 billion dollars.",
    "low_usd": 24000000000.0,
    "high_usd": 65000000000.0,
    "caption": "For the strictest option. A freeze alone was estimated at $7 billion to 19 billion."
   }
  ],
  "events": [
   {
    "year": 1921,
    "label": "Midgley finds that tetraethyl lead stops engine knock"
   },
   {
    "year": 1923,
    "label": "Leaded gasoline goes on sale"
   },
   {
    "year": 1928,
    "label": "Midgley's team makes Freon (CFC-12) for refrigerators"
   },
   {
    "year": 1974,
    "label": "Molina and Rowland show CFCs can destroy stratospheric ozone"
   },
   {
    "year": 1985,
    "label": "The Antarctic ozone hole is reported"
   },
   {
    "year": 1987,
    "label": "The Montreal Protocol is signed"
   },
   {
    "year": 1996,
    "label": "Leaded gasoline banned for US road vehicles"
   },
   {
    "year": 2021,
    "label": "The last country stops selling leaded petrol"
   },
   {
    "year": 2066,
    "label": "Antarctic ozone projected to return to 1980 levels (WMO and UNEP 2022)"
   }
  ],
  "gaps": [
   "The dollar damage the ozone hole actually did, year by year (studies estimate harm avoided by the Montreal Protocol, not harm that happened).",
   "A yearly value for what the fixes gave: the octane and engine efficiency of leaded gasoline, and the safer refrigeration Freon made possible.",
   "US lead added to gasoline each year before 1970 (in the Bureau of Mines yearbooks, not yet transcribed)."
  ]
 }
];

// Dropped from v1 as too weakly sourced: Environment Canada 1997 ($459 billion), UNEP's $1.8 trillion global health
// benefit, and Multilateral Fund totals (each found only in secondary pages).
const text = (v, n) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, n);
const num = (v) => (v === null || v === undefined || v === "" || !Number.isFinite(Number(v)) ? null : Number(v));

// Rows for the database, cleaned. id = nominee:key.
export function impactRows() {
  const series = [], points = [], money = [];
  for (const c of CASE_IMPACTS) {
    (c.series || []).forEach((s, i) => {
      const id = `${c.nominee}:${text(s.key, 60)}`;
      series.push({ id, nominee_id: c.nominee, key: text(s.key, 60), fix: text(s.fix, 40), label: text(s.label, 160),
        direction: ["harm", "benefit", "context"].includes(s.direction) ? s.direction : "context", unit: text(s.unit, 60),
        kind: ["flow", "level", "cumulative"].includes(s.kind) ? s.kind : "level", geography: text(s.geography, 60),
        method: text(s.method, 400), source: text(s.source, 400), url: text(s.url, 500), sort: i });
      for (const p of s.points || []) {
        const year = num(p.year), value = num(p.value);
        if (year === null || value === null) continue;
        points.push({ series_id: id, year: Math.round(year), value, low: num(p.low), high: num(p.high),
          projected: p.projected ? 1 : 0, estimate: p.estimate ? 1 : 0, note: text(p.note, 300),
          source: text(p.source || s.source, 400), url: text(p.url || s.url, 500) });
      }
    });
    (c.money || []).forEach((m) => money.push({ id: `${c.nominee}:${text(m.key, 60)}`, nominee_id: c.nominee, key: text(m.key, 60),
      fix: text(m.fix, 40), label: text(m.label, 200), direction: ["harm", "avoided", "benefit"].includes(m.direction) ? m.direction : "harm",
      usd_year: num(m.usd_year), total_usd: num(m.total_usd), per_year_usd: num(m.per_year_usd), low_usd: num(m.low_usd), high_usd: num(m.high_usd), years: text(m.years, 60),
      source: text(m.source, 400), url: text(m.url, 500), note: text(m.note, 400), caption: text(m.caption, 200) }));
  }
  return { series, points, money };
}
