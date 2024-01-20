// pages/[id].js

import { useRouter } from "next/router";
import { api } from "~/utils/api";

const DynamicPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const company = api.python.getCompanyRows.useQuery({
    text: id?.toString()!,
  });

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
                        key={row.id}
                        // className="center text-center font-bold outline"
                      >
                        <td className="px-5 py-2 outline">
                          {row.location.toString()}
                        </td>
                        <td className="px-5 py-2 outline">
                          {row.lowerspend !== row.upperspend && (
                            <>
                              ${row.lowerspend} -{row.upperspend}{" "}
                            </>
                          )}
                          {row.lowerspend === row.upperspend && (
                            <>${row.upperspend} </>
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
