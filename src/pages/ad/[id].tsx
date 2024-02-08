import { useRouter } from "next/router";
import { api } from "~/utils/api";
import Image from "next/image";

const Ad = () => {
    const router = useRouter();
    const id = router.query.id as string
    const {data: ad} = api.frontGroup.ad.useQuery(id);

    return (
        <div className="w-full flex flex-col items-center py-10 gap-y-3">
        <button onClick={() => router.back()}>Back</button>
        <h1 className="text-3xl">{ad?.page_name}</h1>
        <Image width={800} height={800} src={ad?.ad_screenshot_url ?? ''} alt="ad screenshot" />
        </div>
    );
}

export default Ad;