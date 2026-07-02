import {
   getChoiceValue,
   getSectionChoices,
   getSectionSelections,
} from "../utils/choices";
import AnswerChoiceContent from "./AnswerChoiceContent";
import SectionImage from "./SectionImage";
import { choiceButtonRatingStyles } from "../utils/ratingStyles";

const ratingStyles = choiceButtonRatingStyles;

const buttonBase = "w-full rounded-xl border p-4 text-left transition cursor-pointer";
const sectionCardClass = "rounded-xl border border-slate-300 bg-slate-100 p-4";
const sectionCardTitleClass = "text-sm font-semibold uppercase tracking-wide text-slate-700";
const sectionSubheadingClass = "text-base font-semibold text-slate-900";
const secondaryButtonBase = "w-full rounded-xl border p-4 text-left transition cursor-pointer";
const secondarySelectedClass = "border-blue-600 bg-blue-50 text-blue-900";
const secondaryUnselectedClass = "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50";

function getSectionKey(section) {
   return section.value ?? section.label;
}

function getSectionEntry(selections, sectionKey) {
   const entry = selections[sectionKey];
   if (!entry || typeof entry !== "object") {
      return {
         value: typeof entry === "string" ? entry : "",
         secondary: "",
         secondaryOther: "",
      };
   }

   return {
      value: entry.value ?? "",
      secondary: entry.secondary ?? "",
      secondaryOther: entry.secondaryOther ?? "",
   };
}

function SectionSelectionForm({ sections = [], choices, value, onChange, hideSectionSecondary = false }) {
   const selections = getSectionSelections(value);

   function updateSection(sectionKey, nextEntry) {
      onChange({
         sections: {
            ...selections,
            [sectionKey]: nextEntry,
         },
      });
   }

   function selectCondition(section, choiceValue) {
      const sectionKey = getSectionKey(section);
      const entry = getSectionEntry(selections, sectionKey);

      updateSection(sectionKey, {
         ...entry,
         value: choiceValue,
      });
   }

   function selectSecondary(section, choiceValue) {
      const sectionKey = getSectionKey(section);
      const entry = getSectionEntry(selections, sectionKey);
      const otherChoiceValue = section.secondary_choices?.find((choice) => getChoiceValue(choice) === "other")
         ? "other"
         : null;

      updateSection(sectionKey, {
         ...entry,
         secondary: choiceValue,
         secondaryOther: otherChoiceValue && choiceValue === otherChoiceValue ? entry.secondaryOther : "",
      });
   }

   function updateSecondaryOther(section, nextOther) {
      const sectionKey = getSectionKey(section);
      const entry = getSectionEntry(selections, sectionKey);

      updateSection(sectionKey, {
         ...entry,
         secondaryOther: nextOther,
      });
   }

   return (
      <div className="mt-6 space-y-5">
         {sections.map((section) => {
            const sectionKey = getSectionKey(section);
            const entry = getSectionEntry(selections, sectionKey);
            const hasSecondaryChoices = Boolean(section.secondary_choices?.length) && !hideSectionSecondary && !section.hide_secondary;
            const otherChoiceValue = section.secondary_choices?.find((choice) => getChoiceValue(choice) === "other")
               ? "other"
               : null;
            const sectionChoices = getSectionChoices(section, choices);

            return (
               <div key={sectionKey} className={`${sectionCardClass} space-y-3`}>
                  <h3 className={sectionCardTitleClass}>{section.label}</h3>

                  {section.image_url && (
                     <SectionImage
                        imageUrl={section.image_url}
                        alt={section.label}
                        caption={section.image_caption}
                        imagePadding={section.image_padding ?? "p-0"}
                     />
                  )}

                  {section.question && <p className="text-base text-slate-700">{section.question}</p>}

                  {hasSecondaryChoices && (
                     <div className="space-y-3">
                        <div className={sectionSubheadingClass}>{section.secondary_question || "Current setup"}</div>

                        {section.secondary_choices.map((choice) => {
                           const choiceValue = getChoiceValue(choice);
                           const isSelected = entry.secondary === choiceValue;

                           return (
                              <button
                                 key={`${sectionKey}-secondary-${choiceValue}`}
                                 type="button"
                                 className={`${secondaryButtonBase} ${isSelected ? secondarySelectedClass : secondaryUnselectedClass}`}
                                 onClick={() => selectSecondary(section, choiceValue)}>
                                 <span className="block font-semibold text-slate-900">{choice.label}</span>
                              </button>
                           );
                        })}

                        {otherChoiceValue && entry.secondary === otherChoiceValue && (
                           <div>
                              <label
                                 htmlFor={`${sectionKey}-secondary-other`}
                                 className="mb-2 block text-sm font-medium text-slate-700">
                                 Please describe
                              </label>
                              <input
                                 id={`${sectionKey}-secondary-other`}
                                 type="text"
                                 value={entry.secondaryOther}
                                 onChange={(e) => updateSecondaryOther(section, e.target.value)}
                                 placeholder="Describe current setup"
                                 className="w-full rounded-xl border border-slate-500 p-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                              />
                           </div>
                        )}
                     </div>
                  )}

                  <div className="space-y-3">
                     {(section.condition_question || hasSecondaryChoices) && (
                        <div className={sectionSubheadingClass}>
                           {section.condition_question || "Acceptance criteria"}
                        </div>
                     )}

                     {sectionChoices.map((choice) => {
                        const choiceValue = getChoiceValue(choice);
                        const isSelected = entry.value === choiceValue;
                        const styles = ratingStyles[choice.rating] ?? ratingStyles.unknown;

                        return (
                           <button
                              key={`${sectionKey}-${choiceValue}`}
                              type="button"
                              className={`${buttonBase} ${isSelected ? styles.selected : styles.unselected}`}
                              onClick={() => selectCondition(section, choiceValue)}>
                              <AnswerChoiceContent rating={choice.rating} badgeLabel={choice.badge_label}>
                                 {choice.label}
                              </AnswerChoiceContent>
                           </button>
                        );
                     })}

                  </div>
               </div>
            );
         })}
      </div>
   );
}

export default SectionSelectionForm;
