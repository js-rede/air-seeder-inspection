import { useEffect, useState } from "react";

function SectionImage({ imageUrl, alt, caption, imagePadding = "p-0" }) {
   const [isOpen, setIsOpen] = useState(false);
   const frameClass = `overflow-hidden rounded-xl border border-slate-300 ${imagePadding}`;

   useEffect(() => {
      if (!isOpen) return undefined;

      function handleKeyDown(event) {
         if (event.key === "Escape") {
            setIsOpen(false);
         }
      }

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
   }, [isOpen]);

   if (!imageUrl) return null;

   return (
      <>
         <div className="w-full max-w-full sm:w-fit">
            {caption && <p className="mb-2 text-sm text-slate-500 italic">{caption}</p>}

            <div className={`block w-full sm:hidden ${frameClass}`}>
               <img src={imageUrl} alt={alt} className="block h-auto w-full" />
            </div>

            <button
               type="button"
               onClick={() => setIsOpen(true)}
               className={`hidden cursor-zoom-in transition-transform duration-200 hover:scale-[1.02] sm:inline-block ${frameClass}`}
               aria-label={`View larger image of ${alt}`}>
               <img src={imageUrl} alt={alt} className="block h-auto max-h-[218px] w-auto max-w-full" />
            </button>
         </div>

         {isOpen && (
            <div
               className="fixed inset-0 z-50 hidden items-center justify-center bg-slate-900/80 p-4 sm:flex sm:p-8"
               role="dialog"
               aria-modal="true"
               aria-label={`${alt} preview`}
               onClick={() => setIsOpen(false)}>
               <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="absolute right-4 top-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-slate-900/80 text-2xl !text-white transition hover:bg-slate-900"
                  aria-label="Close image preview">
                  <span className="relative -top-0.5 block leading-none !text-white">×</span>
               </button>

               <img
                  src={imageUrl}
                  alt={alt}
                  className="max-h-[85vh] max-w-[min(90vw,56rem)] rounded-xl border border-slate-300 bg-white object-contain shadow-2xl"
                  onClick={(event) => event.stopPropagation()}
               />
            </div>
         )}
      </>
   );
}

export default SectionImage;
