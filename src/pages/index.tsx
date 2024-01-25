import Link from "next/link";
import { api } from "~/utils/api";

export default function Home() {
  const {data: frontGroups, isLoading} = api.frontGroup.list.useQuery()

if (isLoading) return <div>Loading...</div>

    return (
      <div className="w-full py-3 flex flex-col items-center">
        <h1 className="text-3xl font-semibold py-4">EPI Front Group Ad Tracker 2.0</h1>
            <table>
              <thead>
                <tr className="border-b border-gray-400">
                  <th className="px-5 py-2">Front Group</th>
                  <th className="px-5 py-2">Total # of ads</th>
                  <th className="px-5 py-2">
                    Money spent
                  </th>
                </tr>
              </thead>
              <tbody>
                {frontGroups?.sort((a, b) => a.name.localeCompare(b.name)).map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-400"
                  >
                    <td className="px-5 py-2">
                      <Link
                        href={`/frontgroup/${encodeURIComponent(row.id)}`}
                        className="text-blue-500 hover:underline"
                      >
                        {row.name}
                      </Link>
                    </td>
                    <td className="px-5 py-2">{row.numAds}</td>
                    <td className="px-5 py-2">
                      {`$${row.adSpendLower} - $${row.adSpendUpper}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
    );
}
