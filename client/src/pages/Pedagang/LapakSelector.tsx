import React, { useState, useMemo, useCallback } from "react";
import { Input } from "../../components/ui/input";
import Button from "../../components/ui/button/Button";
import { ScrollArea } from "../../components/ui/scroll-area";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface LapakOption {
  LAPAK_CODE: string;
  LAPAK_NAMA: string;
}

interface LapakSelectorProps {
  available: LapakOption[];
  selected: LapakOption[];
  onSelectionChange: (newSelected: LapakOption[]) => void;
  onAvailableChange: (newAvailable: LapakOption[]) => void;
}

const ListItem = React.memo(({
  item,
  onClick,
  isSelected,
}: {
  item: LapakOption;
  onClick: () => void;
  isSelected: boolean;
}) => (
  <li
    onClick={onClick}
    className={`p-2 text-sm rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white ${
      isSelected ? "bg-blue-100 dark:bg-blue-900" : ""
    }`}
  >
    {item.LAPAK_NAMA}{" "}
    <span className="text-gray-500 text-xs">({item.LAPAK_CODE})</span>
  </li>
));

interface ListBoxProps {
  title: string;
  items: LapakOption[];
  filter: string;
  setFilter: (value: string) => void;
  toggled: Set<string>;
  onToggle: (code: string) => void;
}

const ListBox = React.memo(({
  title,
  items,
  filter,
  setFilter,
  toggled,
  onToggle,
}: ListBoxProps) => (
  <div className="flex flex-col w-full border rounded-lg p-2 dark:border-gray-600 dark:bg-gray-900">
    <h3 className="font-semibold mb-2 px-2 dark:text-gray-200">{title}</h3>
    <Input
      type="text"
      placeholder="Cari lapak..."
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
      className="mb-2 dark:text-white"
    />
    <ScrollArea className="h-64">
      <ul className="space-y-1 pr-4">
        {items.map((item) => (
          <ListItem
            key={item.LAPAK_CODE}
            item={item}
            onClick={() => onToggle(item.LAPAK_CODE)}
            isSelected={toggled.has(item.LAPAK_CODE)}
          />
        ))}
      </ul>
    </ScrollArea>
  </div>
));

export default function LapakSelector({
  available,
  selected,
  onSelectionChange,
  onAvailableChange,
}: LapakSelectorProps) {
  const [filterAvailable, setFilterAvailable] = useState("");
  const [filterSelected, setFilterSelected] = useState("");
  const [toggledAvailable, setToggledAvailable] = useState<Set<string>>(
    new Set()
  );
  const [toggledSelected, setToggledSelected] = useState<Set<string>>(
    new Set()
  );

  const filteredAvailable = useMemo(
    () =>
      available.filter(
        (l) =>
          l.LAPAK_NAMA.toLowerCase().includes(filterAvailable.toLowerCase()) ||
          l.LAPAK_CODE.toLowerCase().includes(filterAvailable.toLowerCase())
      ),
    [available, filterAvailable]
  );

  const filteredSelected = useMemo(
    () =>
      selected.filter(
        (l) =>
          l.LAPAK_NAMA.toLowerCase().includes(filterSelected.toLowerCase()) ||
          l.LAPAK_CODE.toLowerCase().includes(filterSelected.toLowerCase())
      ),
    [selected, filterSelected]
  );

  const toggleItem = useCallback(
    (code: string, listType: "available" | "selected") => {
      const stateSetter =
        listType === "available" ? setToggledAvailable : setToggledSelected;
      stateSetter((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(code)) {
          newSet.delete(code);
        } else {
          newSet.add(code);
        }
        return newSet;
      });
    },
    []
  );

  const moveItems = useCallback(
    (direction: "toSelected" | "toAvailable") => {
      if (direction === "toSelected") {
        const toMove = available.filter((l) =>
          toggledAvailable.has(l.LAPAK_CODE)
        );
        onAvailableChange(
          available.filter((l) => !toggledAvailable.has(l.LAPAK_CODE))
        );
        onSelectionChange([...selected, ...toMove]);
        setToggledAvailable(new Set());
      } else {
        const toMove = selected.filter((l) => toggledSelected.has(l.LAPAK_CODE));
        onSelectionChange(
          selected.filter((l) => !toggledSelected.has(l.LAPAK_CODE))
        );
        onAvailableChange([...available, ...toMove]);
        setToggledSelected(new Set());
      }
    },
    [available, selected, toggledAvailable, toggledSelected, onAvailableChange, onSelectionChange]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
      <ListBox
        title={`Lapak Tersedia (${filteredAvailable.length})`}
        items={filteredAvailable}
        filter={filterAvailable}
        setFilter={setFilterAvailable}
        toggled={toggledAvailable}
        onToggle={(code) => toggleItem(code, "available")}
      />
      <div className="flex flex-row md:flex-col gap-2 justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => moveItems("toSelected")}
          disabled={toggledAvailable.size === 0}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => moveItems("toAvailable")}
          disabled={toggledSelected.size === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      <ListBox
        title={`Lapak Terpilih (${filteredSelected.length})`}
        items={filteredSelected}
        filter={filterSelected}
        setFilter={setFilterSelected}
        toggled={toggledSelected}
        onToggle={(code) => toggleItem(code, "selected")}
      />
    </div>
  );
}