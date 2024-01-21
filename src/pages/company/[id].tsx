// pages/[id].js
// "use client";
import { Decimal } from "@prisma/client/runtime/library";
import { useRouter } from "next/router";
import { api } from "~/utils/api";

const DynamicPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const company = api.python.getCompanyRows.useQuery({
    text: id?.toString()!,
  });

  function ReCutNumber(num: Decimal): string {
    let numstring: String = String(num);

    if (numstring.includes(".")) {
      let NumSlice: String[] = numstring.split(".");
      let num1: String = NumSlice[0]!;
      let num2: String = NumSlice[1]?.substring(0, 2)!;
      let num3: String = num1.toString() + "." + num2.toString();
      return num3.toString();
    }
    return numstring.toString();
  }

  function SubTable() {
    return (
      <div>
        {company.data?.length! > 0 && (
          <>
            <table>
              {" "}
              <thead>
                {" "}
                <tr className="outline">
                  {" "}
                  <th className="px-5 py-2 outline">STATE</th>
                  <th className="px-5 py-2 outline">SPENDING</th>
                </tr>{" "}
              </thead>{" "}
              <tbody>
                {" "}
                {company.data!.map((row) => (
                  <>
                    {/* row.upperspend > 0 &&  */}
                    {true && (
                      <tr
                        onClick={() => {
                          ReCutNumber(row.lowerspend);
                          // console.log("paloki");
                        }}
                        key={row.id}
                        // className="center text-center font-bold outline"
                      >
                        <td className="px-5 py-2 outline">
                          {row.location.toString()}
                        </td>
                        <td className="px-5 py-2 outline">
                          {row.lowerspend !== row.upperspend && (
                            <>
                              ${ReCutNumber(row.lowerspend)} -
                              {ReCutNumber(row.upperspend)}{" "}
                            </>
                          )}
                          {row.lowerspend === row.upperspend && (
                            <>${ReCutNumber(row.upperspend)} </>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))}{" "}
              </tbody>{" "}
            </table>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <p className="text-2xl text-white">
            {company.data ? <SubTable /> : "Loading tRPC query..."}
          </p>
        </div>
      </main>
    </div>
  );
};

export default DynamicPage;
