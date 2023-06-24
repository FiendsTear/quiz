import { trpc } from "@/utils/trpc";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import lodash from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faPlus,
  faMinus,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import type { CreateTagDTO } from "@/server/quiz/dto/createTagDTO";
import type { Tag } from "@prisma/client";
import Dropdown from "@/common/components/Dropdown";
import { useTranslation } from "next-i18next";
import Button, { ButtonVariant } from "../../../common/components/Button";

export default function TagEditor(props: {
  tags: Tag[] | undefined;
  quizID: number;
  refetchQuiz: { (): void };
}) {
  const [isTagAdding, setTagAdding] = useState<boolean>(false);
  const [isError, setError] = useState<boolean>(false);
  const [tagName, setTagName] = useState<string>("");
  const [allowedToFetch, setAllowedToFetch] = useState(true);
  const [similarTags, setSimilarTags] = useState<Tag[]>([]);
  const newTag: CreateTagDTO = { quizID: props.quizID, name: tagName };
  const { register } = useForm<CreateTagDTO>({
    values: newTag,
  });

  const { t } = useTranslation("common");

  const getSimilarTags = trpc.quiz.getSimilarTags.useQuery(newTag, {
    enabled: allowedToFetch,
    onSuccess: (e) => setSimilarTags(e),
  });

  const attachTag = trpc.quiz.attachTag.useMutation();

  const removeTag = trpc.quiz.removeTag.useMutation();

  const createTag = trpc.quiz.createTag.useMutation();

  function refetchTags() {
    if (allowedToFetch)
      getSimilarTags.refetch().catch((err) => console.error(err));
  }

  function active(tag: Tag) {
    if (allowedToFetch) setAllowedToFetch(false);
    setTagName(tag.name);
  }

  function attachTagToQuiz(tag: Tag) {
    attachTag.mutate(
      { quizID: props.quizID, tagID: tag.id },
      {
        onSuccess: () => resetOnSuccess(),
        onError: () => setError(true),
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

  function updateTags(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (similarTags?.length) {
      for (let i = 0; i < similarTags.length; i++)
        if (tagName === similarTags[i].name.toLowerCase()) {
          attachTagToQuiz(similarTags[i]);
          break;
        } else if (i === similarTags.length - 1) createNewTag();
    } else createNewTag();
  }

  function createNewTag() {
    if (tagName.length > 2)
      createTag.mutate(
        { ...newTag },
        {
          onSuccess: () => resetOnSuccess(),
          onError: () => setError(true),
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
    <form className="text-sm">
      <ul className="flex items-center gap-2 m-0">
        <li><label htmlFor="quiz-tags">{t("Tags")}:</label></li>
        {props.tags?.map((tag) => {
          return (
            <li className="flex-none bg-teal-300 rounded-md pl-1" key={tag.id}>
              {tag.name}
              <Button
                variant={ButtonVariant.WARNING}
                onClick={() => removeTagFromQuiz(tag.id)}
                attr={{
                  className: "ml-1",
                  title: "Remove tag",
                }}
              >
                <FontAwesomeIcon icon={faXmark}></FontAwesomeIcon>
              </Button>
            </li>
          );
        })}
        {!isTagAdding && (
          <li>
            <Button onClick={() => setTagAdding(true)}>
              <FontAwesomeIcon icon={faPlus}></FontAwesomeIcon>
            </Button>
          </li>
        )}
        {isTagAdding && (
          <li className="flex items-center gap-1 h-full">
            <Dropdown
              id="quiz-tags"
              className="h-full lowercase"
              options={tagName.length > 2 ? similarTags : []}
              handleClick={attachTagToQuiz}
              handleActive={active}
              {...register("name", {
                onChange: lodash.debounce((e: React.ChangeEvent<HTMLInputElement>) => {
                  setTagName(e.target.value);
                  if (!allowedToFetch) setAllowedToFetch(true);
                }, 700),
              })}
            ></Dropdown>
            <Button
              attr={{ type: "submit", className: "ml-1", disabled: newTag.name.length < 3 }}
              onClick={updateTags}
            >
              <FontAwesomeIcon icon={faCheck}></FontAwesomeIcon>
            </Button>
            <Button attr={{ type: "reset" }} onClick={() => resetOnSuccess()}>
              <FontAwesomeIcon icon={faMinus}></FontAwesomeIcon>
            </Button>
            {isError && (
              <span className="text-red-500">
                {t("This tag is already attached")}
              </span>
            )}
          </li>
        )}
      </ul>
    </form>
  );
}
