import { pythonendpointrow } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { map } from "@trpc/server/observable";
import { RegionDataCell, RegionDataHive, regiondelivery } from "randomtypes";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// [{'percentage': '0.000545', 'region': 'Idaho'}, {'percentage': '0.999455', 'region': 'Washington'}]
//calulate WITH PERCENTAGE

export const pythonRouter = createTRPCRouter({
  getcountryRows: publicProcedure.query(async ({ ctx }) => {
    const country = await ctx.db.countryRows.findMany({
      orderBy: { upperspend: "desc" },
    });
    return country;
  }),
  getCompanyRows: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(async ({ ctx, input }) => {
      const company = await ctx.db.companyRows.findMany({
        where: { company: String(input.text) },
        orderBy: { upperspend: "desc" },
      });
      return company;
    }),

  getCurrentPythonRows: publicProcedure.query(async ({ ctx }) => {
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

    const array: pythonendpointrow[] = await ctx.db.pythonendpointrow.findMany({
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
      let stateCells1: Map<String, RegionDataCell> = new Map();

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
          if (stateCells1.has(theRowArray[q]?.region!) === true) {
            stateCells1.get(theRowArray[q]?.region!)!.lowerbound =
              stateCells1.get(theRowArray[q]?.region!)?.lowerbound! +
              Number(value[o]!.spend_lower_bound);

            stateCells1.get(theRowArray[q]?.region!)!.upperbound =
              stateCells1.get(theRowArray[q]?.region!)?.upperbound! +
              Number(value[o]!.spend_upper_bound);

            stateCells1.get(theRowArray[q]?.region!)!.number_of_ads =
              stateCells1.get(theRowArray[q]?.region!)?.number_of_ads! + 1;
          } else {
            let region: RegionDataCell = {
              upperbound: Number(value[o]?.spend_upper_bound),
              lowerbound: Number(value[o]?.spend_lower_bound),
              number_of_ads: 1,
            };
            stateCells1.set(theRowArray[q]?.region!, region);
          }
        }
      }

      let CompanyDataHive: RegionDataHive = {
        AmericaCell: AmericaCell1,
        stateCells: stateCells1,
      };

      mapOfCompaniesWStates.set(key, CompanyDataHive);
      // console.log("maptype is", typeof mapOfCompaniesWStates);
      // console.log("Is it a Map?", mapOfCompaniesWStates instanceof Map);
    }
    //  console.log(mapOfCompaniesWStates);

    //  for (const [key, value] of mapOfCompaniesWStates) {
    //    console.log(key);
    //    console.log(value);
    //    await ctx.db.countryRows.create({
    //      data: {
    //        company: String(key),
    //        upperspend: value.AmericaCell.upperbound,
    //        lowerspend: value.AmericaCell.lowerbound,
    //        numberOfAds: value.AmericaCell.number_of_ads,
    //      },
    //    });

    //    let value1 = value;
    //    let key1 = key;

    //    for (const [key, value] of value1.stateCells) {
    //      console.log(key, value);
    //      await ctx.db.companyRows.create({
    //        data: {
    //          company: String(key1),
    //          location: String(key),
    //          upperspend: value.upperbound,
    //          lowerspend: value.lowerbound,
    //          numberOfAds: value.number_of_ads,
    //        },
    //      });
    //    }
    //  }

    //  console.log(bigmap1);

    //  await ctx.db.countryDataDump.create({
    //    data: {
    //      bigmap: bigmap1,
    //    },
    //  });

    console.log("maptype PYTHONROWpaloki is", typeof mapOfCompaniesWStates);
    console.log("Is it a Map?", mapOfCompaniesWStates instanceof Map);
    //return mapOfCompaniesWStates;
    return array;
  }),
});
