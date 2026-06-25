const selectChevron =
   "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";

export const selectClass = [
   "w-full appearance-none rounded-xl border border-slate-300 bg-gray-100 py-2.5 pl-4 pr-12 text-lg",
   "bg-[length:1.25rem] bg-[position:right_0.625rem_center] bg-no-repeat",
   "focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200",
].join(" ");

export const selectStyle = {
   backgroundImage: selectChevron,
};
