
import { useRouter } from "next/router";
import { RegionalBreakdownSchema } from "types";
import { api } from "~/utils/api";

const Page = () => {
  const router = useRouter();
  const id = (router.query.id ?? '') as string;
  const {data: frontGroup, isLoading} = api.frontGroup.get.useQuery({ id });
  const regionalBreakdown = RegionalBreakdownSchema.parse(frontGroup?.regionalBreakdown)

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="flex flex-col items-center w-full py-5">
      <button className="font-bold underline" onClick={() => router.back()}>Back</button>
      <h1 className="text-3xl font-semibold py-4">{frontGroup?.name}</h1>
      {regionalBreakdown && (
        <table>
          <thead>
            <tr className="border-b border-gray-400">
              <th className="px-5 py-2">State</th>
              <th className="px-5 py-2">Spend</th>
            </tr>
          </thead>
          <tbody>
            {regionalBreakdown.sort((a, b) => b.upperbound - a.upperbound).map((row, i) => (
              <tr
                key={i}
                className="border-b border-gray-400"
              >
                <td className="px-5 py-2">
                  {row.name}
                </td>
                <td className="px-5 py-2">
                  {`$${row.lowerbound.toFixed(0)} - $${row.upperbound.toFixed(0)}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
};

export default Page;
