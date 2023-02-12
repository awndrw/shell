import z from "zod";

interface Item {
  name: string;
  parent: Item;
}
type ItemWithoutParent = Omit<Item, "parent">;

interface BaseFile {
  content: string;
}
export type File = Item & BaseFile;
export type FileWithoutParent = ItemWithoutParent & BaseFile;

interface BaseDirectory {}
export type Directory = Item &
  BaseDirectory & {
    subdirectories?: Directory[];
    files?: File[];
  };
export type DirectoryWithoutParent = ItemWithoutParent &
  BaseDirectory & {
    subdirectories?: DirectoryWithoutParent[];
    files?: FileWithoutParent[];
  };

export const ResultSchema = z.string();
export type Result = z.infer<typeof ResultSchema>;

export const CommandSchema = z.object({
  name: z.string(),
  description: z.string(),
  execute: z.function().args(z.array(z.string())).returns(ResultSchema),
});
export type Command = z.infer<typeof CommandSchema>;

export const CommandResultSchema = z.object({
  raw: z.string(),
  result: ResultSchema,
  /* directory path */
  dir: z.string(),
});
export type CommandResult = z.infer<typeof CommandResultSchema>;
