import type { Directory, DirectoryWithoutParent, File } from "util/type";

export const directoryStructure: Directory = (() => {
  const root: DirectoryWithoutParent = {
    name: "~",
    subdirectories: [{ name: "Desktop" }, { name: "Documents" }],
    files: [{ name: "README.md", content: `` }],
  };
  setParentDirs(root);
  return root as Directory;
})();

export function setParentDirs(dir: DirectoryWithoutParent) {
  if (!dir.subdirectories) return;
  for (const subDir of dir.subdirectories) {
    (subDir as any).parent = dir;
    setParentDirs(subDir);
  }
}

export const defaultDirectory: DirectoryWithoutParent = {
  name: "~",
  subdirectories: [{ name: "Desktop" }, { name: "Documents" }],
  files: [{ name: "README.md", content: `` }],
};

export const stringifyDirectory = (dir: Directory): string => {
  const res = JSON.stringify(dir, (key, value) => {
    if (key === "parent") return value.name;
    return value;
  });
  console.log(res);
  return res;
};

export const getPath = (dir: Directory): string => {
  if (dir.name === "~") return "~";
  return `${getPath(dir.parent)}/${dir.name}`;
};

export const makeDirectory = (dir: Directory, path: string): Directory => {
  const [name, ...rest] = path.split("/");
  const newDir: Directory = { name, parent: dir };

  if (rest.length) {
    newDir.subdirectories = [];
    return makeDirectory(newDir, rest.join("/"));
  }

  dir.subdirectories = dir.subdirectories ?? [];
  dir.subdirectories.push(newDir);
  return dir.subdirectories[dir.subdirectories.length - 1];
};

export const makeFile = (dir: Directory, path: string): File => {
  const [name, ...rest] = path.split("/");

  if (rest.length) {
    dir = makeDirectory(dir, name);
    return makeFile(dir, rest.join("/"));
  }

  const file: File = { name, content: "", parent: dir };

  dir.files = dir.files ?? [];
  dir.files.push(file);
  return dir.files[dir.files.length - 1];
};
