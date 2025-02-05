import { Icons } from "../enums/icons.enum";

export interface ButtonProps {
    text: string;
    icon?: Icons;
    type: 'primary' | 'filled' | 'outlined';
    onClick?: () => void;
    xs?: boolean;
    disabled?: boolean;
    toolTip?: string;
    noTopPadding?: boolean;
}