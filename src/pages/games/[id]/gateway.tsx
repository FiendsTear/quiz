import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";

export default function GameGatewayPage() {
  const { push, query } = useRouter();
  const enterMutation = trpc.game.enter.useMutation();
  console.log(enterMutation.isSuccess);
  if (!enterMutation.isSuccess) {
    enterMutation.mutate(Number(query.id?.toString()), {
      onSuccess() {
        console.log("enter");
        console.log(enterMutation.isSuccess);
        push(`/games/${query.id}/player`);
      },
    });
  }

  return <></>;
}
