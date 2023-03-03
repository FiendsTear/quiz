import { trpc } from '@/utils/trpc';
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import debounce from "lodash.debounce";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faPlus } from "@fortawesome/free-solid-svg-icons";
import type { CreateTagDTO } from "@/server/quiz/dto/createTagDTO";
import type { Tag } from "@prisma/client";
import Loading from "@/common/components/Loading";
import { useTranslation } from "next-i18next";

export default function TagEditor(props: {
  tags: Tag[] | undefined;
  quizID: number;
  refetchQuiz: { (): void };
}) {
  const [isTagAdding, setTagAdding] = useState<boolean>(false);
  const [tagName, setTagName] = useState<string>('');
  const newTag: CreateTagDTO = { quizID: props.quizID, name: tagName };
  const { register } = useForm<CreateTagDTO>({
    values: newTag,
  });

  const { t } = useTranslation("common");

  const getSimilarTags = trpc.quiz.getSimilarTags.useQuery(newTag);

  const attachTag = trpc.quiz.attachTag.useMutation();

  const removeTag = trpc.quiz.removeTag.useMutation();

  const createTag = trpc.quiz.createTag.useMutation();

  function refetchTags() {
    getSimilarTags.refetch().catch((err) => console.error(err));
  }

  function attachTagToQuiz(tagID: number) {
    attachTag.mutate(
      { quizID: props.quizID, tagID },
      {
        onSuccess: () => {
          refetchTags();
          props.refetchQuiz();
          setTagName('');
        },
      }
    );
  }

  function removeTagFromQuiz(tagID: number) {
    removeTag.mutate(
      { quizID: props.quizID, tagID },
      {
        onSuccess: () => {
          refetchTags();
          props.refetchQuiz();
        },
      }
    );
  }

  function createNewTag() {
    createTag.mutate(
      { ...newTag },
      {
        onSuccess: () => {
          refetchTags();
          props.refetchQuiz();
          setTagName('');
        },
      }
    );
  }

  return (
    <div>
      <ul className="flex items-center gap-2 m-0">
        <li>{t("Tags")}:</li>
        {props.tags?.map((tag) => {
          return (
            <li className="bg-emerald-300 rounded-md pl-1" key={tag.id}>
              {tag.name}
              <button
                type="button"
                className="ml-1"
                onClick={() => removeTagFromQuiz(tag.id)}
              >
                <FontAwesomeIcon icon={faXmark}></FontAwesomeIcon>
              </button>
            </li>
          );
        })}
        {!isTagAdding && (
          <li>
            <button
              type="button"
              className="aspect-square"
              onClick={() => setTagAdding(true)}
            >
              <FontAwesomeIcon icon={faPlus}></FontAwesomeIcon>
            </button>
          </li>
        )}
      </ul>
      {isTagAdding && (
        <div className="mt-3">
          <label htmlFor="quiz-tag">{t("Tag name")}</label>
          <input
            type="text"
            id="quiz-tag"
            {...register("name", {
              onChange: debounce((e: React.ChangeEvent<HTMLInputElement>) => {
                setTagName(e.target.value);
                refetchTags();
              }, 700),
            })}
          />
          {!getSimilarTags.data && <Loading />}
          {getSimilarTags.data && getSimilarTags.data.length > 0 && newTag.name.length > 1 && (
            <ul className="flex items-center gap-2">
              <li>{t("Similar Tags")}:</li>
              {getSimilarTags.data.map((tag) => {
                return (
                  <li key={tag.id}>
                    <button type="button" onClick={() => attachTagToQuiz(tag.id)}>
                      {tag.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              disabled={newTag.name.length < 3}
              onClick={createNewTag}>
              {t("Create New Tag")}
            </button>
            <button type="button" onClick={() => setTagAdding(false)}>
              {t("Cancel")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
