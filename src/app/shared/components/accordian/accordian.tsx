import * as React from "react";
import { Root, Item, Trigger, Header, Content } from "@radix-ui/react-accordion";
import styles from "./accordian.module.css";
import Icon from "../icon/icon";
import { Icons } from "../../types";

interface AccordianProps {
    trigger: React.ReactNode;
    children: React.ReactNode;
    ref: React.Ref<HTMLDivElement>;
    id: string
}

const Accordion: React.FC<AccordianProps> = ({ children, trigger, ref, id }) => (
    <Root
        className={styles['accordian_root']}
        type="single"
        collapsible
        defaultValue={id}
    >
        <Item className={styles["accordian_root__item"]} value={id}>
            <Header className={styles["accordian_root__item__header"]}>
                <Trigger
                    className={`${styles["accordian_root__item__header__trigger"]} ${styles[id]}`}
                >
                    {trigger}
                    <Icon className={styles["accordian_root__item__header__trigger__chevon"]} icon={Icons.CHEVRON_DOWN_OUTLINE} height={36} width={36} />
                </Trigger>
            </Header>
            <Content
                className={styles["accordian_root__item__content"]}
            >
                <div ref={ref} className={styles["accordian_root__item__content__children"]}>
                    {children}
                </div>
            </Content>
        </Item>
    </Root>
);

export default Accordion;

