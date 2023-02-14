import Header from "../modules/Header";
import Footer from "../modules/Footer";

export default function Layout({ children }: any) {
  return (
    <>
      <Header />
      <main className="grow px-5 py-3">{children}</main>
      <Footer />
    </>
  );
}
