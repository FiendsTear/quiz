import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function GameGatewayPage() {
  const { push, query, isReady } = useRouter();
  const enterMutation = trpc.game.enter.useMutation({
    onSuccess(data) {
      console.log("enter");
      console.log(enterMutation);
      push(`/games/${query.id}/player`);
    },
  });
  useEffect(() => {
    if (enterMutation.isIdle && isReady)
      enterMutation.mutate(Number(query.id?.toString()));
  }, [query]);

  return <></>;
}
