import Header from "./components/Header";
import Footer from "./components/Footer";

import { Rubik } from "@next/font/google";
const rubik = Rubik({ subsets: ["cyrillic", "latin"] });
export default function Layout({ children }: any) {
  return (
    <>
      <Header />
      <main
        className={`grid relative grow px-5 py-3 overflow-y-auto ${rubik.className}`}
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
