import React, { MouseEventHandler } from "react";
import { Icons } from "../enums/icons.enum";

export interface IconProps {
    icon: Icons;
    width: number;
    height: number;
    className?: string;
    onClick?: MouseEventHandler;
}
