import React, { useState, useMemo } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday,
    parseISO
} from 'date-fns';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import { motion, AnimatePresence } from 'framer-motion';
import { getCategoryIcon } from '../utils/iconMap';

/* ─── Helper: Render Category Icon ─── */
const RenderCatIcon = ({ category, size = 16 }) => {
    const Icon = getCategoryIcon(category || 'Other');
    return <Icon size={size} />;
};

const safeParse = (d) => {
    if (!d) return new Date();
    try { return typeof d === 'string' ? parseISO(d) : new Date(d); } catch { return new Date(d); }
};

const CalendarView = ({ transactions, onEdit }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    // 1. Calculate Daily Stats (Income/Expense/Count)
    const dailyStats = useMemo(() => {
        const stats = {};
        transactions.forEach(t => {
            const d = safeParse(t.date);
            const dateKey = format(d, 'yyyy-MM-dd');
            if (!stats[dateKey]) {
                stats[dateKey] = { income: 0, expense: 0, count: 0, transactions: [] };
            }
            if (t.type === 'income') {
                stats[dateKey].income += Math.abs(Number(t.amount));
            } else if (t.type === 'expense') {
                stats[dateKey].expense += Math.abs(Number(t.amount));
            }
            stats[dateKey].count += 1;
            stats[dateKey].transactions.push(t);
        });
        return stats;
    }, [transactions]);

    // 2. Generate Calendar Days
    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        return eachDayOfInterval({ start: startDate, end: endDate });
    }, [currentMonth]);

    // 3. Transactions for Selected Date
    const selectedTransactions = useMemo(() => {
        const dateKey = format(selectedDate, 'yyyy-MM-dd');
        return dailyStats[dateKey]?.transactions || [];
    }, [selectedDate, dailyStats]);

    // Navigation Handlers
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const goToToday = () => {
        const today = new Date();
        setCurrentMonth(today);
        setSelectedDate(today);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* ─── Calendar Header ─── */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-black uppercase tracking-tight text-light-text dark:text-dark-text">
                    {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={prevMonth}
                        className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                        <BsChevronLeft size={18} />
                    </button>
                    <button
                        onClick={goToToday}
                        className="hidden sm:block text-xs font-bold uppercase px-3 py-1.5 rounded-lg border-2 border-current hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                        Today
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                        <BsChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* ─── Calendar Grid ─── */}
            <div className="neo-card p-4 overflow-hidden">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 mb-2 text-center">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-[10px] sm:text-xs font-bold uppercase text-gray-400 py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {calendarDays.map(day => {
                        const dateKey = format(day, 'yyyy-MM-dd');
                        const dayStats = dailyStats[dateKey];
                        const isSelected = isSameDay(day, selectedDate);
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isTodayDate = isToday(day);

                        const income = dayStats?.income || 0;
                        const expense = dayStats?.expense || 0;

                        return (
                            <motion.div
                                key={day.toString()}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedDate(day)}
                                className={`
                                    relative min-h-[80px] sm:min-h-[100px] p-2 rounded-xl flex flex-col items-center justify-between cursor-pointer transition-all border-2
                                    ${isSelected
                                        ? 'border-white bg-white/5 z-10 shadow-lg shadow-black/50'
                                        : isTodayDate
                                            ? 'border-brand-primary bg-brand-primary/5'
                                            : 'border-white/5 bg-[#111] hover:bg-[#1A1A1A] hover:border-white/10'
                                    }
                                    ${!isCurrentMonth ? 'opacity-20 grayscale' : ''}
                                `}
                            >
                                <span className={`
                                    text-xs sm:text-sm font-bold
                                    ${isTodayDate ? 'text-brand-primary' : 'text-gray-400'}
                                    ${isSelected ? 'text-white' : ''}
                                `}>
                                    {format(day, 'd')}
                                </span>

                                {/* Transaction Pills */}
                                <div className="w-full flex flex-col gap-1 mt-1">
                                    {income > 0 && (
                                        <div className="w-full flex items-center justify-center py-0.5 rounded-[4px] bg-green-500/10 border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                                            <span className="text-[9px] sm:text-[10px] font-black tracking-tight text-green-400">
                                                +{Math.round(income).toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                    {expense > 0 && (
                                        <div className="w-full flex items-center justify-center py-0.5 rounded-[4px] bg-red-500/10 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                                            <span className="text-[9px] sm:text-[10px] font-black tracking-tight text-red-400">
                                                -{Math.round(expense).toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* ─── Selected Date Transactions ─── */}
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-black uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary shrink-0">
                        {format(selectedDate, 'EEEE, MMMM do, yyyy')}
                    </span>
                    <div className="flex-1 h-[2px] bg-gray-200 dark:bg-gray-800 rounded-full" />
                </div>

                <div className="neo-card divide-y divide-gray-100 dark:divide-gray-800">
                    {selectedTransactions.length > 0 ? (
                        selectedTransactions.map(t => (
                            <motion.div
                                key={t._id || t.id}
                                layout
                                onClick={() => onEdit(t)}
                                className="flex items-center justify-between p-3 sm:p-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group cursor-pointer"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 flex-shrink-0 bg-light-bg dark:bg-dark-bg border-2 border-brand-black dark:border-gray-600 rounded-xl flex items-center justify-center">
                                        <RenderCatIcon category={t.category} size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-sm truncate">{t.text}</p>
                                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-light-bg dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded text-light-text-secondary dark:text-dark-text-secondary">
                                            {t.category}
                                        </span>
                                    </div>
                                </div>
                                <span className={`font-black text-sm ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                                    {t.type === 'income' ? '+' : '-'}₹{Math.abs(t.amount).toLocaleString()}
                                </span>
                            </motion.div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-400 text-sm font-semibold">
                            No transactions on this day
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CalendarView;
