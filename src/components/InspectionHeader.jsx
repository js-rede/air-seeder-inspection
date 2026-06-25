function InspectionHeader({ currentIndex, totalSteps, showProgress = true }) {
   const progress = Math.round(((currentIndex + 1) / totalSteps) * 100);

   return (
      <header className="pb-2">
         <div className="flex items-center justify-between pb-3">
            <div className="text-2xl font-bold font-rede-geom italic uppercase">Online Inspection</div>
            <img src="https://rede-ag.com/wp-content/uploads/2026/06/rede_logo.webp" alt="Red E" className="h-8 w-auto" />
         </div>

         {showProgress && (
            <>
               <div className="opacity-70 text-sm uppercase italic tracking-tight">
                  Step {currentIndex + 1} <span className="text-xs tracking-wide">of</span> {totalSteps}
               </div>

               <div className="h-5 w-full rounded-md border border-gray-400 bg-gray-300">
                  <div id="progress-bar-fill" className="h-full bg-gray-400" style={{ width: `${progress}%` }} />
               </div>
            </>
         )}
      </header>
   );
}

export default InspectionHeader;
