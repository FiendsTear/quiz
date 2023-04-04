import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { useState } from "react";

export enum ButtonVariant {
  WARNING,
  SELECTION,
}

type ButtonProps = {
  variant?: Exclude<ButtonVariant, ButtonVariant.SELECTION>;
  attr?: ButtonHTMLAttributes<HTMLButtonElement>;
  onClick: { (...args: any): any };
};

type SelectionButtonProps = Omit<ButtonProps, "variant"> & {
  variant: ButtonVariant.SELECTION;
  selected: boolean;
};

export default function Button(
  props: PropsWithChildren & (ButtonProps | SelectionButtonProps)
) {
  function getButtonAttributes(): ButtonHTMLAttributes<HTMLButtonElement> {
    const commonAttr: ButtonHTMLAttributes<HTMLButtonElement> = {
      className: "border-none rounded-md text-inherit p-1 cursor-pointer",
    };
    let variantAttr: ButtonHTMLAttributes<HTMLButtonElement> = {};
    switch (props.variant) {
      case ButtonVariant.WARNING:
        variantAttr = {
          className: "bg-rose-600 hover:bg-rose-400",
          type: "button",
        };
        break;
      case ButtonVariant.SELECTION:
        variantAttr = {
          className: props.selected ? "bg-amber-300" : "bg-amber-200",
        };
        break;
      default:
        variantAttr = {
          className: "bg-emerald-600 hover:bg-emerald-500",
          type: "button",
        };
        break;
    }
    // override common attribute by provided in variant, merge classname
    variantAttr = {
      ...commonAttr,
      ...variantAttr,
      className: `${variantAttr.className || ""} ${commonAttr.className || ""}`,
    };
    // override any attribute by provided in props, merge classname
    return {
      ...variantAttr,
      ...props.attr,
      className: `${variantAttr.className || ""} ${
        props.attr?.className || ""
      }`,
    };
  }
  return (
    <button
      style={{ fontFamily: "inherit" }}
      {...getButtonAttributes()}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}
