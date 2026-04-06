import { Analytics } from "@/entities/user";

export const ActivityGraph = ({ data }: { data: Analytics['activity_graph'] }) => {
        if (!data) return <p className="text-neutral-500">Нет данных для графика</p>;
        const maxCount = Math.max(...data.map(d => d.count), 1);
        const height = 100;
        const width = 400;
        const step = width / (data.length - 1 || 1);

        const points = data.map((d, i) => `${i * step},${height - (d.count / maxCount) * height}`).join(' ');

        return (
            <div className="w-full bg-neutral-800/50 p-4 rounded-xl border border-neutral-700">
                <h3 className="text-sm font-semibold mb-4 text-neutral-300 uppercase tracking-wider">Активность за последнее время</h3>
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32 overflow-visible">
                    <polyline
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        strokeLinejoin="round"
                        points={points}
                    />
                    {data.map((d, i) => (
                        <circle key={i} cx={i * step} cy={height - (d.count / maxCount) * height} r="3" fill="#3b82f6" className="hover:r-4 transition-all cursor-pointer" />
                    ))}
                </svg>
                <div className="flex justify-between mt-2 text-[10px] text-neutral-500">
                    <span>{data[0].date ? data[0].date : "n/a"}</span>
                    <span>{data[data.length - 1].date ? data[data.length - 1].date : "n/a"}</span>
                </div>
            </div>
        );
    };