export default function Loading({ isLoaded }) {
   return (
      <div
         className={`
            absolute top-0 left-0 w-full h-full z-50 bg-white
            transition-opacity duration-700
            ${isLoaded ? "opacity-0 pointer-events-none" : "opacity-100"}
         `}>
         <div className="flex flex-col items-center justify-center sm:p-20 p-10">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#e21313]" />

            <p className="mt-4 font-rede-geom uppercase tracking-wider text-slate-500 sm:text-base text-sm">
               Loading Inspection
            </p>
         </div>
      </div>
   );
}
