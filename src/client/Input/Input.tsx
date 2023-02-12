import React from "react";
import styles from "./Input.module.scss";

interface InputProps {
  onSubmit: (command: string) => void;
  getCommandAtIndex: (index: number) => string | null;
}

export const Input: React.FC<InputProps> = ({
  onSubmit,
  getCommandAtIndex,
}) => {
  const inputRef = React.createRef<HTMLInputElement>();
  const [inputWidth, setInputWidth] = React.useState(0);
  const [caretPosition, setCaretPosition] = React.useState(0);
  const [currentInput, setCurrentInput] = React.useState("");
  const [historyIndex, setHistoryIndex] = React.useState(-1);

  const updateWidth = React.useCallback(
    (value: string) => {
      setInputWidth(getTextWidth(inputRef.current!, value));
    },
    [inputRef]
  );

  const onSubmitForm: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    onSubmit(currentInput);
    setCurrentInput("");
    setHistoryIndex(-1);
  };

  const onInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    e.stopPropagation();
    setCurrentInput(e.target.value);
    updateWidth(e.target.value);
  };

  React.useEffect(() => {
    updateWidth(currentInput ?? "");
  }, [currentInput, updateWidth]);

  React.useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      const input = inputRef.current;
      if (!input) return;
      if (e.key === "ArrowUp") {
        setHistoryIndex((prev) => prev + 1);
      } else if (e.key === "ArrowDown") {
        setHistoryIndex((prev) => prev - 1);
      }
    };
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, [getCommandAtIndex, inputRef, updateWidth]);

  React.useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const updateCaretPosition = (e: KeyboardEvent) => {
      // @ts-ignore
      const { selectionStart, value } = e.target;
      if ((selectionStart || selectionStart === 0) && value !== undefined) {
        const textWidth = getTextWidth(input, value);
        let caretPositionFromStart = getTextWidth(
          input,
          value.slice(0, selectionStart)
        );
        if (caretPositionFromStart < textWidth) {
          caretPositionFromStart -= 2;
        }
        setCaretPosition(caretPositionFromStart - textWidth);
      }
    };
    input.addEventListener("keyup", updateCaretPosition);
    const focus = () => input.focus();
    window.addEventListener("click", focus);
    return () => {
      input.removeEventListener("keyup", updateCaretPosition);
      window.removeEventListener("click", focus);
    };
  }, [inputRef]);

  return (
    <form onSubmit={onSubmitForm}>
      <input
        type="text"
        spellCheck={false}
        autoFocus
        autoComplete="off"
        value={currentInput}
        onChange={onInputChange}
        style={{ width: `${inputWidth + 4}px` }}
        ref={inputRef}
        className={styles.input}
      />
      <span
        className={styles.cursor}
        style={{
          marginLeft: `${caretPosition}px`,
        }}
      >
        _
      </span>
    </form>
  );
};

export const getTextWidth = (el: HTMLElement, text: string) => {
  const style = window.getComputedStyle(el);
  const font = [
    style.fontWeight,
    style.fontStyle,
    style.fontSize,
    style.fontFamily,
  ].join(" ");
  const context = document
    .createElement("canvas")
    .getContext("2d") as CanvasRenderingContext2D;
  context.font = font;
  return context.measureText(text).width;
};
