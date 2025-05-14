import { useEffect, useState } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";
import { CalenderIcon } from "../../icons";

type PropsType = {
  id: string;
  onChange?: (dates: [string | null, string | null]) => void;
  defaultDates?: [string | null, string | null];
  label?: string;
  placeholder?: string;
};

export default function RangeDatePicker({
  id,
  onChange,
  defaultDates = [null, null],
  label,
  placeholder = "Select date range",
}: PropsType) {
  const [currentSelection, setCurrentSelection] = useState<"start" | "end" | null>(null);

  useEffect(() => {
    const flatPickr = flatpickr(`#${id}`, {
      mode: "range",
      static: true,
      monthSelectorType: "static",
      dateFormat: "Y-m-d",
      defaultDate: defaultDates,
      appendTo: document.body,
      onChange: (selectedDates) => {
        if (onChange) {
          const startDate = selectedDates[0]
            ? new Date(
                selectedDates[0].getTime() -
                  selectedDates[0].getTimezoneOffset() * 60000
              )
                .toISOString()
                .split("T")[0]
            : null;
          const endDate = selectedDates[1]
            ? new Date(
                selectedDates[1].getTime() -
                  selectedDates[1].getTimezoneOffset() * 60000
              )
                .toISOString()
                .split("T")[0]
            : null;
          onChange([startDate, endDate]);
        }
      },
      onOpen: () => {
        setCurrentSelection("start"); // Set ke start saat pertama kali dibuka
      },
      onClose: () => {
        setCurrentSelection(null); // Reset status saat ditutup
      },
      onValueUpdate: (selectedDates) => {
        if (selectedDates.length === 1) {
          setCurrentSelection("end"); // Set ke end setelah start dipilih
        } else {
          setCurrentSelection(null); // Reset jika kedua tanggal sudah dipilih
        }
      },
    });

    return () => {
      if (!Array.isArray(flatPickr)) {
        flatPickr.destroy();
      }
    };
  }, [id, defaultDates, onChange]);

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        <input
          id={id}
          placeholder={
            currentSelection === "start"
              ? "Select start date"
              : currentSelection === "end"
              ? "Select end date"
              : placeholder
          }
          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30  bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700  dark:focus:border-brand-800"
        />

        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <CalenderIcon className="size-6" />
        </span>
      </div>
    </div>
  );
}