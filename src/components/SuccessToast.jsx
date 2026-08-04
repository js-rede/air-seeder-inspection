import { useEffect, useRef } from "react";

function SuccessToast({ title, message, onDismiss, durationMs = 4000 }) {
   const onDismissRef = useRef(onDismiss);
   onDismissRef.current = onDismiss;

   useEffect(() => {
      if (!title) return undefined;

      const timeoutId = window.setTimeout(() => {
         onDismissRef.current?.();
      }, durationMs);

      return () => window.clearTimeout(timeoutId);
   }, [title, message, durationMs]);

   if (!title) return null;

   return (
      <div
         className="pointer-events-none fixed inset-x-4 top-6 z-[9999] flex justify-center sm:inset-x-auto sm:right-6 sm:top-6 sm:justify-end"
         role="status"
         aria-live="polite">
         <div className="pointer-events-auto flex w-full max-w-sm animate-[asi-toast-in_200ms_ease-out] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            <div className="w-1 shrink-0 bg-[#e21313]" aria-hidden="true" />
            <div className="min-w-0 flex-1 px-4 py-3">
               <p className="font-rede-geom text-sm font-semibold uppercase italic tracking-wider text-slate-900">{title}</p>
               {message ? <p className="mt-1 text-sm text-slate-600">{message}</p> : null}
            </div>
            <button
               type="button"
               onClick={onDismiss}
               className="shrink-0 cursor-pointer self-start px-3 py-3 text-sm text-slate-400 transition hover:text-slate-600"
               aria-label="Dismiss">
               ✕
            </button>
         </div>
      </div>
   );
}

export default SuccessToast;
