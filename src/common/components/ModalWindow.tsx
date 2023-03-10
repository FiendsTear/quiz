import React, { PropsWithChildren } from "react";
import { useRef, useEffect } from "react";
export function ModalWindow(props: PropsWithChildren) {
  const modal = useRef<HTMLDivElement>(null);
  useEffect(() => {
    modal.current?.focus();
    console.log("setting focus");
  });
  function handleExit(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.code === "Escape") {
    }
  }
  return (
    <div
      ref={modal}
      tabIndex={0}
      onKeyDown={handleExit}
      className="absolute w-full h-full flex items-center justify-center isolate bg-stone-800/60 z-10 outline-none"
    >
      {props.children}
    </div>
  );
}
