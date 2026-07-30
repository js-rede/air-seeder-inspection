import { useState } from "react";
import { normalizeContact } from "../utils/contactInfo";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fieldClass =
   "w-full rounded-xl border border-slate-300 bg-gray-100 px-4 py-2.5 text-lg focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200";

const fieldErrorClass =
   "w-full rounded-xl border border-red-500 bg-red-50 px-4 py-2.5 text-lg focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200";

function getFieldClass(hasError) {
   return hasError ? fieldErrorClass : fieldClass;
}

function validateContact(contact) {
   const errors = {};
   const firstName = contact.firstName.trim();
   const lastName = contact.lastName.trim();
   const email = contact.email.trim();

   if (!firstName) errors.firstName = true;
   if (!lastName) errors.lastName = true;
   if (!email || !EMAIL_PATTERN.test(email)) errors.email = true;

   return errors;
}

const FIELD_IDS = {
   firstName: "inspection-contact-first-name",
   lastName: "inspection-contact-last-name",
   email: "inspection-contact-email",
};

function InspectionContactForm({ initialContact, onSubmit, onSkip, onBack }) {
   const [contact, setContact] = useState(() => normalizeContact(initialContact));
   const [showErrors, setShowErrors] = useState(false);

   const errors = showErrors ? validateContact(contact) : {};

   function updateField(field, value) {
      setContact((prev) => ({ ...prev, [field]: value }));
   }

   function handleSubmit(event) {
      event.preventDefault();
      const nextErrors = validateContact(contact);

      if (Object.keys(nextErrors).length > 0) {
         setShowErrors(true);
         requestAnimationFrame(() => {
            const firstKey = ["firstName", "lastName", "email"].find((key) => nextErrors[key]);
            const el = firstKey ? document.getElementById(FIELD_IDS[firstKey]) : null;
            el?.scrollIntoView({ behavior: "smooth", block: "center" });
            if (el && typeof el.focus === "function") {
               try {
                  el.focus({ preventScroll: true });
               } catch {
                  /* ignore */
               }
            }
         });
         return;
      }

      setShowErrors(false);
      onSubmit({
         firstName: contact.firstName.trim(),
         lastName: contact.lastName.trim(),
         email: contact.email.trim(),
         phone: contact.phone.trim(),
      });
   }

   return (
      <form id="air-seeder-inspection-contact" name="Air Seeder Inspection Contact" onSubmit={handleSubmit} noValidate>
         <section className="-mx-4 mt-5 rounded-none border border-slate-200 border-x-0 bg-white p-4 shadow-sm md:mx-0 md:rounded-2xl md:border-x md:p-8">
            <h2 className="text-3xl font-bold text-slate-900">Almost done</h2>
            <p className="mt-3 text-sm text-slate-600 italic">
               Enter your contact info to view and save your inspection estimate.
            </p>

            <div className="mt-6 space-y-4">
               <div className="grid gap-4 md:grid-cols-2">
                  <div>
                     <label htmlFor={FIELD_IDS.firstName} className="mb-1.5 block text-sm font-semibold text-slate-700">
                        First Name <span className="text-[#e21313]">*</span>
                     </label>
                     <input
                        id={FIELD_IDS.firstName}
                        name="firstname"
                        type="text"
                        autoComplete="given-name"
                        value={contact.firstName}
                        onChange={(e) => updateField("firstName", e.target.value)}
                        className={getFieldClass(Boolean(errors.firstName))}
                        aria-invalid={Boolean(errors.firstName)}
                     />
                  </div>

                  <div>
                     <label htmlFor={FIELD_IDS.lastName} className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Last Name <span className="text-[#e21313]">*</span>
                     </label>
                     <input
                        id={FIELD_IDS.lastName}
                        name="lastname"
                        type="text"
                        autoComplete="family-name"
                        value={contact.lastName}
                        onChange={(e) => updateField("lastName", e.target.value)}
                        className={getFieldClass(Boolean(errors.lastName))}
                        aria-invalid={Boolean(errors.lastName)}
                     />
                  </div>
               </div>

               <div className="grid gap-4 md:grid-cols-2">
                  <div>
                     <label htmlFor={FIELD_IDS.email} className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Email <span className="text-[#e21313]">*</span>
                     </label>
                     <input
                        id={FIELD_IDS.email}
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={contact.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        className={getFieldClass(Boolean(errors.email))}
                        aria-invalid={Boolean(errors.email)}
                     />
                  </div>

                  <div>
                     <label htmlFor="inspection-contact-phone" className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Phone <span className="font-normal text-slate-500">(optional)</span>
                     </label>
                     <input
                        id="inspection-contact-phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        value={contact.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        className={fieldClass}
                     />
                  </div>
               </div>
            </div>
         </section>

         <footer className="mt-7 flex flex-col-reverse gap-3 md:flex-row md:items-center md:justify-between">
            <button
               type="button"
               onClick={onBack}
               className="cursor-pointer rounded-xl border border-slate-300 bg-white px-5 py-3 font-rede-geom text-sm font-semibold uppercase italic tracking-wider text-slate-600 shadow-sm transition hover:bg-slate-50">
               ← Back
            </button>
            <div className="flex flex-col items-stretch gap-2 md:items-end">
               <button
                  type="submit"
                  className="cursor-pointer rounded-xl bg-[#e21313] px-6 py-3 font-rede-geom text-sm font-semibold uppercase italic tracking-wider text-white shadow-sm transition hover:bg-[#ce1b1b]">
                  View my estimate
               </button>
               <button
                  type="button"
                  onClick={onSkip}
                  className="mt-1.5 cursor-pointer self-end border-none bg-transparent p-0 text-xs font-medium uppercase italic tracking-wide text-slate-600 opacity-70 transition hover:opacity-100">
                  Skip for now →
               </button>
            </div>
         </footer>
      </form>
   );
}

export default InspectionContactForm;
