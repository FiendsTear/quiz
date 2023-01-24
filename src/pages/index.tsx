/**
 * This is a Next.js page.
 */
import { trpc } from "../utils/trpc";

export default function IndexPage() {
  // 💡 Tip: CMD+Click (or CTRL+Click) on `greeting` to go to the server definition
  const mutation = trpc.quiz.addQuiz.useMutation();
  const query = trpc.quiz.getQuizzes.useQuery();

  // mutation.mutate("something");

  if (mutation.isLoading) {
    return (
      <div style={styles}>
        <h1>Loading...</h1>
      </div>
    );
  }
  return (
    <div style={styles}>
      {/**
       * The type is defined and can be autocompleted
       * 💡 Tip: Hover over `data` to see the result type
       * 💡 Tip: CMD+Click (or CTRL+Click) on `text` to go to the server definition
       * 💡 Tip: Secondary click on `text` and "Rename Symbol" to rename it both on the client & server
       */}
      <ul>
        quizzes
        {query.data?.map((quiz) => {
          return <li key={quiz.name}>{quiz.name}</li>;
        })}
      </ul>
      {mutation.isSuccess ? <div>{mutation.data?.name}</div> : null}
      <button
        onClick={() => {
          mutation.mutate("new quiz");
        }}
      >
        Create Todo
      </button>
    </div>
  );
}

const styles = {
  width: "100vw",
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};
