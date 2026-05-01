import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface FormDateTimePickerProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

export function FormDateTimePicker<T extends FieldValues>({
  name,
  control,
  label,
  placeholder = "Seleccionar fecha y hora",
  disabled = false,
}: FormDateTimePickerProps<T>) {
  const currentYear = new Date().getFullYear();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Extraemos la fecha y hora actuales del field.value
        const dateValue = field.value ? new Date(field.value) : undefined;
        const timeValue = dateValue ? format(dateValue, "HH:mm") : "";

        const handleDateSelect = (selectedDate: Date | undefined) => {
          if (!selectedDate) {
            field.onChange("");
            return;
          }
          // Si ya había una hora seleccionada, la mantenemos. Si no, ponemos las 12:00 por defecto
          if (dateValue) {
            selectedDate.setHours(dateValue.getHours(), dateValue.getMinutes());
          } else {
            selectedDate.setHours(12, 0);
          }
          field.onChange(selectedDate.toISOString());
        };

        const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const time = e.target.value; // Formato "HH:mm"
          if (!dateValue || !time) return;

          const [hours, minutes] = time.split(":").map(Number);
          const newDate = new Date(dateValue);
          newDate.setHours(hours, minutes);
          field.onChange(newDate.toISOString());
        };

        return (
          <FormItem className="flex flex-col">
            <FormLabel>{label}</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground",
                      disabled && "opacity-50 cursor-not-allowed",
                    )}
                    disabled={disabled}
                  >
                    {field.value ? (
                      format(dateValue!, "PPP - HH:mm", { locale: es })
                    ) : (
                      <span>{placeholder}</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateValue}
                  onSelect={handleDateSelect}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today;
                  }}
                  initialFocus
                  locale={es}
                  captionLayout="dropdown"
                  fromYear={currentYear} // Desde este año
                  toYear={currentYear + 5} // Hasta 5 años en el futuro
                />

               <div className="p-3 border-t border-border flex items-center gap-3 bg-muted/30">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="time"
                    value={timeValue}
                    onChange={handleTimeChange}
                    disabled={!dateValue} 
                    className="w-full" /* 👈 Ya no necesitas la clase dark:[color-scheme...] */
                  />
                </div>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
