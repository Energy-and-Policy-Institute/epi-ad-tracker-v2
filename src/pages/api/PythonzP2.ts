import { pythonendpointrow } from "@prisma/client";
import { regiondelivery } from "randomtypes";
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "~/server/db";
import { RegionDataCell, RegionDataHive } from "randomtypes";
import Decimal from "decimal.js";

async function RealMultiplication(
  number1: number,
  number2: number,
): Promise<Decimal> {
  let num1: string = number1.toString();
  let num2: string = number2.toString();

  let num1d: Decimal = new Decimal(num1);
  let num2d: Decimal = new Decimal(num2);

  let result = num1d.times(num2d);
  return result;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    try {
      // Process a POST request
      await db.companyRows.deleteMany({});
      await db.countryRows.deleteMany({});

      // let arrayOfCompanies: String[] = [];
      let mapOfCompanies: Map<String, pythonendpointrow[]> = new Map<
        string,
        pythonendpointrow[]
      >();

      //key is company I wanna say
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

        // let stateCells1: Map<String, RegionDataCell[]> = new Map();
        let stateCells1: Map<String, RegionDataCell> = new Map<
          String,
          RegionDataCell
        >();

        for (let o: number = 0; o < value.length; o++) {
          // Parse the JSON string
          let theRow = value[o]?.delivery_by_region;
          // let theRowArray: regiondelivery[] = JSON.parse(theRow!);

          let theRowArray: regiondelivery[] = [];
          try {
            theRowArray = JSON.parse(theRow!);
          } catch (error) {
            // console.error("Error parsing JSON:", error);
          }

          // Continue with the rest of the code...

          // const ShallYouPass = await IsNaN(theRowArray);

          // if (ShallYouPass === false)

          AmericaCell1.lowerbound =
            AmericaCell1.lowerbound + Number(value[o]!.spend_lower_bound);
          AmericaCell1.upperbound =
            AmericaCell1.upperbound + Number(value[o]!.spend_upper_bound);
          AmericaCell1.number_of_ads = AmericaCell1.number_of_ads + 1;

          for (let q: number = 0; q < theRowArray.length; q++) {
            const resultUPPER1 = await RealMultiplication(
              value[o]!.spend_upper_bound,
              theRowArray[q]?.percentage!,
            );

            const resultUPPER = resultUPPER1.toDecimalPlaces(
              2,
              Decimal.ROUND_DOWN,
            );

            const resultLower1 = await RealMultiplication(
              value[o]!.spend_lower_bound,
              theRowArray[q]?.percentage!,
            );

            const resultLower = resultLower1.toDecimalPlaces(
              2,
              Decimal.ROUND_DOWN,
            );

            if (Number(resultLower) < 1 && Number(resultUPPER) < 1) {
              console.log("MULTIPLICATION RESULTS", resultLower, resultUPPER);
            }

            // if we already have the state in the statemap
            if (stateCells1.has(theRowArray[q]?.region!) === true) {
              stateCells1.get(theRowArray[q]?.region!)!.lowerbound =
                stateCells1.get(theRowArray[q]?.region!)?.lowerbound! +
                Number(resultLower);

              stateCells1.get(theRowArray[q]?.region!)!.upperbound =
                stateCells1.get(theRowArray[q]?.region!)?.upperbound! +
                Number(resultUPPER);

              stateCells1.get(theRowArray[q]?.region!)!.number_of_ads =
                stateCells1.get(theRowArray[q]?.region!)?.number_of_ads! + 1;
            } else {
              let region: RegionDataCell = {
                upperbound: Number(resultUPPER),
                lowerbound: Number(resultLower),
                number_of_ads: 1,
              };
              //  const newstateCells = await ADD_TO_MAP(
              //    stateCells1,
              //    theRowArray[q]?.region!,
              //    region,
              //  );
              //
              //  stateCells1 = newstateCells;
              stateCells1.set(theRowArray[q]?.region!, region);
              console.log("sc size", stateCells1.size);
            }
            // console.log("maptype is", typeof mapOfCompaniesWStates);
            // console.log("Is it a Map?", mapOfCompaniesWStates instanceof Map);
          }
        }

        // let CompanyDataHive: RegionDataHive = {
        //   AmericaCell: AmericaCell1,
        //   stateCells: stateCells1,
        // };

        //  let bigmap2 = JSON.stringify(CompanyDataHive);

        // console.log(bigmap2);
        //    await db.companyDataDump1.create({
        //      data: {
        //        bigmap: bigmap2,
        //        companyname1: String(key),
        //      },
        //    });

        mapOfCompaniesWStates.set(key, {
          AmericaCell: AmericaCell1,
          stateCells: stateCells1,
        });
        console.log(stateCells1);
        // console.log("maptype is", typeof mapOfCompaniesWStates);
        // console.log("Is it a Map?", mapOfCompaniesWStates instanceof Map);
      }
      // console.log(mapOfCompaniesWStates);

      for (const [key, value] of mapOfCompaniesWStates) {
        // console.log(key);
        // console.log(value);
        await db.countryRows.create({
          data: {
            company: String(key),
            upperspend: value.AmericaCell.upperbound,
            lowerspend: value.AmericaCell.lowerbound,
            numberOfAds: value.AmericaCell.number_of_ads,
          },
        });

        // let value1 = value;
        // let companyname = key;

        // console.log("size", value.stateCells.size);

        // await LoopStateCells(value1.stateCells, companyname);

        for (const [stateKey, stateValue] of value.stateCells) {
          try {
            if (stateValue.upperbound < 1) {
              console.log("EMERGENCY", stateValue.upperbound, key, stateKey);
            }
            await db.companyRows.create({
              data: {
                company: String(key),
                location: String(stateKey),
                upperspend: stateValue.upperbound,
                lowerspend: stateValue.lowerbound,
                numberOfAds: stateValue.number_of_ads,
                upperspendTXT: String(stateValue.upperbound),
                lowerspendTXT: String(stateValue.lowerbound),
              },
            });
          } catch (error) {
            console.error("Error writing to the database:", error);
          }
        }
      }

      //  console.log(bigmap1);

      //  await db.countryDataDump.create({
      //    data: {
      //      bigmap: bigmap1,
      //    },
      //  });

      // await db.pythonendpointrow.deleteMany({});

      // Respond to the client with the fetched data
      res.status(200).json({ mapOfCompaniesWStates });
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
