import RatingBadge from "./RatingBadge";
import { answerChoiceGridClass } from "../utils/ratingStyles";

function AnswerChoiceContent({ rating, badgeLabel, children }) {
   return (
      <div className={answerChoiceGridClass}>
         <RatingBadge rating={rating} badgeLabel={badgeLabel} />
         <span className="font-medium">{children}</span>
      </div>
   );
}

export default AnswerChoiceContent;
