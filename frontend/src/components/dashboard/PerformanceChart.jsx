export default function PerformanceChart({
  data = [],
  valueKey = "minutes",
  labelKey = "day",
  title = "Weekly Activity",
  valueLabel,
}) {
  const values = data.map(
    (item) => Number(item[valueKey]) || 0
  );

  const max = Math.max(...values, 1);

  function getValueLabel(value) {
    if (valueLabel) {
      return valueLabel(value);
    }

    if (valueKey === "enrollments") {
      return value === 1
        ? "enrollment"
        : "enrollments";
    }

    if (valueKey === "students") {
      return value === 1
        ? "student"
        : "students";
    }

    if (valueKey === "courses") {
      return value === 1
        ? "course"
        : "courses";
    }

    if (valueKey === "minutes") {
      return value === 1
        ? "minute"
        : "minutes";
    }

    return valueKey;
  }

  return (
    <section
      aria-labelledby="performance-title"
      className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2
          id="performance-title"
          className="text-sm font-bold text-ink"
        >
          {title}
        </h2>

        {data.length > 0 && (
          <span className="text-[11px] font-medium text-slate-400">
            Last 7 days
          </span>
        )}
      </div>

      {/* EMPTY */}
      {data.length === 0 ? (
        <p className="mt-8 text-center text-sm text-slate-400">
          No activity data available.
        </p>
      ) : (
        <div
          className="mt-5 flex items-end justify-between gap-2"
          style={{ height: 150 }}
        >
          {data.map((item, index) => {
            const value =
              Number(item[valueKey]) || 0;

            const percentage =
              (value / max) * 100;

            return (
              <div
                key={`${item[labelKey]}-${index}`}
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                {/* VALUE */}
                <span className="text-[10px] font-bold text-slate-500">
                  {value}
                </span>

                {/* BAR AREA */}
                <div
                  className="flex w-full flex-1 items-end"
                  style={{ maxHeight: 105 }}
                >
                  <div
                    className="w-full rounded-t-md bg-primary/80 transition-all duration-300"
                    style={{
                      height:
                        value > 0
                          ? `${Math.max(
                              percentage,
                              6
                            )}%`
                          : "3%",
                    }}
                    title={`${value} ${getValueLabel(
                      value
                    )}`}
                  />
                </div>

                {/* DAY */}
                <span className="text-[10px] font-semibold text-slate-400">
                  {item[labelKey]}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}