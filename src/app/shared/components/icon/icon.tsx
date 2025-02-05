import { IconProps } from '../../types';

export function Icon(props: IconProps) {
  return <img onClick={props.onClick} className={props.className ?? props.icon} src={`assets/icons/${props.icon}.svg`} alt={"icon"} height={props.height} width={props.width}/>;
}

export default Icon;
