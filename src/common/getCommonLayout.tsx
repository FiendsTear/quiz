import { ReactElement } from "react";
import Layout from "./layout";

export default function GetCommonLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
}
