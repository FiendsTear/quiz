import { Rubik } from "@next/font/google";
import Button, { ButtonVariant } from "../../common/components/Button";
import { useRouter } from "next/router";
const rubik = Rubik({ subsets: ["cyrillic", "latin"] });
export default function GameLayout({ children }: any) {
  const { push } = useRouter();
  return (
    <main className={`bg-teal-200 p-5 w-scheen h-screen ${rubik.className}`}>
      <Button
        attr={{ className: "fixed top-2 right-2" }}
        variant={ButtonVariant.WARNING}
        onClick={async () => push("/games")}
      >
        Leave
      </Button>
      {children}
    </main>
  );
}
