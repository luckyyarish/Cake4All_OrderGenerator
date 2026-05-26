import { useState, useEffect } from "react";
import { CustomSelect } from "./CustomSelect";

export const WeightSelect = ({ value, onChange, options = [] }) => {
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState("");

  useEffect(() => {
    if (value === "custom_pending") {
      setIsCustom(true);
      setCustomValue("");
    } else if (value) {
      const match = options.find((opt) => opt.value === value);
      if (!match) {
        setIsCustom(true);
        setCustomValue(value.replace(/[^0-9.]/g, ""));
      } else {
        setIsCustom(false);
        setCustomValue("");
      }
    } else {
      // If value is completely empty (like during a form reset), close the box
      setIsCustom(false);
      setCustomValue("");
    }
  }, [value, options]);

  const handleDropdownChange = (selectedValue) => {
    if (selectedValue === "custom") {
      setIsCustom(true);
      onChange("custom_pending"); // Stops the component from instantly closing
    } else {
      setIsCustom(false);
      onChange(selectedValue);
    }
  };

  const handleCustomNumberChange = (e) => {
    const num = e.target.value;
    // Allow digits and a single decimal point only
    if (/^\d*\.?\d*$/.test(num)) {
      setCustomValue(num);
      onChange(num ? num : "custom_pending");
    }
  };

  const dropdownOptions = [
    ...options,
    { value: "custom", label: "Custom Weight..." },
  ];

  const currentDropdownValue = isCustom ? "custom" : value;

  return (
    <div className="flex gap-3 w-full items-end">
      <div className="flex-1">
        <CustomSelect
          value={currentDropdownValue}
          onChange={handleDropdownChange}
          placeholder="Select weight"
          options={dropdownOptions}
        />
      </div>

      {isCustom && (
        <div className="w-32 animate-fade-in">
          <input
            type="text"
            inputMode="decimal"
            placeholder="e.g. 5"
            value={customValue}
            onChange={handleCustomNumberChange}
            className="input-field h-[42px] text-center"
          />
        </div>
      )}
    </div>
  );
};
