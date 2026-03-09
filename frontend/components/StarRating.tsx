export const StarRating = ({ rating }: { rating: string }) => {
  const r = parseFloat(rating);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          viewBox="0 0 24 24"
          className="w-3.5 h-3.5"
          fill={star <= Math.round(r) ? "#F59E0B" : "#E5E7EB"}
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </div>
  );
};
