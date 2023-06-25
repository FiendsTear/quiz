import { RouterOutputs, trpc } from "../../../utils/trpc";
import { useQuizStore } from "../quizStore";
import {
	validAnswerSchema,
	validQuestionSchema,
	validQuizSchema,
} from "@/modules/quiz/quizSchema";

export function usePublisher(quizID: string) {
	const getQuizQuery = trpc.quiz.getQuiz.useQuery(quizID);
	const ctx = trpc.useContext();
	const quizMutation = trpc.quiz.addOrUpdateQuiz.useMutation();
	const setAnswerError = useQuizStore((state) => state.setAnswerError);
	const setQuestionError = useQuizStore((state) => state.setQuestionError);
	const setQuizError = useQuizStore((state) => state.setQuizError);

	async function validate() {
		const quizData = (await getQuizQuery.refetch()).data;
		if (!quizData) return false;
		let quizValidForPublication = true;
		quizData.questions.map((question) => {
			const questionData = ctx.quiz.getQuestion.getData(question.id);
			if (!questionData) return;
			const answers: RouterOutputs["quiz"]["getAnswer"][] = [];
			// validate and consolidate question answers
			questionData.answers.map((answer) => {
				const answerData = ctx.quiz.getAnswer.getData(answer.id);
				if (!answerData) return;
				answers.push(answerData);
				const answerParseRes = validAnswerSchema.safeParse(answerData);
				if (!answerParseRes.success) {
					quizValidForPublication = false;
					setAnswerError(answer.id, answerParseRes.error.issues);
				}
			});
			const dataToParse = { ...questionData, ...{ answers } };
			const parseRes = validQuestionSchema.safeParse(dataToParse);
			if (!parseRes.success) {
				quizValidForPublication = false;
				setQuestionError(question.id, parseRes.error.issues);
			}
		});

		const quizParseRes = validQuizSchema.safeParse(quizData);
		if (!quizParseRes.success) {
			setQuizError(quizParseRes.error.issues);
			quizValidForPublication = false;
		}
		return quizValidForPublication;
	}

	async function publish() {
		const isValid = await validate();
		if (!isValid) return false;
		else {
			try {
				await quizMutation.mutateAsync(
					{ id: +quizID, isPublished: true },
				);
				return true;
			}
			catch (err) {
				console.error(err);
				return false;
			}
		}
	}

	return { publish };
}