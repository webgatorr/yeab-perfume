// Reusable Tailwind class strings
export const styles = {
    // Glass morphism effect
    glass: 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border border-white/20 dark:border-slate-700/50',

    // Card
    card: 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]',

    // Buttons
    btn: 'px-6 py-3 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-50',
    btnPrimary: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 focus:ring-purple-500 shadow-lg hover:shadow-xl',
    btnSecondary: 'bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 focus:ring-slate-500',
    btnSuccess: 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 focus:ring-emerald-500',
    btnDanger: 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 focus:ring-red-500',

    // Input
    input: 'w-full px-4 py-3 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-2 border-slate-200 dark:border-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 placeholder:text-slate-400',

    // Label
    label: 'block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2',

    // Badges
    badge: 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
    badgePending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    badgeCompleted: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    badgeCancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};
