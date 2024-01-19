import { pythonendpointrow, regiondelivery } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { InputPythonRow } from "randomtypes";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    try {
      // Process a POST request
      const body = req.body;
      console.log(body);
      let InputPythonRow1: InputPythonRow = body;

      console.log("xxxxxxxxxxxxxxxxx");
      console.log(InputPythonRow1);
      res.status(200).json({ InputPythonRow1 });
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
