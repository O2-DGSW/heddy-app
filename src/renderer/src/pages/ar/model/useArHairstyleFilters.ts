import { useState } from "react";

import type { ArHairstyleOption } from "@/entities/ar-groom";

export const useArHairstyleFilters = (hairstyleOptions: ArHairstyleOption[]) => {
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const genderOptions = Array.from(
    new Set(hairstyleOptions.flatMap(option => (option.gender ? [option.gender] : [])))
  );
  const typeOptions = Array.from(
    new Set(hairstyleOptions.flatMap(option => (option.type ? [option.type] : [])))
  );
  const tagOptions = Array.from(new Set(hairstyleOptions.flatMap(option => option.tags ?? [])));
  const filterGroups = [
    {
      label: "성별",
      options: genderOptions,
      selectedValue: selectedGender,
      onSelect: setSelectedGender,
    },
    { label: "유형", options: typeOptions, selectedValue: selectedType, onSelect: setSelectedType },
    { label: "태그", options: tagOptions, selectedValue: selectedTag, onSelect: setSelectedTag },
  ].filter(group => group.options.length > 0);
  const filteredOptions = hairstyleOptions.filter(option => {
    const matchesGender = !selectedGender || option.gender === selectedGender;
    const matchesType = !selectedType || option.type === selectedType;
    const matchesTag = !selectedTag || option.tags?.includes(selectedTag);

    return matchesGender && matchesType && matchesTag;
  });
  const hasActiveFilters = Boolean(selectedGender || selectedType || selectedTag);

  const handleFilterReset = () => {
    setSelectedGender(null);
    setSelectedType(null);
    setSelectedTag(null);
  };

  return { filterGroups, filteredOptions, hasActiveFilters, handleFilterReset };
};
