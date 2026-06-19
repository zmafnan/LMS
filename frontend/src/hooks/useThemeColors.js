import { useMantineColorScheme } from '@mantine/core'

/**
 * Returns theme-aware color tokens for use in inline styles and Recharts components.
 * CSS custom properties (var(--lms-*)) work for HTML/CSS, but Recharts requires
 * literal color strings in its props, so this hook bridges that gap.
 */
export function useThemeColors() {
  const { colorScheme } = useMantineColorScheme()
  const isDark = colorScheme === 'dark'

  return {
    // Table header backgrounds
    theadBg: isDark ? '#0d121c' : '#f1f5f9',

    // Borders & dividers
    border: isDark ? '#1d2433' : '#e2e8f0',

    // Recharts - CartesianGrid stroke
    chartGrid: isDark ? '#1d2433' : '#e2e8f0',

    // Recharts - XAxis/YAxis stroke
    chartAxis: isDark ? '#64748b' : '#64748b',

    // Recharts - Tooltip
    tooltipBg: isDark ? '#101622' : '#ffffff',
    tooltipBorder: isDark ? '#1d2433' : '#e2e8f0',
    tooltipColor: isDark ? '#f8fafc' : '#0f172a',

    // Recharts - LabelList fill & tick fill
    chartLabel: isDark ? '#94a3b8' : '#475569',

    // Secondary text (dimmed style for inline spans)
    textSecondary: isDark ? '#94a3b8' : '#475569',

    // Surface colors for file cards, attachment items
    surfaceDim: isDark ? '#090d16' : '#f8fafc',
    surfaceBorder: isDark ? '#1d2433' : '#e2e8f0',
  }
}
