import React from "react";
import {
  defaultDirectory,
  directoryStructure,
  stringifyDirectory,
  setParentDirs,
} from "util/directory";
import type { CommandResult, Directory } from "util/type";

type State = {
  currentDir: Directory;
  history: CommandResult[];
};

type Action =
  | { type: "ADD_HISTORY"; payload: CommandResult }
  | { type: "CLEAR_HISTORY" }
  | { type: "SET_DIRECTORY"; payload: Directory }
  | { type: "UPDATE_DIRECTORY" };

export const createInitialState = (): State => {
  const storedHistory = window.localStorage.getItem("history");
  const history = storedHistory ? JSON.parse(storedHistory) : [];
  const storedDir = window.localStorage.getItem("directory");
  const currentDir = storedDir ? JSON.parse(storedDir) : defaultDirectory;
  setParentDirs(currentDir);
  return { history, currentDir };
};

export const pageReducer: React.Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case "ADD_HISTORY":
      const newHistory = [...state.history, action.payload];
      window.localStorage.setItem("history", JSON.stringify(newHistory));
      return { ...state, history: newHistory };
    case "CLEAR_HISTORY":
      window.localStorage.setItem("history", JSON.stringify([]));
      return { ...state, history: [] };
    case "SET_DIRECTORY":
      const dirWithoutParent = stringifyDirectory(action.payload);
      window.localStorage.setItem("directory", dirWithoutParent);
      return { ...state, currentDir: action.payload };
    case "UPDATE_DIRECTORY":
      const dir = stringifyDirectory(state.currentDir);
      window.localStorage.setItem("directory", dir);
      return state;
    default:
      return state;
  }
};
