/**
 * This is a Next.js page.
 */
import Link from "next/link";
import { trpc } from "../utils/trpc";
import { useState } from "react";

export default function IndexPage() {
  // const mutation = trpc.quiz.addQuiz.useMutation();
  // const query = trpc.quiz.getQuizzes.useQuery();

  // mutation.mutate("something");

  const [input, setInput] = useState("");
  const mutation = trpc.game.add.useMutation();
  function handleClick() {
    mutation.mutate(input);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
  }

  const subscription = trpc.game.onAdd.useSubscription(undefined, {
    onData(input) {
      console.log("ws works " + input);
    },
    onError(err) {
      console.error(err);
    },
  });

  return (
    <main>
      <Link href="profile">Профиль</Link>
      <input onChange={handleChange}></input>
      <button onClick={handleClick}></button>
    </main>
  );
}
