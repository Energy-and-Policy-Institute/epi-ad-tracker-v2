import { pythonendpointrow } from "@prisma/client";
import Head from "next/head";
import Link from "next/link";

import { api } from "~/utils/api";

export default function Home() {
  const hello = api.post.hello.useQuery({ text: "from tRPC" });
  const pythonrows = api.python.getCurrentPythonRows.useQuery();
  console.log(pythonrows);

  function Table() {
    return (
      <div>
        {" "}
        {pythonrows.data?.length! > 0 && (
          <>
            <table>
              {" "}
              <thead>
                {" "}
                <tr className="outline">
                  {" "}
                  <th className="px-5 py-2 outline">ID</th>
                  <th className="px-5 py-2 outline">PYTHON_ID</th>
                  <th className="px-5 py-2 outline">BYLINES</th>
                  <th className="px-5 py-2 outline">
                    Spending lower estimate
                  </th>{" "}
                  <th className="px-5 py-2 outline">
                    Spending higher estimate
                  </th>
                  {/* comment */}
                  {/* <th>Ad Snapshot URL</th>{" "} */}
                </tr>{" "}
              </thead>{" "}
              <tbody>
                {" "}
                {pythonrows.data!.map((row) => (
                  <tr
                    key={row.id}
                    // className="center text-center font-bold outline"
                  >
                    <td className="px-5 py-2 outline">{row.id.toString()}</td>
                    <td className="px-5 py-2 outline">
                      {row.pythonid.toString()}
                    </td>
                    <td className="px-5 py-2 outline">{row.bylines}</td>
                    <td className="px-5 py-2 outline">
                      {Number(row.spend_lower_bound)}
                    </td>
                    <td className="px-5 py-2 outline">
                      {Number(row.spend_upper_bound)}
                    </td>
                    {/* <td className="px-5 py-2 outline">{row.ad_snapshot_url}</td> */}
                  </tr>
                ))}{" "}
              </tbody>{" "}
            </table>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <p className="text-2xl text-white">
            {pythonrows.data ? <Table /> : "Loading tRPC query..."}
          </p>
        </div>
      </main>
    </>
  );
}
