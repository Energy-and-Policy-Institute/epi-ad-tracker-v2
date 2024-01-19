import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "~/server/db";
import { pythonendpointrow, regiondelivery } from "@prisma/client";
import { RegionDataCell, RegionDataHive, RegionData } from "randomtypes";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    try {
      await db.companyRows.deleteMany({});
      await db.countryRows.deleteMany({});

      let mapOfCompanies: Map<String, pythonendpointrow[]> = new Map<
        string,
        pythonendpointrow[]
      >();

      let mapOfCompaniesWStates: Map<String, RegionDataHive> = new Map<
        string,
        RegionDataHive
      >();

      const array: pythonendpointrow[] = await db.pythonendpointrow.findMany({
        orderBy: { id: "desc" },
      });

      for (let i: number = 0; i < array.length; i++) {
        if (mapOfCompanies.has(array[i]?.page_id!) === true) {
          mapOfCompanies.get(array[i]?.page_id!)?.push(array[i]!);
        } else if (mapOfCompanies.has(array[i]?.page_id!) === false) {
          mapOfCompanies.set(array[i]?.page_id!, [array[i]!]);
        }
      }
      // for each company
      for (const [key, value] of mapOfCompanies) {
        // the breakdown for states needs to happen here

        let AmericaCell1: RegionDataCell = {
          upperbound: 0,
          lowerbound: 0,
          number_of_ads: 0,
        };

        let stateCells1: Map<String, RegionDataCell> = new Map();

        for (let o: number = 0; o < value.length; o++) {
          let theRow = value[o]?.delivery_by_region;

          let theRowArray: regiondelivery[] = [];

          try {
            theRowArray = JSON.parse(theRow!);
          } catch (error) {
            console.log(error);
          }

          if (true) {
            AmericaCell1.lowerbound =
              AmericaCell1.lowerbound + Number(value[o]!.spend_lower_bound);
            AmericaCell1.upperbound =
              AmericaCell1.upperbound + Number(value[o]!.spend_upper_bound);
            AmericaCell1.number_of_ads = AmericaCell1.number_of_ads + 1;

            for (let q: number = 0; q < theRowArray.length; q++) {
              let percentage = theRowArray[q]?.percentage;

              if (stateCells1.has(theRowArray[q]?.region!) === true) {
                stateCells1.get(theRowArray[q]?.region!)!.lowerbound =
                  (stateCells1.get(theRowArray[q]?.region!)?.lowerbound! +
                    Number(value[o]!.spend_lower_bound)) *
                  Number(percentage);

                stateCells1.get(theRowArray[q]?.region!)!.upperbound =
                  (stateCells1.get(theRowArray[q]?.region!)?.upperbound! +
                    Number(value[o]!.spend_upper_bound)) *
                  Number(percentage);

                stateCells1.get(theRowArray[q]?.region!)!.number_of_ads =
                  stateCells1.get(theRowArray[q]?.region!)?.number_of_ads! + 1;
              } else {
                let region: RegionDataCell = {
                  upperbound:
                    Number(value[o]?.spend_upper_bound) * Number(percentage),
                  lowerbound:
                    Number(value[o]?.spend_lower_bound) * Number(percentage),
                  number_of_ads: 1,
                };
                stateCells1.set(theRowArray[q]?.region!, region);
              }
            }
          }
        }

        let CompanyDataHive: RegionDataHive = {
          AmericaCell: AmericaCell1,
          stateCells: stateCells1,
        };

        mapOfCompaniesWStates.set(key, CompanyDataHive);
      }

      for (const [key, value] of mapOfCompaniesWStates) {
        console.log(key);
        console.log(value);
        await db.countryRows.create({
          data: {
            company: String(key),
            upperspend: value.AmericaCell.upperbound,
            lowerspend: value.AmericaCell.lowerbound,
            numberOfAds: value.AmericaCell.number_of_ads,
          },
        });

        let value1 = value;
        let key1 = key;

        for (const [key, value] of value1.stateCells) {
          console.log(key, value);
          await db.companyRows.create({
            data: {
              company: String(key1),
              location: String(key),
              upperspend: value.upperbound,
              lowerspend: value.lowerbound,
              numberOfAds: value.number_of_ads,
            },
          });
        }
      }

      // Respond to the client
      res.status(200).json({ message: "Hello from the API endpoint!" });
    } catch (error) {
      // Handle errors, log them, or send an appropriate response
      console.error("Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    // Respond to non-POST requests with a 405 Method Not Allowed status
    res.status(405).end();
  }
}
