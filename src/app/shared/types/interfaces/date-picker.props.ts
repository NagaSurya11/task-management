import React from "react";

export interface DatePickerProps {
    selected: string;
    onChange: (date: Date | null) => void
    open: boolean
    container: React.ReactElement
}