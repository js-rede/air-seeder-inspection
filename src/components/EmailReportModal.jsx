import { useState } from "react";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fieldClass =
   "w-full rounded-xl border border-slate-300 bg-gray-100 px-4 py-2.5 text-lg focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200";

const fieldErrorClass =
   "w-full rounded-xl border border-red-500 bg-red-50 px-4 py-2.5 text-lg focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200";

function EmailReportModalContent({ initialEmail = "", onClose, onSend, status = "idle" }) {
   const [emails, setEmails] = useState(() => [initialEmail.trim() || ""]);
   const [followUp, setFollowUp] = useState("");
   const [showErrors, setShowErrors] = useState(false);

   const invalidIndexes = emails.map((email) => {
      const value = email.trim();
      if (!value) return false;
      return !EMAIL_PATTERN.test(value);
   });
   const hasNoValidEmail = !emails.some((email) => EMAIL_PATTERN.test(email.trim()));
   const followUpError = showErrors && followUp !== "yes" && followUp !== "no";

   function updateEmail(index, value) {
      setEmails((prev) => prev.map((item, i) => (i === index ? value : item)));
   }

   function addEmail() {
      setEmails((prev) => [...prev, ""]);
   }

   function removeEmail(index) {
      if (emails.length <= 1) return;
      setEmails((prev) => prev.filter((_, i) => i !== index));
   }

   function handleSubmit(event) {
      event.preventDefault();
      const trimmed = emails.map((email) => email.trim()).filter(Boolean);
      const allValid = trimmed.length > 0 && trimmed.every((email) => EMAIL_PATTERN.test(email));
      const hasFollowUp = followUp === "yes" || followUp === "no";

      if (!allValid || !hasFollowUp) {
         setShowErrors(true);
         return;
      }

      onSend(trimmed);
   }

   const isSending = status === "sending";

   return (
      <div
         className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
         role="dialog"
         aria-modal="true">
         <div className="relative w-full max-w-[450px] -translate-y-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            {isSending && (
               <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-white/90">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#e21313]" />
                  <p className="mt-4 font-rede-geom text-sm uppercase tracking-wider text-slate-500">Sending Report</p>
               </div>
            )}

            <div className="flex items-start justify-between gap-4">
               <div>
                  <h2 className="text-2xl font-bold text-slate-900">Email Inspection Report</h2>
                  <p className="mt-1 text-sm text-slate-600 italic">Send this estimate to one or more email address.</p>
               </div>
               <button
                  type="button"
                  onClick={onClose}
                  disabled={isSending}
                  className="cursor-pointer rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-default disabled:opacity-50"
                  aria-label="Close">
                  ✕
               </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3" noValidate>
               {emails.map((email, index) => {
                  const hasError =
                     showErrors && ((hasNoValidEmail && index === 0) || (email.trim() && invalidIndexes[index]));
                  return (
                     <div key={index} className="flex items-end gap-2 pt-1">
                        <div className="min-w-0 flex-1">
                           {index === 0 && (
                              <label
                                 htmlFor={`email-report-to-${index}`}
                                 className="mb-1.5 block text-sm font-semibold text-slate-700">
                                 Send to
                              </label>
                           )}
                           <input
                              id={`email-report-to-${index}`}
                              type="email"
                              autoComplete="email"
                              value={email}
                              onChange={(e) => updateEmail(index, e.target.value)}
                              placeholder="name@example.com"
                              className={hasError ? fieldErrorClass : fieldClass}
                              aria-invalid={hasError}
                              disabled={isSending}
                           />
                        </div>
                        {emails.length > 1 && (
                           <button
                              type="button"
                              onClick={() => removeEmail(index)}
                              disabled={isSending}
                              className="cursor-pointer rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-lg leading-normal text-slate-600 transition hover:bg-slate-50 disabled:cursor-default disabled:opacity-50"
                              aria-label={`Remove email ${index + 1}`}>
                              −
                           </button>
                        )}
                     </div>
                  );
               })}

               <button
                  type="button"
                  onClick={addEmail}
                  disabled={isSending}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-default disabled:opacity-50">
                  <span className="text-lg leading-none">+</span>
                  Add another email
               </button>

               <fieldset className="mt-6 mb-8">
                  <legend className="mt-12 mb-1.5 block border-0 border-none text-sm font-semibold text-slate-700">
                     Do you want us to contact you about your inspection? <span className="text-[#e21313]">*</span>
                  </legend>
                  <div id="email-report-follow-up" className="flex gap-3">
                     {[
                        { value: "yes", label: "Yes" },
                        { value: "no", label: "No" },
                     ].map((option) => {
                        const selected = followUp === option.value;
                        return (
                           <button
                              key={option.value}
                              type="button"
                              aria-pressed={selected}
                              disabled={isSending}
                              onClick={() => setFollowUp(option.value)}
                              className={`w-[80px] cursor-pointer rounded-xl border p-3 text-center font-medium transition disabled:cursor-default disabled:opacity-50 ${
                                 selected
                                    ? "border-slate-400 bg-slate-300 text-slate-900"
                                    : followUpError
                                      ? "border-red-400 bg-red-50 text-slate-900 hover:border-red-500"
                                      : "border-slate-300 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-50"
                              }`}>
                              {option.label}
                           </button>
                        );
                     })}
                  </div>
               </fieldset>

               {status === "error" && <p className="text-sm text-red-600">Couldn’t send the email. Please try again.</p>}

               <div className="flex justify-end gap-2 pt-2">
                  <button
                     type="button"
                     onClick={onClose}
                     disabled={isSending}
                     className="cursor-pointer rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-rede-geom text-sm font-semibold uppercase italic tracking-wider text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-default disabled:opacity-50">
                     Cancel
                  </button>
                  <button
                     type="submit"
                     disabled={isSending}
                     className="cursor-pointer rounded-xl bg-[#e21313] px-5 py-2.5 font-rede-geom text-sm font-semibold uppercase italic tracking-wider text-white shadow-sm transition hover:bg-[#ce1b1b] disabled:cursor-default disabled:opacity-60">
                     Send
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
}

function EmailReportModal({ isOpen, initialEmail = "", onClose, onSend, status = "idle" }) {
   if (!isOpen) return null;

   return (
      <EmailReportModalContent
         key={`${isOpen}-${initialEmail}`}
         initialEmail={initialEmail}
         onClose={onClose}
         onSend={onSend}
         status={status}
      />
   );
}

export default EmailReportModal;
