import { pythonendpointrow } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "~/server/db";
import { InputPythonRow } from "randomtypes";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    try {
      // Process a POST request
      const body = req.body;
      let InputPythonRow1: InputPythonRow = body;
      console.log(body);
      console.log("xxxxxxxxxxxxxxxxx");
      console.log(InputPythonRow1);
      console.log(InputPythonRow1.impressions_lower_bound);

      const pythonendpointrow = await db.pythonendpointrow.findFirst({
        where: { pythonid: Number(InputPythonRow1.id) },
      });

      if (pythonendpointrow) {
        console.log(`Row with fieldName ${InputPythonRow1.id} exists.`);
      } else {
        console.log(`Row with fieldName ${InputPythonRow1.id} does not exist.
      So we're gonna create one`);

        await db.pythonendpointrow.create({
          data: {
            pythonid: Number(InputPythonRow1.id),
            generation: 1,
            // pythonid: Number(InputPythonRow1.id),
            ad_delivery_start_time: String(
              InputPythonRow1.ad_delivery_start_time,
            ),
            ad_delivery_stop_time: String(
              InputPythonRow1.ad_delivery_stop_time,
            ),
            ad_snapshot_url: String(InputPythonRow1.ad_snapshot_url),
            bylines: String(InputPythonRow1.bylines),
            delivery_by_region: String(InputPythonRow1.delivery_by_region),
            demographic_distribution: String(
              InputPythonRow1.demographic_distribution,
            ),
            publisher_platforms: String(InputPythonRow1.publisher_platforms),
            ad_creative_bodies: String(InputPythonRow1.ad_creative_bodies),
            ad_creative_link_captions: String(
              InputPythonRow1.ad_creative_link_captions,
            ),
            ad_creative_link_descriptions: String(
              InputPythonRow1.ad_creative_link_descriptions,
            ),
            ad_creative_link_titles: String(
              InputPythonRow1.ad_creative_link_titles,
            ),
            page_id: String(InputPythonRow1.page_id),
            page_name: String(InputPythonRow1.page_name),
            impressions_lower_bound: Number(
              InputPythonRow1.impressions_lower_bound,
            ),
            impressions_upper_bound: Number(
              InputPythonRow1.impressions_upper_bound,
            ),
            spend_lower_bound: Number(InputPythonRow1.spend_lower_bound),
            spend_upper_bound: Number(InputPythonRow1.spend_upper_bound),
          },
        });
      }
      // Respond to the client with the fetched data
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
