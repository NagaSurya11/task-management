import { UniqueIdentifier } from "@dnd-kit/core";
import { Task } from "./task.interface";

export type Items = Record<UniqueIdentifier, Task[]>;
