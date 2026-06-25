import { useState } from "react";

const WELCOME_VIDEO_ID = "8119W1OvqG0";
const WELCOME_VIDEO_EMBED = `https://www.youtube-nocookie.com/embed/${WELCOME_VIDEO_ID}`;

function WelcomeVideo() {
   const [isPlaying, setIsPlaying] = useState(false);

   return (
      <div className="mx-auto w-full">
         <div className="mb-1 text-sm font-400 text-slate-500 italic">Watch our VP Jesse perform an inspection...</div>

         <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-900 shadow-sm">
            {isPlaying ? (
               <iframe
                  src={`${WELCOME_VIDEO_EMBED}?autoplay=1`}
                  title="Red E inspection overview"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="aspect-video w-full"
               />
            ) : (
               <button
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  className="group relative block aspect-video w-full cursor-pointer"
                  aria-label="Play inspection overview video">
                  <img
                     src={`https://rede-ag.com/wp-content/uploads/2026/05/Thumbnail.webp`}
                     alt=""
                     className="h-full w-full object-cover"
                  />
                  <span className="absolute inset-0 bg-slate-900/0 transition group-hover:bg-gray-900/15" />
                  <span className="absolute inset-0 flex items-center justify-center">
                     <svg
                        viewBox="0 0 68 48"
                        aria-hidden="true"
                        className="h-12 w-auto drop-shadow-lg transition group-hover:scale-105">
                        <path
                           d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55C3.97 2.33 2.27 4.81 1.48 7.74.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24S67.94 13.05 66.52 7.74z"
                           className="fill-[#ff0000] transition"
                        />
                        <path d="M45 24 27 14v20z" fill="white" />
                     </svg>
                  </span>
               </button>
            )}
         </div>
      </div>
   );
}

function InspectionWelcome({ onStart }) {
   return (
      <section className="mt-2 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
         <h2 className="mb-4 text-2xl sm:text-3xl font-bold text-slate-900">Welcome to the Red E Online Inspection Tool</h2>

         <div className="space-y-4 text-lg leading-relaxed text-slate-600 lg:flex-1">
            <div>
               This is a step-by-step guide for inspecting your air seeder or planter. After completing the inspection, this
               tool will provide a rough estimate of what it would cost for Red E to rebuild or service your equipment.{" "}
               <span className="italic text-sm ">
                  (All price estimates are for informational purposes and are subject to change.)
               </span>
            </div>

            <div>
               <div className="mb-1">Learn more about our inspections, or schedule a free onsite inspection:</div>
               <a
                  href="https://rede.ag/inspection"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-400 bg-neutral-100 px-5 py-3 font-rede-geom text-sm font-semibold uppercase italic tracking-wider text-slate-600 shadow-sm transition hover:bg-neutral-100">
                  <span>Free Onsite Inspections</span>
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0 -mt-px">
                     <path
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"
                     />
                  </svg>
               </a>
            </div>
         </div>

         <img
            src="https://rede-ag.com/wp-content/uploads/2026/06/air-seeder-inspection.webp"
            alt="Welcome to the Red E Online Inspection Tool"
            className="w-full mt-4 mb-8"
         />

         <button
            type="button"
            onClick={onStart}
            className="mb-8 sm:text-2xl text-xl w-full cursor-pointer rounded-xl bg-[#e21313] px-6 py-5 font-rede-geom font-semibold uppercase italic sm:tracking-normal tracking-wider text-white shadow-sm transition hover:bg-[#ce1b1b]">
            Start Online Inspection →
         </button>

         {/* <WelcomeVideo /> */}

         <div className="mt-1 text-sm text-slate-500">
            For more information, call or text us at{" "}
            <a href="tel:7012051485" className="font-semibold text-[#e21313] hover:underline">
               701-205-1485
            </a>{" "}
            or email{" "}
            <a href="mailto:sales@rede-ag.com" className="font-semibold text-[#e21313] hover:underline">
               sales@rede-ag.com
            </a>
            .
         </div>
      </section>
   );
}

export default InspectionWelcome;
