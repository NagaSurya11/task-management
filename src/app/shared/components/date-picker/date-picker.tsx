import { useRef } from 'react';
import styles from './date-picker.module.css';
import DatePicker from 'react-datepicker';
import { DatePickerProps } from '../../types/interfaces/date-picker.props';
import "react-datepicker/dist/react-datepicker.css";

export function CustomDatePicker(props: DatePickerProps) {
  return (
    <DatePicker
      selected={new Date(props.selected)}
      onChange={(date) => props.onChange(date)}
      customInput={props.container}
      startOpen={props.open}
      calendarClassName= {styles['custom-calender']}
      calendarIconClassName='custom-calender-icon'
    />
  );
}

export default CustomDatePicker;
