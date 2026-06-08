import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { buildYearCalendar, filterActivityByYear } from '../utils/activityCalendar';
import './ActivityHeatmap.css';

const DAY_ROW_LABELS = [
  null,
  'profile.dayMon',
  null,
  'profile.dayWed',
  null,
  'profile.dayFri',
  null,
];

export default function ActivityHeatmap({ dates = [], counts = {}, years = [], loading = false }) {
  const { t, locale } = useLanguage();
  const currentYear = new Date().getFullYear();
  const availableYears = years.length ? years : [currentYear];
  const [selectedYear, setSelectedYear] = useState(null);

  const effectiveYear = selectedYear && availableYears.includes(selectedYear)
    ? selectedYear
    : availableYears[0];

  useEffect(() => {
    if (selectedYear && !availableYears.includes(selectedYear)) {
      setSelectedYear(null);
    }
  }, [availableYears, selectedYear]);

  const monthLabel = (monthIndex) => t('profileMonthsShort.' + monthIndex);

  const { yearDates, yearCounts } = useMemo(
    () => filterActivityByYear(dates, counts, effectiveYear),
    [dates, counts, effectiveYear],
  );

  const calendar = useMemo(
    () => buildYearCalendar(yearDates, yearCounts, effectiveYear, monthLabel),
    [yearDates, yearCounts, effectiveYear, locale],
  );

  const formatTooltip = (cell) => {
    if (!cell.date) return '';
    const [y, m, d] = cell.date.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dateStr = dateObj.toLocaleDateString(locale === 'en' ? 'en-US' : 'ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    if (!cell.active) {
      return `${dateStr} — ${t('profile.noActivity')}`;
    }
    const n = cell.count;
    if (n > 1) {
      return `${dateStr} — ${t('profile.startedCourses', { count: n })}`;
    }
    return `${dateStr} — ${t('profile.startedThisDay')}`;
  };

  if (loading) {
    return (
      <div className="activity-heatmap activity-heatmap--loading">
        {t('profile.loadingActivity')}
      </div>
    );
  }

  return (
    <div className="activity-heatmap">
      <p className="activity-heatmap-summary">
        {t('profile.contributionsSummary', {
          count: calendar.contributionTotal,
          year: effectiveYear,
        })}
      </p>

      <div className="activity-heatmap-body">
        <div className="activity-heatmap-main">
          <div
            className="activity-heatmap-months"
            style={{ gridTemplateColumns: `repeat(${calendar.totalWeeks}, 14px)` }}
          >
            {calendar.weekMonthLabels.map((label, idx) => (
              <span key={idx} className="activity-heatmap-month">{label}</span>
            ))}
          </div>

          <div className="activity-heatmap-grid-row">
            <div className="activity-heatmap-day-labels" aria-hidden>
              {DAY_ROW_LABELS.map((key, idx) => (
                <span key={idx} className="activity-heatmap-day-label">
                  {key ? t(key) : ''}
                </span>
              ))}
            </div>

            <div
              className="activity-heatmap-grid"
              style={{ gridTemplateColumns: `repeat(${calendar.totalWeeks}, 14px)` }}
              role="img"
              aria-label={t('profile.activityGridLabel')}
            >
              {calendar.cells.map((cell, i) => (
                <span
                  key={i}
                  className={[
                    'activity-heatmap-cell',
                    cell.empty ? 'empty' : '',
                    cell.future ? 'future' : '',
                    cell.active ? 'active' : '',
                    cell.count > 1 ? 'active-more' : '',
                  ].filter(Boolean).join(' ')}
                  title={cell.empty && !cell.future ? '' : formatTooltip(cell)}
                />
              ))}
            </div>
          </div>

          <div className="activity-heatmap-legend">
            <span>{t('profile.activityLess')}</span>
            <span className="activity-heatmap-legend-cell" />
            <span className="activity-heatmap-legend-cell active" />
            <span>{t('profile.activityMore')}</span>
          </div>
        </div>

        <nav className="activity-heatmap-years" aria-label={t('profile.yearNav')}>
          {availableYears.map((y) => (
            <button
              key={y}
              type="button"
              className={`activity-heatmap-year-btn${y === effectiveYear ? ' active' : ''}`}
              onClick={() => setSelectedYear(y)}
            >
              {y}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
