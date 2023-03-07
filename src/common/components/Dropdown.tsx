import type { ReactNode} from "react";
import { useState, forwardRef } from "react";
import type { Tag } from "@prisma/client";
import debounce from "lodash.debounce";
import Loading from "./Loading";

interface Props {
  name: string,
  handleClick: { (id: number): void };
  options?: Tag[],
  className?: string,
  children?: ReactNode;
}
type Ref = HTMLInputElement;

const Dropdown = forwardRef<Ref, Props>(({ name, options, handleClick, ...rest }, ref) => {

  const [isFocused, setFocused] = useState(false);

  return (
    <div className="relative">
      <input
        type="text"
        autoComplete="off"
        name={name}
        {...rest}
        ref={ref}
        onFocus={() => setFocused(true)}
        onBlur={debounce(() => setFocused(false), 500)}
      />
      <div className={isFocused ? "absolute bg-white w-full shadow-md" : "hidden"}>
        <ul className="divide-y divide-gray-200 overflow-y-auto max-h-32">
          {!options && <Loading />}
          {options?.map((option) => {
            return (
              <li
                className="cursor-pointer p-1 border-solid border-0 hover:bg-emerald-200"
                key={option.id}
                onClick={() => handleClick(option.id)}
              >
                {option.name}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
});

Dropdown.displayName = "Dropdown";

export default Dropdown;