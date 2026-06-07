import type { ReactNode } from "react";

type DashboardCardProps = {
  title: string;
  value: string;
  icon: ReactNode;
  color: string;
  count?: number;
};

export default function DashboardCard({
  title,
  value,
  icon,
  color,
  count = 0,
}: DashboardCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:scale-[1.02] transition">
      <div className="flex items-center justify-between mb-5">
        <p className="text-slate-500">{title}</p>

        <div className={`${color} p-3 rounded-xl text-white`}>
          {icon}
        </div>
      </div>

      <h2 className="text-4xl font-bold">{value}</h2>

      <p className="text-sm text-green-500 mt-3">
        {count} saved {count === 1 ? "record" : "records"}
      </p>
    </div>
  );
}