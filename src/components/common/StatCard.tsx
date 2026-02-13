import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: number | string;
    color: 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'indigo';
}

export default function StatCard({
    icon: Icon,
    label,
    value,
    color,
}: StatCardProps) {
    const colorClasses = {
        blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400',
        green:
            'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400',
        purple:
            'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400',
        red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400',
        yellow:
            'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-600 dark:text-yellow-400',
        indigo:
            'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400',
    };

    return (
        <div
            className={`p-4 rounded-lg border ${colorClasses[color]} flex items-center gap-4`}
        >
            <div className="p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-xs font-medium opacity-80">{label}</div>
            </div>
        </div>
    );
}
