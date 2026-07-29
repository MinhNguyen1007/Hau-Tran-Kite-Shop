'use client'

// Biểu đồ cho trang tổng quan, vẽ bằng recharts.
//
// Client Component: recharts đo kích thước DOM thật để vẽ nên chỉ chạy ở trình duyệt. Dữ liệu
// vẫn do Server Component tính sẵn rồi truyền xuống, ở đây không có truy vấn nào.
//
// Màu theo luật của skill dataviz:
//  - Chuỗi ĐƠN (lượt xem theo ngày, thanh xếp hạng) → MỘT sắc độ ink, không tô mỗi cột một màu.
//  - Biểu đồ tròn mã hoá DANH TÍNH → bảng màu phân loại, thứ tự CỐ ĐỊNH, không xoay vòng.
//    Bảng dưới đã chạy qua scripts/validate_palette.js của skill: đạt cả dải sáng, sàn chroma,
//    tách màu cho người mù màu (ΔE 9.1 cặp xấu nhất) và sàn thị lực thường (ΔE 19.6).
//    Trình kiểm cảnh báo tương phản vài sắc so với nền trắng → chú giải LUÔN ghi tên + số + %,
//    không bao giờ để màu tự đứng một mình.
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const SERIES = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300']
const INK = '#060e1e'
const GRID = '#e7e5e4'
const MUTED = '#a8a29e'

const dayLabel = (key: string) => {
  const [, month, day] = key.split('-')
  return `${Number(day)}/${Number(month)}`
}

const fullDayLabel = (key: string) => {
  const [year, month, day] = key.split('-')
  return `${Number(day)}/${Number(month)}/${year}`
}

const AXIS = { fontSize: 11, fill: MUTED }

// Tooltip mặc định của recharts viền xám nhạt bo nhẹ, lệch hẳn tông thẻ trong admin.
const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: '1px solid #e7e5e4',
  boxShadow: '0 8px 24px rgb(0 0 0 / 0.08)',
  fontSize: 13,
  padding: '8px 12px',
} as const

function EmptyState({ label }: { label: string }) {
  return <p className="py-12 text-center text-sm text-stone-600">{label}</p>
}

export function ViewsAreaChart({ data }: { data: { day: string; count: number }[] }) {
  const total = data.reduce((sum, point) => sum + point.count, 0)
  if (total === 0) return <EmptyState label="Chưa có lượt xem nào trong hai tuần qua." />

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <defs>
            <linearGradient id="views-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={INK} stopOpacity={0.18} />
              <stop offset="100%" stopColor={INK} stopOpacity={0} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="day"
            tickFormatter={dayLabel}
            tick={AXIS}
            tickLine={false}
            axisLine={{ stroke: GRID }}
            // Cách một nhãn lấy một: 14 nhãn sát nhau trên màn hẹp là chồng chữ.
            interval={1}
          />
          <YAxis
            tick={AXIS}
            tickLine={false}
            axisLine={false}
            width={44}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            labelFormatter={(value) => fullDayLabel(String(value))}
            formatter={(value) => [`${value} lượt xem`, '']}
            separator=""
            cursor={{ stroke: GRID, strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke={INK}
            strokeWidth={2}
            fill="url(#views-fill)"
            // Chấm chỉ hiện khi rê tới: 14 chấm lúc nào cũng hiện làm đường bị rối.
            dot={false}
            activeDot={{ r: 4, fill: '#fff', stroke: INK, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function DonutChart({
  slices,
  unit,
  emptyLabel,
}: {
  slices: { id: string; label: string; count: number }[]
  unit: string
  emptyLabel: string
}) {
  const total = slices.reduce((sum, slice) => sum + slice.count, 0)
  if (total === 0) return <EmptyState label={emptyLabel} />

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
      <div className="relative h-40 w-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="count"
              nameKey="label"
              innerRadius="62%"
              outerRadius="100%"
              // Khe 2 độ giữa các múi: hai múi cạnh nhau không dính thành một mảng màu.
              paddingAngle={2}
              stroke="none"
              startAngle={90}
              endAngle={-270}
              isAnimationActive={false}
            >
              {slices.map((slice, index) => (
                <Cell key={slice.id} fill={SERIES[index % SERIES.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(value, nameValue) => [`${value} ${unit}`, String(nameValue)]}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Tổng đặt giữa vòng: recharts không có nhãn tâm sẵn, chồng bằng CSS là xong.
            pointer-events-none để không chặn chuột rê lên múi phía dưới. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tabular-nums text-ink-950">{total}</span>
          <span className="text-[11px] text-stone-500">{unit}</span>
        </div>
      </div>

      <ul className="flex min-w-0 flex-1 flex-col gap-2">
        {slices.map((slice, index) => (
          <li key={slice.id} className="flex items-center gap-2.5 text-sm">
            <span
              aria-hidden
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: SERIES[index % SERIES.length] }}
            />
            <span className="min-w-0 flex-1 truncate text-stone-700">{slice.label}</span>
            <span className="shrink-0 font-semibold tabular-nums text-ink-950">{slice.count}</span>
            <span className="w-9 shrink-0 text-right text-xs tabular-nums text-stone-500">
              {Math.round((slice.count / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function RankedBars({
  rows,
  unit,
  emptyLabel,
}: {
  rows: { id: string; label: string; count: number }[]
  unit: string
  emptyLabel: string
}) {
  if (rows.length === 0) return <EmptyState label={emptyLabel} />

  return (
    <div style={{ height: rows.length * 46 + 8 }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ top: 0, right: 44, bottom: 0, left: 0 }}
          barCategoryGap={10}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fontSize: 12, fill: '#44403c' }}
            tickLine={false}
            axisLine={false}
            width={140}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            cursor={{ fill: '#f5f5f4' }}
            formatter={(value) => [`${value} ${unit}`, '']}
            separator=""
          />
          <Bar dataKey="count" fill={INK} radius={[4, 4, 4, 4]} barSize={14} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
