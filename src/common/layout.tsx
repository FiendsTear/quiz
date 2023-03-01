import Header from "../modules/Header";
import Footer from "../modules/Footer";

export default function Layout({ children }: any) {
  return (
    <>
      <Header />
      <main className="grid relative grow px-5 py-3 overflow-y-scroll">{children}</main>
      <Footer />
    </>
  );
}
