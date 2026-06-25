import { getRatingDotClassName, getRatingLabel } from "../utils/ratingStyles";

function RatingBadge({ rating, badgeLabel }) {
   const label = getRatingLabel(rating, badgeLabel);

   return (
      <span
         role="img"
         aria-label={label}
         title={label}
         className={`inline-block h-3.5 w-3.5 shrink-0 rounded-full ${getRatingDotClassName(rating)}`}
      />
   );
}

export default RatingBadge;
