import { ButtonProps } from '../../types';
import Icon from '../icon/icon';
import Tooltip from '../tool-tip/tool-tip';
import styles from './button.module.css';

export function Button(props: ButtonProps) {
  return (
    <Tooltip toolTip={props.toolTip}>
      <button className={`${styles[`button`]} ${styles[props.type]} ${props.xs ? styles['xs'] : ''} ${styles[props.noTopPadding ? 'no_top_padding' : '']}`} onClick={props.onClick}
        disabled={props.disabled}
      >
        {props.icon && <Icon icon={props.icon} width={15} height={15}></Icon>}
        {props.text}
      </button>
    </Tooltip>
  );
}

export default Button;
