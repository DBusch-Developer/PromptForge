"use client";

import { getCategoryLabel, getCategoryColor } from "@/data/categories";

interface CategoryBadgeProps {
  catId: string;
  size?: "sm" | "md";
}

export default function CategoryBadge({ catId, size = "md" }: CategoryBadgeProps) {
  const label = getCategoryLabel(catId);
  const color = getCategoryColor(catId);

  const sizeClasses =
    size === "sm"
      ? "text-[9px] px-1.5 py-0.5"
      : "text-[10px] px-2 py-0.5";

  return (
    <span
      className={`inline-flex items-center font-code font-medium tracking-widest uppercase rounded border ${sizeClasses}`}
      style={{
        color,
        borderColor: `${color}33`,
        backgroundColor: `${color}18`,
      }}
    >
      {label}
    </span>
  );
}
