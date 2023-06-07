import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <title>inQuiz</title>
        <meta name="keywords" content="quiz,kahoot,test,poll,inquiz"></meta>
        <meta
          name="description"
          content="inQuiz is a platform for creating and playing quizzes"
        ></meta>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
