"use client";

import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import {
  Button,
  Calendar,
  cn,
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@repo/ui";
import { toISODate } from "@/lib/format";

type DateInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function DateInput({ label, onChange, value }: DateInputProps) {
  const [open, setOpen] = useState(false);
  const date = value ? parseISO(value) : undefined;

  return (
    <div className="flex min-w-36 flex-col gap-1.5">
      <span className="text-xs font-medium text-secondary">{label}</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
            {date ? format(date, "MMM d, yyyy") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <Calendar
            mode="single"
            selected={date}
            defaultMonth={date}
            onSelect={(day) => {
              if (day) {
                onChange(toISODate(day));
              }
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
