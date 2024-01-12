import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const pythonRouter = createTRPCRouter({
  getCurrentPythonRows: publicProcedure.query(({ ctx }) => {
    return ctx.db.pythonendpointrow.findMany({
      orderBy: { id: "desc" },
      where: {
        generation: 1,
      },
    });
  }),
});
