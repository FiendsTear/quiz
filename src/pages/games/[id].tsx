import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";

export default function GamePage() {
  const { query } = useRouter();

  const onEnterSub = trpc.game.onEnter.useSubscription(query.id as string, {
    onData(input: any) {
      console.log(input);
    },
    onError(err) {
      console.log(err);
    },
  });

  return <section>Game</section>;
}
