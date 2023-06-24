import { useRouter } from "next/router";
import { RouterOutputs } from "../../../utils/trpc";
import { useTranslation } from "next-i18next";

type Quiz = RouterOutputs["quiz"]["getUserQuizzes"][number];

export default function QuizCard(props: { quiz: Quiz }) {
  const { t } = useTranslation("common");
  const { quiz } = props;

  return (
    <section
      
      className="flex flex-col justify-between bordered hover:bg-teal-200 cursor-pointer gap-2 p-4"
    >
      <span className="block">{quiz.name}</span>
      <span className="opacity-60">
        {quiz.tags.map((tag) => tag.name).join(", ")}
      </span>
      <span
        className={
          quiz.isPublished
            ? quiz.isPrivate
              ? "text-rose-700"
              : "text-teal-700"
            : "text-gray-600"
        }
      >
        {quiz.isPublished
          ? quiz.isPrivate
            ? t("Private")
            : t("Published")
          : t("Unpublished")}
      </span>
    </section>
  );
}
