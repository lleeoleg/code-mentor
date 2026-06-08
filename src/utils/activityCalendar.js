/** Локальная дата YYYY-MM-DD (без сдвига UTC). */
export function formatLocalDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Даты и счётчики только за выбранный год. */
export function filterActivityByYear(dates, counts, year) {
  const prefix = `${year}-`;
  const yearDates = dates.filter((d) => d.startsWith(prefix));
  const yearCounts = {};
  yearDates.forEach((d) => {
    yearCounts[d] = counts[d] || 1;
  });
  const total = yearDates.reduce((sum, d) => sum + (yearCounts[d] || 0), 0);
  return { yearDates, yearCounts, total };
}

/**
 * Календарь за календарный год (как на GitHub при выборе года).
 * 7 строк (вс–сб), колонки — недели, месяцы сверху.
 */
export function buildYearCalendar(activeDates, counts, year, monthLabel) {
  const activeSet = new Set(activeDates);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yearStart = new Date(year, 0, 1);
  let yearEnd = new Date(year, 11, 31);
  if (year === today.getFullYear()) {
    yearEnd = new Date(today);
  }

  const gridStart = new Date(yearStart);
  while (gridStart.getDay() !== 0) {
    gridStart.setDate(gridStart.getDate() - 1);
  }

  const gridEnd = new Date(yearEnd);
  while (gridEnd.getDay() !== 6) {
    gridEnd.setDate(gridEnd.getDate() + 1);
  }

  const msPerWeek = 7 * 86400000;
  const totalWeeks = Math.floor((gridEnd - gridStart) / msPerWeek) + 1;

  const cells = [];
  const weekMonthLabels = Array.from({ length: totalWeeks }, () => '');

  for (let week = 0; week < totalWeeks; week++) {
    for (let dow = 0; dow < 7; dow++) {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + week * 7 + dow);

      if (d.getFullYear() === year && d.getDate() === 1) {
        weekMonthLabels[week] = monthLabel(d.getMonth());
      }

      const beforeYear = d < yearStart;
      const afterVisible = d > yearEnd;
      const isFuture = d > today;

      if (beforeYear || afterVisible) {
        cells.push({ empty: true, future: false, date: null, count: 0, active: false });
      } else if (isFuture) {
        cells.push({ empty: true, future: true, date: null, count: 0, active: false });
      } else {
        const key = formatLocalDate(d);
        const count = counts[key] || 0;
        cells.push({
          empty: false,
          future: false,
          date: key,
          count,
          active: activeSet.has(key),
        });
      }
    }
  }

  const contributionDays = activeDates.filter((d) => d.startsWith(`${year}-`)).length;
  const contributionTotal = activeDates
    .filter((d) => d.startsWith(`${year}-`))
    .reduce((sum, d) => sum + (counts[d] || 1), 0);

  return {
    cells,
    weekMonthLabels,
    totalWeeks,
    contributionDays,
    contributionTotal,
  };
}
