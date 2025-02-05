import { MenuButtonModifiers, RenderProp } from "@szhsin/react-menu";
import React from "react";
import { Icons } from "../enums/icons.enum";


export type MenuOptions<T> = {
    label: string;
    value: T;
    warn?: boolean;
    icon?: Icons;
}[];

export interface MenuProps<T> {
    options: MenuOptions<T>;
    onClick: (value: T) => void;
    id: string;
    children: React.ReactNode;
    align: "center" | "end" | "start";
}
