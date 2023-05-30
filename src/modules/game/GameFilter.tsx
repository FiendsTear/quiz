import { trpc } from "@/utils/trpc";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import lodash from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import type { Tag } from "@prisma/client";
import Dropdown from "@/common/components/Dropdown";
import { useTranslation } from "next-i18next";
import Button from "../../common/components/Button";
import { FilterQuizDTO } from '@/server/quiz/dto/filterQuizDTO';

export default function GameFilter(props: {
  onSubmit: { (filter: FilterQuizDTO): void }
}) {
  const [dropdownTags, setDropdownTags] = useState<Tag[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [allowedToFetch, setAllowedToFetch] = useState(true);
  const [isError, setError] = useState(false);
  const [tagName, setTagName] = useState<string>("");
  const [quizName, setQuizName] = useState<string>("");
  
  const filter: FilterQuizDTO = { tags, quizName };

  useEffect(() => {
    props.onSubmit(filter);
  }, [quizName, tags]);


  const tagsQuery = trpc.quiz.getTags.useQuery(tagName, {
    enabled: allowedToFetch,
    onSuccess: (e) => setDropdownTags(e),
  });

  const { register } = useForm<FilterQuizDTO & { tagName: string }>({
    values: { ...filter, tagName },
  });

  const { t } = useTranslation("common");

  function active(tag: Tag) {
    if (allowedToFetch) setAllowedToFetch(false);
    setTagName(tag.name);
  }

  function filterAddTag(newTag: Tag) {
    let isTagRepeated = false;
    tags.forEach((tag) => {
      if (tag.id === newTag.id) isTagRepeated = true;
    });
    if (!isTagRepeated) {
      setTags([...tags, newTag]);
      setTagName("");
    }
  }

  function filterRemoveTag(removeTag: Tag) {
    setTags(tags.filter((tag) => tag.id !== removeTag.id));
  }

  function submitFilterTag(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (dropdownTags?.length) {
      for (let i = 0; i < dropdownTags.length; i++)
        if (tagName === dropdownTags[i].name.toLowerCase()) {
          filterAddTag(dropdownTags[i]);
          break;
        } else if (i === dropdownTags.length - 1) setError(true);
    } else setError(true);
  }

  return (
    <div className="mb-6 flex flex-col gap-3">
      <h4 className="m-0">{t("Filter")}</h4>
      <form onSubmit={submitFilterTag} className="flex gap-2 items-center">
        <label htmlFor="filter-tags">{t("Tags")}</label>
        <ul className="flex grow items-center gap-2 m-0">
          {tags.map((tag) => {
            return (
              <li
                className="flex-none bg-teal-300 rounded-md pl-1"
                key={tag.id}
              >
                {tag.name}
                <Button
                  attr={{ className: "ml-1" }}
                  onClick={() => filterRemoveTag(tag)}
                >
                  <FontAwesomeIcon icon={faXmark}></FontAwesomeIcon>
                </Button>
              </li>
            );
          })}
          <li className="grow min-w-max flex items-center gap-1">
            <Dropdown
              id="filter-tags"
              className="w-all lowercase"
              options={tagName.length ? dropdownTags : []}
              handleClick={filterAddTag}
              handleActive={active}
              {...register("tagName", {
                onChange: lodash.debounce(
                  (e: React.ChangeEvent<HTMLInputElement>) => {
                    setTagName(e.target.value);
                    if (!allowedToFetch) setAllowedToFetch(true);
                  },
                  700
                ),
              })}
            ></Dropdown>
          </li>
        </ul>
      </form>
      <div className="flex">
        <label htmlFor="filter-quiz">{t("Quiz name")}</label>
        <input
          id="filter-quiz"
          type="text"
          className="grow"
          {...register("quizName", {
            onChange: lodash.debounce(
              (e: React.ChangeEvent<HTMLInputElement>) => {
                setQuizName(e.target.value);
              },
              700
            ),
          })}
        />
      </div>
    </div>
  )
}