import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
//comment to make sure I can commit to github
const MyApp: AppType = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default api.withTRPC(MyApp);
