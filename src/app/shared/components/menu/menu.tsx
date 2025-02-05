import styles from './menu.module.css';
import { MenuProps } from '../../types';
import { Portal, Root, Trigger, Content, Item } from '@radix-ui/react-dropdown-menu';
import Icon from '../icon/icon';




export function Menu<T>(props: MenuProps<T>) {

  return (
    <Root >
      <Trigger asChild children={props.children} />
      <Portal>
        <Content side='bottom' align='end' sideOffset={5} alignOffset={5} className={styles['menu']}>
          {props.options.map((option) => (
            <Item className={`${styles['menu_item']} ${option.warn ? styles['warn']: ''}`} key={option.label} id={option.label} onSelect={() => props.onClick(option.value)}>
              {option.icon && <Icon icon={option.icon} height={16} width={16} />}
              {option.label}
            </Item>
          ))}
        </Content>
      </Portal>
    </Root>
  );
}

export default Menu;
