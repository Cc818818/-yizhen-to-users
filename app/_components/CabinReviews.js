import { getCabinReviews } from "../_lib/data-service";

function Stars({ rating, className = "" }) {
  const rounded = Math.round(Number(rating) || 0);

  return (
    <span className={className}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={n <= rounded ? "text-accent-400" : "text-primary-700"}
        >
          ★
        </span>
      ))}
    </span>
  );
}

async function CabinReviews({ cabin }) {
  const reviews = await getCabinReviews(cabin.id, 5);
  const { avgRating, reviewCount } = cabin;

  return (
    <section className="mt-12 border-t border-primary-800 pt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-accent-400">
          Guest reviews
        </h2>

        {reviewCount > 0 ? (
          <p className="flex items-center gap-3">
            <Stars rating={avgRating} className="text-xl" />
            <span className="font-semibold">{Number(avgRating).toFixed(1)}</span>
            <span className="text-primary-300 text-base">
              ({reviewCount} review{reviewCount > 1 ? "s" : ""})
            </span>
          </p>
        ) : (
          <p className="text-primary-300">No reviews yet</p>
        )}
      </div>

      {reviews.length > 0 && (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li key={review.id} className="border border-primary-800 px-6 py-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold flex items-center gap-2">
                  {review.guests?.countryFlag && (
                    <img
                      src={review.guests.countryFlag}
                      alt=""
                      className="h-4 rounded-sm"
                    />
                  )}
                  {review.guests?.fullName ?? "Guest"}
                </p>
                <Stars rating={review.rating} />
              </div>

              {review.comment && (
                <p className="text-primary-200">{review.comment}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default CabinReviews;
