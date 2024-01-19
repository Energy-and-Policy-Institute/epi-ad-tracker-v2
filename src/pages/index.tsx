import Link from "next/link";
import { api } from "~/utils/api";

export default function Home() {
  const hello = api.post.hello.useQuery({ text: "from tRPC" });
  // const pythonrows = api.python.getCurrentPythonRows.useQuery();
  const country = api.python.getcountryRows.useQuery();
  const company = api.python.getCompanyRows.useQuery({
    text: "482100658584410",
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
                  <tr
                    key={row.id}
                    // className="center text-center font-bold outline"
                  >
                    <td className="px-5 py-2 outline">
                      {row.location.toString()}
                    </td>
                    <td className="px-5 py-2 outline">
                      ${Number(row.lowerspend)} -{Number(row.upperspend)}
                    </td>
                  </tr>
                ))}{" "}
              </tbody>{" "}
            </table>
          </>
        )}
      </div>
    );
  }

  function Table() {
    return (
      <div>
        {country.data?.length! > 0 && (
          <>
            <table>
              {" "}
              <thead>
                {" "}
                <tr className="outline">
                  {" "}
                  <th className="px-5 py-2 outline">COMPANY</th>
                  <th className="px-5 py-2 outline">ADS RAN</th>
                  <th className="px-5 py-2 outline">
                    Spending lower estimate
                  </th>{" "}
                  <th className="px-5 py-2 outline">
                    Spending higher estimate
                  </th>
                </tr>{" "}
              </thead>{" "}
              <tbody>
                {" "}
                {country.data!.map((row) => (
                  <tr
                    key={row.id}
                    // className="center text-center font-bold outline"
                  >
                    <td className="px-5 py-2 outline">
                      <Link
                        href="/company/[id]"
                        as={"/company/" + row.company.toString()}
                      >
                        {row.company.toString()}
                      </Link>
                    </td>
                    <td className="px-5 py-2 outline">{row.numberOfAds}</td>
                    <td className="px-5 py-2 outline">
                      {Number(row.lowerspend)}
                    </td>
                    <td className="px-5 py-2 outline">
                      {Number(row.upperspend)}
                    </td>
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
            {country.data ? <Table /> : "Loading tRPC query..."}
          </p>
          {/* <p className="text-2xl text-white">
            {company.data ? <SubTable /> : "Loading tRPC query..."}
          </p> */}
        </div>
      </main>
    </>
  );
}
