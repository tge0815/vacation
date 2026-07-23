"use client";

export type Country = { id: string; name: string; continent: string; d: string };
export type MapData = { viewBox: string; countries: Country[] };

export function MapBoard({
  map,
  highlightId,
  pickable,
  result,
  onPick,
}: {
  map: MapData;
  highlightId?: string | null;
  pickable?: boolean;
  result?: { correctId: string; pickedId?: string } | null;
  onPick?: (id: string) => void;
}) {
  return (
    <svg
      viewBox={map.viewBox}
      className="w-full h-auto rounded-xl bg-sky-100/60 dark:bg-sky-950/30"
      style={{ maxHeight: "58vh" }}
      role="img"
    >
      {map.countries.map((c, i) => {
        let fill = "fill-neutral-300 dark:fill-neutral-700";
        if (result) {
          if (c.id === result.correctId) fill = "fill-emerald-500";
          else if (c.id === result.pickedId) fill = "fill-rose-500";
        } else if (highlightId && c.id === highlightId) {
          fill = "fill-amber-400";
        }
        return (
          <path
            key={i}
            d={c.d}
            fillRule="evenodd"
            strokeWidth={0.6}
            className={`stroke-white dark:stroke-neutral-900 ${fill} ${
              pickable ? "cursor-pointer hover:fill-sky-400" : ""
            }`}
            onClick={() => pickable && onPick?.(c.id)}
          />
        );
      })}
    </svg>
  );
}
