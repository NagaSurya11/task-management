import * as React from "react";
import { Root, Indicator } from "@radix-ui/react-checkbox";
import styles from './check-box.module.css';
import Icon from "../icon/icon";
import { Icons } from "../../types";

interface CheckboxProps {
    id: string;
    checked: boolean;
    onClick: () => void;
}

const Checkbox: React.FC<CheckboxProps> = (props) => (
    <input type="checkbox" className={styles['checkbox']} {...props} />
);

export default Checkbox;
