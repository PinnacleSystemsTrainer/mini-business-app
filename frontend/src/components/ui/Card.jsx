function Card({ title, children }) {
  return (
    <section className="rounded-lg border bg-white p-4 shadow-sm">
      {title ? (
        <h2 className="mb-3 text-lg font-semibold text-gray-900">{title}</h2>
      ) : null}

      {children}
    </section>
  );
}

export default Card;
