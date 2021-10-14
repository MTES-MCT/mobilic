export function useFilter(elements, setElements) {
  function handleFilterChange(event, value) {
    const selectedIds = value.map(c => c.id);
    setElements(
      elements.map(c => ({
        ...c,
        selected: selectedIds.includes(c.id)
      }))
    );
  }

  const selectedElements = elements.filter(e => e.selected);
  return [selectedElements, handleFilterChange];
}
