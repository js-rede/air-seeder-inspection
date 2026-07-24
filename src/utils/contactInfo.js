export function createEmptyContact() {
   return {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      followUp: "",
   };
}

export function normalizeContact(contact = {}) {
   const empty = createEmptyContact();
   const next = { ...empty, ...contact };

   // Migrate older drafts that only stored a single "name" field.
   if (!next.firstName && !next.lastName && contact.name) {
      const parts = String(contact.name).trim().split(/\s+/);
      next.firstName = parts[0] || "";
      next.lastName = parts.slice(1).join(" ");
   }

   delete next.name;
   delete next.farmName;
   return next;
}
