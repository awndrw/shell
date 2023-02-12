"use client";

import { CommandResultSchema, Directory } from "util/type";
import DOMPurify from "dompurify";
import React from "react";
import z from "zod";
import { Stdout } from "client/Stdout";
import { Input } from "client/Input";
import {
  directoryStructure as defaultDirectoryStructure,
  getPath,
  makeDirectory,
  makeFile,
} from "util/directory";
import { createInitialState, pageReducer } from "./state";
import styles from "./page.module.scss";
import type { CommandResult, Command, Result } from "util/type";

export default function Page() {
  const [{ history, currentDir }, dispatch] = React.useReducer(
    pageReducer,
    null,
    createInitialState
  );

  const commands = React.useMemo<Record<string, Command>>(
    () => ({
      clear: {
        name: "clear",
        description: "clear the terminal screen",
        execute: () => {
          dispatch({ type: "CLEAR_HISTORY" });
          return "";
        },
      },
      help: {
        name: "help",
        description: "",
        execute: () => "that'd be too easy ;) try starting with 'ls'",
      },
      echo: {
        name: "echo",
        description: "write arguments to the standard output",
        execute: (args) => args.join(" "),
      },
      ls: {
        name: "ls",
        description: "list directory contents",
        execute: () => {
          let out = [];
          if (currentDir.subdirectories) {
            out.push(
              ...currentDir.subdirectories.map((subdir) => subdir.name + "/")
            );
          }
          if (currentDir.files) {
            out.push(...currentDir.files.map((file) => file.name));
          }
          return out.join(" ");
        },
      },
      cd: {
        name: "cd",
        description: "change current directory",
        execute: (args) => {
          const newDirName = args.at(0);
          if (!newDirName) return "cd: missing argument";
          if (newDirName === "..") {
            if (currentDir.parent) {
              dispatch({ type: "SET_DIRECTORY", payload: currentDir.parent });
              return "";
            }
          }
          if (currentDir.subdirectories) {
            const newCurrentDir = currentDir.subdirectories.find(
              (subdir) =>
                subdir.name.toLowerCase() === newDirName?.toLowerCase()
            );
            if (newCurrentDir) {
              dispatch({ type: "SET_DIRECTORY", payload: newCurrentDir });
              return "";
            }
          }
          return `cd: ${newDirName}: No such file or directory`;
        },
      },
      pwd: {
        name: "pwd",
        description: "return working directory name",
        execute: () => getPath(currentDir),
      },
      mkdir: {
        name: "mkdir",
        description: "make directories",
        execute: (args) => {
          const newDirName = args.at(0);
          if (!newDirName) return "mkdir: missing argument";
          if (
            currentDir.subdirectories &&
            currentDir.subdirectories.some(
              (subdir) => subdir.name.toLowerCase() === newDirName.toLowerCase()
            )
          ) {
            return `mkdir: cannot create directory ‘${newDirName}’: File exists`;
          }
          makeDirectory(currentDir, newDirName);
          dispatch({ type: "UPDATE_DIRECTORY" });
          return "";
        },
      },
      touch: {
        name: "touch",
        description: "create empty files",
        execute: (args) => {
          const newFileName = args.at(0);
          if (!newFileName) return "touch: missing argument";
          if (
            currentDir.files &&
            currentDir.files.some(
              (file) => file.name.toLowerCase() === newFileName.toLowerCase()
            )
          ) {
            return `touch: cannot create file ‘${newFileName}’: File exists`;
          }
          makeFile(currentDir, newFileName);
          dispatch({ type: "UPDATE_DIRECTORY" });
          return "";
        },
      },
      "": {
        name: "",
        description: "",
        execute: () => "",
      },
    }),
    [currentDir]
  );

  const addCommand = (commandStr: string) => {
    const rawInput = DOMPurify.sanitize(commandStr);
    const [command, ...args] = rawInput.split(" ");

    let result: Result;
    if (Object.keys(commands).includes(command)) {
      result = commands[command].execute(args);
    } else {
      result = `command not found: ${command}`;
    }
    // this currently un-does the "clear" command
    dispatch({
      type: "ADD_HISTORY",
      payload: { raw: rawInput, result, dir: getPath(currentDir) },
    });
    const scrollingElement = document.scrollingElement || document.body;
    scrollingElement.scrollTop = scrollingElement.scrollHeight;
  };

  return (
    <div className={styles.container}>
      {/* stdout */}
      {history.map((command, index) => (
        <Stdout currentDir={command.dir} key={index}>
          {command.raw}
          {command.result}
        </Stdout>
      ))}
      <Stdout currentDir={getPath(currentDir)}>
        <Input
          onSubmit={addCommand}
          getCommandAtIndex={(index) => history[index]?.raw}
        />
      </Stdout>
    </div>
  );
}
