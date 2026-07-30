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
   if (!contact.firstName.trim()) errors.firstName = true;
   if (!contact.lastName.trim()) errors.lastName = true;
   if (!contact.email.trim() || !EMAIL_PATTERN.test(contact.email.trim())) errors.email = true;
   return errors;
}

function ContactFollowUpModalContent({ initialContact, onClose, onConfirm }) {
   const [contact, setContact] = useState(() => normalizeContact(initialContact));
   const [showErrors, setShowErrors] = useState(false);
   const [status, setStatus] = useState("idle"); // idle | submitting | error

   const errors = showErrors ? validateContact(contact) : {};
   const isSubmitting = status === "submitting";

   function updateField(field, value) {
      setContact((prev) => ({ ...prev, [field]: value }));
   }

   async function handleSubmit(event) {
      event.preventDefault();
      const nextErrors = validateContact(contact);
      if (Object.keys(nextErrors).length > 0) {
         setShowErrors(true);
         return;
      }

      setStatus("submitting");
      try {
         await onConfirm({
            firstName: contact.firstName.trim(),
            lastName: contact.lastName.trim(),
            email: contact.email.trim(),
            phone: contact.phone.trim(),
         });
      } catch (error) {
         console.error("Failed to request follow-up:", error);
         setStatus("error");
      }
   }

   return (
      <div
         className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
         role="dialog"
         aria-modal="true"
         aria-labelledby="contact-follow-up-title"
         onClick={() => {
            if (!isSubmitting) onClose();
         }}>
         <div
            className="relative w-full max-w-[450px] -translate-y-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}>
            {isSubmitting && (
               <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-white/90">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#e21313]" />
                  <p className="mt-4 font-rede-geom text-sm uppercase tracking-wider text-slate-500">Submitting</p>
               </div>
            )}

            <div className="flex items-start justify-between gap-4">
               <div>
                  <h2 id="contact-follow-up-title" className="text-2xl font-bold text-slate-900">
                     Request a follow-up
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 italic">We’ll contact you about your estimate.</p>
               </div>
               <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="cursor-pointer rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-default disabled:opacity-50"
                  aria-label="Close">
                  ✕
               </button>
            </div>

            <form
               id="air-seeder-inspection-follow-up"
               name="Air Seeder Inspection Follow-Up"
               onSubmit={handleSubmit}
               className="mt-5 space-y-4"
               noValidate>
               <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                     <label htmlFor="follow-up-first-name" className="mb-1.5 block text-sm font-semibold text-slate-700">
                        First Name <span className="text-[#e21313]">*</span>
                     </label>
                     <input
                        id="follow-up-first-name"
                        name="firstname"
                        type="text"
                        autoComplete="given-name"
                        value={contact.firstName}
                        onChange={(e) => updateField("firstName", e.target.value)}
                        disabled={isSubmitting}
                        className={getFieldClass(Boolean(errors.firstName))}
                        aria-invalid={Boolean(errors.firstName)}
                     />
                  </div>
                  <div>
                     <label htmlFor="follow-up-last-name" className="mb-1.5 block text-sm font-semibold text-slate-700">
                        Last Name <span className="text-[#e21313]">*</span>
                     </label>
                     <input
                        id="follow-up-last-name"
                        name="lastname"
                        type="text"
                        autoComplete="family-name"
                        value={contact.lastName}
                        onChange={(e) => updateField("lastName", e.target.value)}
                        disabled={isSubmitting}
                        className={getFieldClass(Boolean(errors.lastName))}
                        aria-invalid={Boolean(errors.lastName)}
                     />
                  </div>
               </div>

               <div>
                  <label htmlFor="follow-up-email" className="mb-1.5 block text-sm font-semibold text-slate-700">
                     Email <span className="text-[#e21313]">*</span>
                  </label>
                  <input
                     id="follow-up-email"
                     name="email"
                     type="email"
                     autoComplete="email"
                     value={contact.email}
                     onChange={(e) => updateField("email", e.target.value)}
                     disabled={isSubmitting}
                     className={getFieldClass(Boolean(errors.email))}
                     aria-invalid={Boolean(errors.email)}
                  />
               </div>

               <div>
                  <label htmlFor="follow-up-phone" className="mb-1.5 block text-sm font-semibold text-slate-700">
                     Phone <span className="font-normal text-slate-500">(optional)</span>
                  </label>
                  <input
                     id="follow-up-phone"
                     name="phone"
                     type="tel"
                     autoComplete="tel"
                     value={contact.phone}
                     onChange={(e) => updateField("phone", e.target.value)}
                     disabled={isSubmitting}
                     className={fieldClass}
                  />
               </div>

               {status === "error" && <p className="text-sm text-red-600">Couldn’t submit your request. Please try again.</p>}

               <div className="flex justify-end gap-2 pt-2">
                  <button
                     type="button"
                     onClick={onClose}
                     disabled={isSubmitting}
                     className="cursor-pointer rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-rede-geom text-sm font-semibold uppercase italic tracking-wider text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-default disabled:opacity-50">
                     Cancel
                  </button>
                  <button
                     type="submit"
                     disabled={isSubmitting}
                     className="cursor-pointer rounded-xl bg-[#e21313] px-5 py-2.5 font-rede-geom text-sm font-semibold uppercase italic tracking-wider text-white shadow-sm transition hover:bg-[#ce1b1b] disabled:cursor-default disabled:opacity-60">
                     Yes, contact me
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
}

function ContactFollowUpModal({ isOpen, initialContact, onClose, onConfirm }) {
   if (!isOpen) return null;

   return (
      <ContactFollowUpModalContent
         key={isOpen ? "open" : "closed"}
         initialContact={initialContact}
         onClose={onClose}
         onConfirm={onConfirm}
      />
   );
}

export default ContactFollowUpModal;
