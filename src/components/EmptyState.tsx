interface EmptyStateProps {
  query?: string;
  category?: string;
}

export default function EmptyState({ query, category }: EmptyStateProps) {
  const message =
    query
      ? `No templates match "${query}"`
      : category === "favorites"
      ? "No favorites yet — star a template to save it here"
      : "No templates in this category";

  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="font-code text-[28px] text-text-muted mb-3">[ ]</div>
      <p className="text-[14px] text-text-secondary">{message}</p>
      {query && (
        <p className="text-[12px] text-text-muted mt-2">
          Try a different keyword, or browse a category from the sidebar.
        </p>
      )}
    </div>
  );
}
