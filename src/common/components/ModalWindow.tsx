import React from "react";
import { useRef, useEffect } from "react";
export function ModalWindow(props: {
  children: React.ReactNode;
  exit: () => void;
}) {
  const modal = useRef<HTMLDivElement>(null);
  useEffect(() => {
    modal.current?.focus();
  });
  function handleExit(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.code === "Escape") {
      console.log("exiting");
      props.exit();
    }
  }
  return (
    <div
      ref={modal}
      tabIndex={0}
      onKeyDown={handleExit}
      className="top-0 left-0 fixed w-screen h-screen flex items-center justify-center isolate bg-stone-800/60 z-10 outline-none"
    >
      {props.children}
    </div>
  );
}
