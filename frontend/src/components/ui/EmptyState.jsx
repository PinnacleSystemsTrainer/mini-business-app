function EmptyState({ title = 'No data found', description }) {
  return (
    <div className="rounded-lg border border-dashed bg-white p-6 text-center shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm text-gray-500">{description}</p>
      ) : null}
    </div>
  );
}

export default EmptyState;
