import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "~/server/db";
import { InputPythonRowSchema as AdSchema } from "types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    try {
      const ads = AdSchema.array().parse(req.body);

      const requests = ads.map(async (ad) => {
        const existingAd = await db.ad.findFirst({ where: { id: ad.id } });

        if (existingAd) {
          console.log(`Row with fieldName ${ad.id} exists.`);
          res.status(200).json({ message: "Row already exists" });
          return;
        }

        await db.ad.create({ data: ad });
      });

      await Promise.all(requests);

      console.log("Rows added successfully")

      // Respond to the client with the fetched data
      res.status(200).json({ message: "Rows added successfully" });
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
