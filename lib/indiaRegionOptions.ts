/** Indian states / UTs for registration address dropdowns */
export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;

const DISTRICTS: Record<string, string[]> = {
  Karnataka: [
    "Bengaluru Urban",
    "Bengaluru Rural",
    "Mysuru",
    "Mangaluru",
    "Hubballi-Dharwad",
    "Belagavi",
    "Kalaburagi",
    "Other",
  ],
  Maharashtra: [
    "Mumbai",
    "Pune",
    "Nagpur",
    "Thane",
    "Nashik",
    "Other",
  ],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Other"],
  Kerala: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Other"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Noida", "Varanasi", "Other"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Other"],
  Delhi: ["Central Delhi", "New Delhi", "South Delhi", "Other"],
};

export function districtsForState(state: string): string[] {
  const list = DISTRICTS[state];
  if (list?.length) return [...list];
  return ["Other"];
}
