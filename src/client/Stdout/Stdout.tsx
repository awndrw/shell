import React from "react";
import DOMPurify from "dompurify";
import styles from "./Stdout.module.scss";

interface StdoutProps {
  children: React.ReactNode | [React.ReactNode, string];
  currentDir?: string;
}

export const Stdout: React.FC<StdoutProps> = ({ children, currentDir }) => {
  const [command, result] = Array.isArray(children)
    ? children
    : [children, null];
  return (
    <div className={styles.container}>
      <span className={styles.command}>
        {currentDir}
        {" $"}
        <span className={styles.commandText}>{command}</span>
      </span>
      {result}
    </div>
  );
};
