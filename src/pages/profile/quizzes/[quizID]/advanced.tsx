// import { trpc } from "@/utils/trpc";
// import { useRouter } from "next/router";
// import { useTranslation } from "next-i18next";
// import { RouterInputs } from "../../../../../utils/trpc";
// import { useForm } from "react-hook-form";
// import lodash from "lodash";
// import { useQuizStore } from "../../../../../modules/quiz/quizStore";
// import { validQuestionSchema } from "../../../../../modules/quiz/quizSchema";
// import { QuestionDTO } from "../../../../../server/quiz/dto/questionDTO";
// import Loading from "../../../../../common/components/Loading";
// import AnswerEditor from "../../../../../modules/quiz/components/AnswerEditor";
// import Button from "../../../../../common/components/Button";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { ButtonVariant } from "../../../../../common/components/Button";
// import { faTrashCan, faXmark } from "@fortawesome/free-solid-svg-icons";
// import { getTranslations } from "@/common/helpers/getTranslations";
// import GetCommonLayout from "../../../../../common/getCommonLayout";

// export type QuestionInput = RouterInputs["quiz"]["addOrUpdateQuestion"];

export default function QuestionEditorPage() {
  return <></>;
  //   const { query, isReady } = useRouter();
  //   const questionID = +(query.questionID as string);
  //   const { t } = useTranslation();
  //   //   const [questionTimer, setTimer] = useState<ReturnType<
  //   //     typeof setTimeout
  //   //   > | null>(null);

  //   const mutation = trpc.quiz.addOrUpdateQuestion.useMutation();
  //   const getQuestionQuery = trpc.quiz.getQuestion.useQuery(questionID, {
  //     enabled: isReady,
  //   });
  //   const questionDeletion = trpc.quiz.deleteQuestion.useMutation();
  //   const answerMutation = trpc.quiz.addOrUpdateAnswer.useMutation();
  //   const answerDeletion = trpc.quiz.deleteAnswer.useMutation();

  //   const { register, getValues, setValue } = useForm<QuestionInput>({
  //     values: getQuestionQuery.data,
  //   });

  //   let issues = useQuizStore((state) => state.questionsErrors[questionID]);
  //   if (!issues) issues = {};
  //   const setQuestionError = useQuizStore((state) => state.setQuestionError);
  //   const questionSchema = validQuestionSchema.omit({ answers: true });

  //   if (!isReady || !getQuestionQuery.data) return <Loading />;
  //   const data = getQuestionQuery.data;

  //   function handleQuestionChange(changedValue: Partial<QuestionDTO>) {
  //     mutation.mutate(
  //       { ...data, ...changedValue },
  //       {
  //         onSuccess: () => {
  //         //   refetchQuestion();
  //         },
  //       }
  //     );
  //   }

  //   function refetchQuestion() {
  //     getQuestionQuery
  //       .refetch()
  //       .then((res) => {
  //         if (res.data) {
  //           const parseRes = questionSchema.safeParse(res.data);
  //           if (!parseRes.success)
  //             setQuestionError(res.data.id, parseRes.error.issues);
  //           else {
  //             setQuestionError(res.data.id, []);
  //           }
  //         }
  //       })
  //       .catch((err) => console.error(err));
  //   }

  //   function createAnswer() {
  //     answerMutation.mutate(
  //       { questionID: questionID },
  //       {
  //         onSuccess: () => {
  //           refetchQuestion();
  //         },
  //       }
  //     );
  //   }

  //   function deleteQuestion() {
  //     questionDeletion.mutate(questionID);
  //   }

  //   function deleteAnswer(answerID: number) {
  //     answerDeletion.mutate(answerID, {
  //       onSuccess: () => {
  //         refetchQuestion();
  //       },
  //     });
  //   }

  //   return (
  //     <article className="bg-teal-200 p-5 w-full h-full">
  //       <form className="flex flex-col justify-between h-full w-2/3 mx-auto">
  //         <div className="shrink">
  //           <Button
  //             variant={ButtonVariant.WARNING}
  //             attr={{ className: "aspect-square", title: "Delete question" }}
  //             onClick={deleteQuestion}
  //           >
  //             <FontAwesomeIcon icon={faXmark}></FontAwesomeIcon>
  //           </Button>
  //         </div>

  //         <div className="flex w-32 flex-col self-stretch">
  //           <label htmlFor="answer-weight">{t("Answer weight")}</label>
  //           <input
  //             id="answer-weight"
  //             type="number"
  //             className="block grow text-center text-lg"
  //             {...register("answerWeight", {
  //               onChange: lodash.debounce((e: React.ChangeEvent<HTMLInputElement>) => {
  //                 handleQuestionChange({ answerWeight: Number(e.target.value) });
  //               }, 700),
  //             })}
  //           ></input>
  //           <span className="issue invisible">{issues["body"] ? "i" : ""}</span>
  //         </div>
  //         <div className="grow flex justify-center items-center text-3xl">
  //           <div className="grow h-full flex flex-col">
  //             <label htmlFor="question-body">{t("Question text")}</label>
  //             <textarea
  //               id="question-body"
  //               className="grow text-center center"
  //               {...register("body", {
  //                 onChange: lodash.debounce((e: React.ChangeEvent<HTMLInputElement>) => {
  //                   handleQuestionChange({ body: e.target.value });
  //                 }, 700),
  //               })}
  //             ></textarea>
  //             <span className="issue">{issues["body"]}</span>
  //           </div>
  //         </div>
  //         <ul className="flex flex-col gap-2 mb-3 ">
  //           {data.answers.map((answer) => {
  //             return (
  //               <li key={answer.id} className="flex gap-x-5 gap-y-1 items-start">
  //                 <AnswerEditor
  //                   answerID={answer.id}
  //                   className="grow"
  //                 ></AnswerEditor>
  //                 <Button
  //                   onClick={() => deleteAnswer(answer.id)}
  //                   attr={{
  //                     title: "Delete answer",
  //                   }}
  //                   variant={ButtonVariant.WARNING}
  //                 >
  //                   <FontAwesomeIcon icon={faTrashCan} />
  //                 </Button>
  //               </li>
  //             );
  //           })}
  //           <li>
  //             <Button onClick={createAnswer}>{t("Add answer variant")}</Button>
  //           </li>
  //         </ul>

  //         {/* <Timer
  //         secondsToExpire={questionData.timerValue}
  //         onExpire={() => sendAnswers()}
  //       /> */}
  //         <Button onClick={() => {console.log('sending answers')}} attr={{ className: "text-lg" }}>
  //           {t("Send answers")}
  //         </Button>
  //       </form>
  // </article>
  //   );
}

// export const getServerSideProps = getTranslations;
// QuestionEditorPage.getLayout = GetCommonLayout;
