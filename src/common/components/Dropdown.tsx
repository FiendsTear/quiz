import type { ReactNode } from "react";
import { forwardRef } from "react";
import type { Tag } from "@prisma/client";
import Loading from "./Loading";
import { useComponentVisible } from '../useComponentVisible';

interface Props {
  id?: string,
  name: string,
  handleClick: { (tag: Tag): void };
  options?: Tag[],
  className?: string,
  children?: ReactNode;
}
type Ref = HTMLInputElement;

const Dropdown = forwardRef<Ref, Props>(({ id, name, options, handleClick, ...rest }, refInput) => {

  const { refDiv, isComponentVisible, setIsComponentVisible } = useComponentVisible(false);

  return (
    <div className="w-full h-full relative" ref={refDiv}>
      <input
        type="text"
        autoComplete="off"
        name={name}
        id={id}
        {...rest}
        ref={refInput}
        onFocus={() => setIsComponentVisible(true)}
      />
      {isComponentVisible && (
        <div className="absolute bg-white w-full shadow-md z-10">
          <ul className="divide-y divide-gray-200 overflow-y-auto max-h-32">
            {!options && <Loading />}
            {options?.map((option) => {
              return (
                <li
                  className="cursor-pointer p-1 border-solid border-0 hover:bg-teal-200"
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