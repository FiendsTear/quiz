import { trpc } from "@/utils/trpc";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import debounce from "lodash.debounce";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faPlus, faMinus, faCheck } from "@fortawesome/free-solid-svg-icons";
import type { CreateTagDTO } from "@/server/quiz/dto/createTagDTO";
import type { Tag } from "@prisma/client";
import Dropdown from "@/common/components/Dropdown";
import { useTranslation } from "next-i18next";

export default function TagEditor(props: {
  tags: Tag[] | undefined;
  quizID: number;
  refetchQuiz: { (): void };
}) {
  const [isTagAdding, setTagAdding] = useState<boolean>(false);
  const [isError, setError] = useState<boolean>(false);
  const [tagName, setTagName] = useState<string>("");
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
        onSuccess: () => resetOnSuccess(),
        onError: () => setError(true)
      }
    );
  }

  function removeTagFromQuiz(tagID: number) {
    removeTag.mutate(
      { quizID: props.quizID, tagID },
      {
        onSuccess: () => resetOnSuccess(),
      }
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (getSimilarTags.data?.length === 1)
      attachTagToQuiz(getSimilarTags.data[0].id);
    else
      createNewTag();
  }

  function createNewTag() {
    createTag.mutate(
      { ...newTag },
      {
        onSuccess: () => resetOnSuccess(),
        onError: () => setError(true)
      }
    );
  }

  function resetOnSuccess() {
    refetchTags();
    props.refetchQuiz();
    setTagName("");
    setTagAdding(false);
    setError(false);
  }

  return (
    <form onSubmit={(e) => onSubmit(e)}>
      <ul className="flex items-center gap-2 m-0">
        <li>{t("Tags")}:</li>
        {props.tags?.map((tag) => {
          return (
            <li className="flex items-center flex-nowrap	bg-emerald-300 rounded-md pl-1" key={tag.id}>
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
              onClick={() => setTagAdding(true)}
            >
              <FontAwesomeIcon icon={faPlus}></FontAwesomeIcon>
            </button>
          </li>
        )}
        {isTagAdding && (
          <li className="flex items-center gap-1 h-full">
            <Dropdown
              className="h-full lowercase"
              options={getSimilarTags.data}
              handleClick={attachTagToQuiz}
              {...register("name", {
                onChange: debounce((e: React.ChangeEvent<HTMLInputElement>) => {
                  setTagName(e.target.value);
                  refetchTags();
                }, 700),
              })}
            ></Dropdown>
            <button className="ml-1" type="submit" disabled={newTag.name.length < 3}>
              <FontAwesomeIcon icon={faCheck}></FontAwesomeIcon>
            </button>
            <button type="reset" onClick={() => resetOnSuccess()}>
              <FontAwesomeIcon icon={faMinus}></FontAwesomeIcon>
            </button>
            {isError && <span className="text-red-500">{t("This tag is already attached")}</span>}
          </li>
        )}
      </ul>
    </form>
  );
}