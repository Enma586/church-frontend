import { format, setHours, setMinutes } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function FormDateTimePicker({ name, control, label }: any) {
  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0"),
  );
  const minutes = ["00", "15", "30", "45"];
  const currentYear = new Date().getFullYear();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const date = field.value ? new Date(field.value) : new Date();
        const updateDate = (newDate: Date) =>
          field.onChange(newDate.toISOString());

        return (
          <FormItem className="flex flex-col">
            <FormLabel>{label}</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !field.value && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value
                      ? format(date, "PPP - HH:mm", { locale: es })
                      : "Seleccionar fecha y hora..."}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              {/* Se agrega la clase 'dark' condicionalmente para forzar el tema oscuro si es necesario */}
              <PopoverContent className="w-auto p-3 dark:bg-card">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && updateDate(d)}
                  locale={es}
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                  captionLayout="dropdown"
                  fromYear={currentYear}
                  toYear={currentYear + 5}
                />
                <div className="mt-3 pt-3 border-t">
                  <div className="flex gap-4 mb-1 px-1">
                    <span className="text-xs font-semibold text-muted-foreground w-1/2">
                      Hora
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground w-1/2">
                      Minutos
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={format(date, "HH")}
                      onValueChange={(h) =>
                        updateDate(setHours(date, parseInt(h)))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="HH" />
                      </SelectTrigger>
                      <SelectContent className="max-h-50">
                        {hours.map((h) => (
                          <SelectItem key={h} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={format(date, "mm")}
                      onValueChange={(m) =>
                        updateDate(setMinutes(date, parseInt(m)))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent>
                        {minutes.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
