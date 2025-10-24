import { useEffect, useState, useRef } from "react";
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
  const [currentSelection, setCurrentSelection] = useState<
    "start" | "end" | null
  >(null);
  const [displayValue, setDisplayValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  // Format date consistently
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

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

          // Update display value with consistent formatting
          if (selectedDates.length === 2) {
            setDisplayValue(
              `${formatDate(selectedDates[0])} to ${formatDate(
                selectedDates[1]
              )}`
            );
          } else if (selectedDates.length === 1) {
            setDisplayValue(`${formatDate(selectedDates[0])} to ...`);
          } else {
            setDisplayValue("");
          }
        }
      },
      onOpen: () => {
        setCurrentSelection("start");
        // Reset display value when opening picker
        setDisplayValue("");
      },
      onClose: () => {
        setCurrentSelection(null);
      },
      onValueUpdate: (selectedDates) => {
        if (selectedDates.length === 1) {
          setCurrentSelection("end");
          const formattedStart = selectedDates[0].toLocaleDateString("en-US");
          setDisplayValue(`${formattedStart} to ...`);
        } else {
          setCurrentSelection(null);
        }
      },
    });

    // Initialize display value if defaultDates are provided
    if (defaultDates[0] && defaultDates[1]) {
      const startDate = new Date(defaultDates[0]);
      const endDate = new Date(defaultDates[1]);
      setDisplayValue(`${formatDate(startDate)} to ${formatDate(endDate)}`);
    }

    return () => {
      if (!Array.isArray(flatPickr)) {
        flatPickr.destroy();
      }
    };
  }, [id, defaultDates, onChange]);

  // Improved width calculation
  useEffect(() => {
    if (inputRef.current && measureRef.current) {
      // Calculate width for the full possible date range format
      const testDate1 = new Date(2025, 0, 1); // January 1, 2025 (01/01/2025)
      const testDate2 = new Date(2025, 11, 31); // December 31, 2025 (12/31/2025)
      const maxWidthText = `${formatDate(testDate1)} to ${formatDate(
        testDate2
      )}`;

      measureRef.current.textContent = displayValue || maxWidthText;
      const width = measureRef.current.offsetWidth + 48; // Extra padding
      inputRef.current.style.width = `${Math.max(width, 180)}px`; // Minimum width 180px
    }
  }, [displayValue]);

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative inline-flex items-center">
        {/* Hidden measurement element */}
        <span
          ref={measureRef}
          className="absolute invisible whitespace-nowrap text-sm px-4"
          aria-hidden="true"
          style={{ font: "inherit" }} // Ensure same font as input
        />

        {/* Actual input */}
        <input
          id={id}
          ref={inputRef}
          value={displayValue}
          readOnly
          placeholder={
            currentSelection === "start"
              ? "Select start date"
              : currentSelection === "end"
              ? "Select end date"
              : placeholder
          }
          className="h-11 rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800 transition-all duration-100"
          style={{ minWidth: "180px" }}
        />

        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <CalenderIcon className="size-6" />
        </span>
      </div>
    </div>
  );
}
