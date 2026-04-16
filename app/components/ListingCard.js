"use client";

export default function ListingCard({
  isSelected = false,
  onSelect,
  eyebrow,
  title,
  titleFallback = "Untitled Listing",
  badge,
  description,
  primaryLabel,
  primaryValue,
  secondaryLabel,
  secondaryValue,
  summaryText,
  price,
  priceSuffix = "",
  buttonText,
  onButtonClick,
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      className={`bg-white rounded-[2rem] border shadow-sm hover:shadow-xl transition-all duration-300 ${
        isSelected ? "border-orange-500 ring-1 ring-orange-200" : "border-slate-200"
      } cursor-pointer h-full`}
    >
      <div className="p-8 flex h-full flex-col gap-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] font-semibold text-orange-600">
              {eyebrow}
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              {title || titleFallback}
            </h2>
          </div>
          <span className="rounded-full bg-orange-100 text-orange-600 px-3 py-1 text-[0.65rem] font-bold uppercase">
            {badge}
          </span>
        </div>

        <p className="min-h-[2.5rem] text-sm text-slate-500 line-clamp-2">
          {description || "No description available."}
        </p>

        <div className="space-y-3 text-sm text-slate-500">
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
            <span className="font-semibold text-slate-900">{primaryLabel}</span>
            <span>{primaryValue}</span>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
            <span className="font-semibold text-slate-900">{secondaryLabel}</span>
            <span className="text-right">{secondaryValue}</span>
          </div>
        </div>

        <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
          {summaryText}
        </div>

        <div className="mt-auto">
          <div className="text-3xl font-black text-slate-900">
            ${price}
            {priceSuffix ? (
              <span className="text-sm font-medium text-slate-500 ml-2">{priceSuffix}</span>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onButtonClick?.(event);
          }}
          className="rounded-3xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-700 transition-all"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
