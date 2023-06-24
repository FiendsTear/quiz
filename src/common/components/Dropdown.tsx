import { ReactNode, useState } from "react";
import { forwardRef } from "react";
import type { Tag } from "@prisma/client";
import Loading from "./Loading";
import { useComponentVisible } from '../hooks/useComponentVisible';

interface Props {
  id?: string,
  name: string,
  handleClick: { (tag: Tag): void };
  handleActive?: { (tag: Tag): void };
  options?: Tag[],
  className?: string,
  children?: ReactNode;
}
type Ref = HTMLInputElement;

const Dropdown = forwardRef<Ref, Props>(({ options, handleActive, handleClick, ...rest }, refInput) => {

  const { refDiv, isComponentVisible, setIsComponentVisible } = useComponentVisible(false);

  const [activeOption, setActiveOption] = useState<number>(0);

  const keyDownHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (options?.length) {
      if (event.key === "ArrowUp" && activeOption > 0 && activeOption <= options.length - 1) {      //previous option
        if (!isComponentVisible) setIsComponentVisible(true);
        setActiveOption(activeOption - 1);
        handleActive?.(options[activeOption - 1]);
      } else if (event.key === "ArrowDown" && activeOption >= 0 && activeOption < options.length - 1) {     //next option
        if (!isComponentVisible) setIsComponentVisible(true);
        setActiveOption(activeOption + 1);
        handleActive?.(options[activeOption + 1]);
      } else if (activeOption === 0 && options.length > 0 && event.key === "ArrowUp") {     //looping
        if (!isComponentVisible) setIsComponentVisible(true);
        setActiveOption(options.length - 1);
        handleActive?.(options[options.length - 1]);
      } else if (options.length > 0 && (event.key === "ArrowUp" || event.key === "ArrowDown")) {      //looping and resetting
        if (!isComponentVisible) setIsComponentVisible(true);
        setActiveOption(0);
        handleActive?.(options[0]);
      }
    }
  }

  return (
    <div className="w-full h-full relative" ref={ refDiv } onKeyDown={ keyDownHandler }>
      <input
        type="text"
        autoComplete="off"
        {...rest}
        ref={refInput}
        onFocus={() => setIsComponentVisible(true)}
      />
      {isComponentVisible && (
        <div className="absolute bg-white w-full shadow-md z-10">
          <ul className="divide-y divide-gray-200 overflow-y-auto max-h-32">
            {!options && <Loading />}
            {options?.map((option, i) => {
              return (
                <li
                  className={(activeOption == i ? "bg-teal-200 " : "") + "cursor-pointer p-1 border-solid border-0 hover:bg-teal-200 focus:bg-teal-200"}
                  key={option.id}
                  onClick={() => {
                    handleClick(option);
                    setIsComponentVisible(false);
                  }}
                >
                  {option.name}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
});

Dropdown.displayName = "Dropdown";

export default Dropdown;