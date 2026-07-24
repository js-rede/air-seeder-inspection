import { useState } from "react";
import { normalizeContact } from "../utils/contactInfo";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fieldClass =
   "w-full rounded-xl border border-slate-300 bg-gray-100 px-4 py-2.5 text-lg focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200";

function validateContact(contact) {
   const errors = {};
   const firstName = contact.firstName.trim();
   const lastName = contact.lastName.trim();
   const email = contact.email.trim();

   if (!firstName) errors.firstName = "Enter your first name.";
   if (!lastName) errors.lastName = "Enter your last name.";
   if (!email) errors.email = "Enter your email.";
   else if (!EMAIL_PATTERN.test(email)) errors.email = "Enter a valid email address.";
   if (contact.followUp !== "yes" && contact.followUp !== "no") {
      errors.followUp = "Please choose yes or no.";
   }

   return errors;
}

function InspectionContactForm({ initialContact, onSubmit, onSkip, onBack }) {
   const [contact, setContact] = useState(() => normalizeContact(initialContact));
   const [errors, setErrors] = useState({});
   const [touched, setTouched] = useState({});

   function updateField(field, value) {
      setContact((prev) => ({ ...prev, [field]: value }));
      if (touched[field] || errors[field]) {
         setErrors((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
         });
      }
   }

   function handleBlur(field) {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const nextErrors = validateContact({ ...contact });
      setErrors((prev) => {
         const merged = { ...prev };
         if (nextErrors[field]) merged[field] = nextErrors[field];
         else delete merged[field];
         return merged;
      });
   }

   function handleSubmit(event) {
      event.preventDefault();
      const nextErrors = validateContact(contact);
      setErrors(nextErrors);
      setTouched({ firstName: true, lastName: true, email: true, phone: true, followUp: true });
      if (Object.keys(nextErrors).length > 0) return;

      onSubmit({
         firstName: contact.firstName.trim(),
         lastName: contact.lastName.trim(),
         email: contact.email.trim(),
         phone: contact.phone.trim(),
         followUp: contact.followUp,
      });
   }

   return (
      <form onSubmit={handleSubmit} noValidate>
         <section className="-mx-4 mt-5 rounded-none border border-slate-200 border-x-0 bg-white p-4 shadow-sm md:mx-0 md:rounded-2xl md:border-x md:p-8">
            <h2 className="text-3xl font-bold text-slate-900">Almost done</h2>
            <p className="mt-3 text-sm text-slate-600 italic">
               Enter your contact info to view and save your inspection estimate.
            </p>

            <div className="mt-6 space-y-4">
               <div className="grid gap-4 md:grid-cols-2">
                  <div>
                     <label
                        htmlFor="inspection-contact-first-name"
                        className="mb-1.5 block text-sm font-semibold text-slate-700">
                        First Name <span className="text-[#e21313]">*</span>
                     </label>
                     <input
                        id="inspection-contact-first-name"
                        type="text"
                        autoComplete="given-name"
                        value={contact.firstName}
                        onChange={(e) => updateField("firstName", e.target.value)}
                        onBlur={() => handleBlur("firstName")}
                        className={fieldClass}
                        aria-invalid={Boolean(errors.firstName)}
                        aria-describedby={errors.firstName ? "inspection-contact-first-name-error" : undefined}
                     />
                     {errors.firstName && (
                        <p id="inspection-contact-first-name-error" className="mt-1 text-sm text-red-700">
                           {errors.firstName}
                        </p>
                     )}
                  </div>

                  <div>
                     <label
                        htmlFor="inspection-contact-last-name"
                        className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Last Name <span className="text-[#e21313]">*</span>
                     </label>
                     <input
                        id="inspection-contact-last-name"
                        type="text"
                        autoComplete="family-name"
                        value={contact.lastName}
                        onChange={(e) => updateField("lastName", e.target.value)}
                        onBlur={() => handleBlur("lastName")}
                        className={fieldClass}
                        aria-invalid={Boolean(errors.lastName)}
                        aria-describedby={errors.lastName ? "inspection-contact-last-name-error" : undefined}
                     />
                     {errors.lastName && (
                        <p id="inspection-contact-last-name-error" className="mt-1 text-sm text-red-700">
                           {errors.lastName}
                        </p>
                     )}
                  </div>
               </div>

               <div className="grid gap-4 md:grid-cols-2">
                  <div>
                     <label htmlFor="inspection-contact-email" className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Email <span className="text-[#e21313]">*</span>
                     </label>
                     <input
                        id="inspection-contact-email"
                        type="email"
                        autoComplete="email"
                        value={contact.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        onBlur={() => handleBlur("email")}
                        className={fieldClass}
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? "inspection-contact-email-error" : undefined}
                     />
                     {errors.email && (
                        <p id="inspection-contact-email-error" className="mt-1 text-sm text-red-700">
                           {errors.email}
                        </p>
                     )}
                  </div>

                  <div>
                     <label htmlFor="inspection-contact-phone" className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Phone <span className="font-normal text-slate-500">(optional)</span>
                     </label>
                     <input
                        id="inspection-contact-phone"
                        type="tel"
                        autoComplete="tel"
                        value={contact.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        className={fieldClass}
                     />
                  </div>
               </div>

               <fieldset className="mt-5">
                  <legend className="mb-1.5 block text-sm font-semibold text-slate-700">
                     Do you want us to contact you about your inspection? <span className="text-[#e21313]">*</span>
                  </legend>
                  <div className="flex gap-3">
                     {[
                        { value: "yes", label: "Yes" },
                        { value: "no", label: "No" },
                     ].map((option) => {
                        const selected = contact.followUp === option.value;
                        return (
                           <button
                              key={option.value}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => updateField("followUp", option.value)}
                              className={`w-[80px] cursor-pointer rounded-xl border p-3 text-center font-medium transition ${
                                 selected
                                    ? "border-slate-500 bg-slate-100 text-slate-900"
                                    : "border-slate-300 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-50"
                              }`}>
                              {option.label}
                           </button>
                        );
                     })}
                  </div>
                  {errors.followUp && (
                     <p className="mt-1 text-sm text-red-700" role="alert">
                        {errors.followUp}
                     </p>
                  )}
               </fieldset>
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
                  className="mt-1.5 cursor-pointer self-end text-xs font-medium uppercase italic tracking-wide text-slate-600 opacity-70 transition hover:opacity-100">
                  Skip for now →
               </button>
            </div>
         </footer>
      </form>
   );
}

export default InspectionContactForm;
