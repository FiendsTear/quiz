import { ButtonHTMLAttributes, PropsWithChildren } from "react";

export enum ButtonVariant {
  WARNING,
}

export default function Button(
  props: PropsWithChildren & {
    variant?: ButtonVariant;
    attr: ButtonHTMLAttributes<HTMLButtonElement>;
  }
) {
  function getStylesByType() {
    switch (props.variant) {
      case ButtonVariant.WARNING:
        return "bg-red-300 hover:bg-red-400";
      default:
        return "bg-emerald-300 hover:bg-emerald-200 border-none rounded-md text-inherit p-1 cursor-pointer font-family: inherit";
    }
  }
  return (
    <button type="button" className={getStylesByType()}>
      {props.children}
    </button>
  );
}
