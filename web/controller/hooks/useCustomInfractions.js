import React from "react";
import { isoFormatLocalDate } from "common/utils/time";

/**
 * Hook to manage custom NATINF infractions state
 * Handles selection, day assignment, and confirmation flow
 */
export const useCustomInfractions = () => {
  // Selected custom infractions with their assigned days
  const [customInfractions, setCustomInfractions] = React.useState([]);
  
  /**
   * Add or update a custom infraction
   * @param {Object} natinf - { code, label, description }
   * @param {Number} dayTimestamp - Unix timestamp of selected day
   */
  const addDayToCustomInfraction = (natinf, dayTimestamp) => {
    setCustomInfractions(prev => {
      const existing = prev.find(item => item.code === natinf.code);
      
      if (existing) {
        // Add day if not already present
        if (!existing.days.includes(dayTimestamp)) {
          return prev.map(item =>
            item.code === natinf.code
              ? { ...item, days: [...item.days, dayTimestamp] }
              : item
          );
        }
        return prev;
      } else {
        // New infraction
        return [
          ...prev,
          {
            code: natinf.code,
            label: natinf.label,
            description: natinf.description,
            days: [dayTimestamp]
          }
        ];
      }
    });
  };

  /**
   * Remove a day from a custom infraction
   * If no days left, remove the infraction entirely
   */
  const removeDayFromCustomInfraction = (code, dayTimestamp) => {
    setCustomInfractions(prev => {
      return prev
        .map(item => {
          if (item.code === code) {
            const updatedDays = item.days.filter(d => d !== dayTimestamp);
            return { ...item, days: updatedDays };
          }
          return item;
        })
        .filter(item => item.days.length > 0);
    });
  };

  /**
   * Remove a custom infraction entirely
   */
  const removeCustomInfraction = (code) => {
    setCustomInfractions(prev => prev.filter(item => item.code !== code));
  };

  /**
   * Clear all custom infractions
   */
  const clearCustomInfractions = () => {
    setCustomInfractions([]);
  };

  /**
   * Get total number of selected infractions (for footer display)
   */
  const selectedInfractionsCount = React.useMemo(() => {
    return customInfractions.filter(item => item.days.length > 0).length;
  }, [customInfractions]);

  /**
   * Get custom infractions formatted for API
   */
  const getCustomInfractionsForAPI = () => {
    return customInfractions.flatMap(infraction =>
      infraction.days.map(day => ({
        sanction: `NATINF ${infraction.code}`,
        dateStr: isoFormatLocalDate(day),
        type: "custom",
        customLabel: infraction.label,
        customDescription: infraction.description
      }))
    );
  };

  return {
    customInfractions,
    addDayToCustomInfraction,
    removeDayFromCustomInfraction,
    removeCustomInfraction,
    clearCustomInfractions,
    selectedInfractionsCount,
    getCustomInfractionsForAPI
  };
};
