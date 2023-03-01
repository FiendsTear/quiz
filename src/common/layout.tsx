import Header from "./components/Header";
import Footer from "./components/Footer";

export default function Layout({ children }: any) {
  return (
    <>
      <Header />
      <main className="grid relative grow px-5 py-3 overflow-y-scroll">
        {children}
      </main>
      <Footer />
    </>
  );
}
