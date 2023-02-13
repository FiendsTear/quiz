import type { ReactElement, ReactNode } from "react";
import type { RouterOutputs } from "../../utils/trpc";

export type GamePage = {
  (props: {
    gameID: number;
    gameState: RouterOutputs["game"]["getGameState"];
  }): ReactElement<any, any>;
  getLayout?: (page: ReactElement) => ReactNode;
};
