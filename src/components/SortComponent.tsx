import { useState } from "react";

type SortComponentProps = {
  sortData: (type: "dateCompleted" | "totalPoints", asc: boolean) => void;
  descending: boolean;
};

type OptionValue = "dateCompleted" | "totalPoints";

const SortComponent = ({ sortData, descending }: SortComponentProps) => {
  const [selectedType, setSelectedType] =
    useState<OptionValue>("dateCompleted");

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = event.target.value as OptionValue;
    setSelectedType(selected);
    sortData(selected, true);
  };

  return (
    <div className="flex justify-center">
      <label htmlFor="critera" className="mx-2">
        Sort by:
      </label>
      <select
        name="criteria"
        id="criteria"
        className="font-semibold bg-slate-700 rounded-md text-slate-400"
        onChange={handleSelectChange}
      >
        <option value="dateCompleted" defaultChecked={true}>
          Date
        </option>
        <option value="totalPoints">Points</option>
      </select>
      <button
        className="ml-2 p-1 bg-slate-700 rounded-md"
        onClick={() => sortData(selectedType, descending)}
      >
        {descending ? (
          <svg
            width="15px"
            height="15px"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0 11H3L3 0H5L5 11H8V12L4 16L0 12V11Z" fill="#94a3b8" />
            <path d="M16 0H10V2H16V0Z" fill="#94a3b8" />
            <path d="M10 4H14V6H10V4Z" fill="#94a3b8" />
            <path d="M12 8H10V10H12V8Z" fill="#94a3b8" />
          </svg>
        ) : (
          <svg
            width="15px"
            height="15px"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0 11H3L3 0H5L5 11H8V12L4 16L0 12V11Z" fill="#94a3b8" />
            <path d="M16 10H10V8H16V10Z" fill="#94a3b8" />
            <path d="M10 6H14V4H10V6Z" fill="#94a3b8" />
            <path d="M12 2H10V0H12V2Z" fill="#94a3b8" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default SortComponent;
