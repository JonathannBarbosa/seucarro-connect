export interface BrandData {
  id: string;
  name: string;
  models: string[];
}

export const BRANDS: BrandData[] = [
  { id: "audi", name: "Audi", models: ["A3", "A4", "A5", "Q3", "Q4 e-tron", "Q5", "Q6 e-tron", "Q7", "Q8"] },
  { id: "bmw", name: "BMW", models: ["Série 3", "Série 5", "X1", "X3", "X5", "X6", "X7", "iX1", "iX3", "i4", "iX"] },
  { id: "byd", name: "BYD", models: ["Dolphin Mini", "Dolphin GS", "Dolphin Plus", "Yuan Pro", "Yuan Plus", "Song Plus", "Seal", "Han", "King", "Shark"] },
  { id: "caoa_chery", name: "Caoa Chery", models: ["Tiggo 3x", "Tiggo 5x", "Tiggo 7", "Tiggo 8", "Arrizo 5", "Arrizo 6"] },
  { id: "chevrolet", name: "Chevrolet", models: ["Onix", "Onix Plus", "Tracker", "Montana", "Spin", "S10", "Trailblazer", "Equinox", "Blazer EV"] },
  { id: "citroen", name: "Citroën", models: ["C3", "Aircross", "Basalt"] },
  { id: "fiat", name: "Fiat", models: ["Mobi", "Argo", "Cronos", "Pulse", "Fastback", "Strada", "Toro", "Titano"] },
  { id: "ford", name: "Ford", models: ["Ranger", "Territory", "Bronco Sport", "Maverick", "Mustang"] },
  { id: "gwm", name: "GWM", models: ["Haval H6", "Haval H6 GT", "Haval Jolion", "Ora 03", "Tank 300"] },
  { id: "honda", name: "Honda", models: ["Civic", "City", "HR-V", "ZR-V", "CR-V"] },
  { id: "hyundai", name: "Hyundai", models: ["HB20", "HB20S", "Creta", "Kona", "Tucson", "Santa Fe"] },
  { id: "jeep", name: "Jeep", models: ["Avenger", "Renegade", "Compass", "Commander", "Wrangler", "Gladiator", "Grand Cherokee"] },
  { id: "kia", name: "Kia", models: ["Picanto", "Stonic", "Seltos", "Sportage", "Sorento", "Niro", "K4", "EV6", "EV9", "Tasman"] },
  { id: "mercedes", name: "Mercedes-Benz", models: ["Classe A", "CLA", "Classe C", "GLA", "GLB", "GLC", "GLE", "GLS", "Classe G", "EQE", "EQS"] },
  { id: "mitsubishi", name: "Mitsubishi", models: ["Triton", "Eclipse Cross", "Outlander PHEV"] },
  { id: "nissan", name: "Nissan", models: ["Kicks", "Versa", "Sentra", "Frontier"] },
  { id: "peugeot", name: "Peugeot", models: ["208", "2008", "3008", "5008", "Partner"] },
  { id: "ram", name: "RAM", models: ["Rampage", "1500", "2500", "3000"] },
  { id: "renault", name: "Renault", models: ["Kwid", "Kardian", "Duster", "Oroch", "Boreal", "Megane E-Tech"] },
  { id: "toyota", name: "Toyota", models: ["Corolla", "Corolla Cross", "Yaris Cross", "Hilux", "SW4", "RAV4", "GR Yaris", "Camry", "bZ4X"] },
  { id: "volkswagen", name: "Volkswagen", models: ["Polo", "Virtus", "Nivus", "T-Cross", "Tera", "Taos", "Tiguan", "Jetta", "Amarok", "Saveiro"] },
  { id: "volvo", name: "Volvo", models: ["EX30", "EX40", "EC40", "XC60", "XC90", "EX90"] },
  { id: "outra", name: "Outra marca", models: [] },
];

export const COMMON_COLORS = [
  { id: "branco", name: "Branco", hex: "#FFFFFF" },
  { id: "preto", name: "Preto", hex: "#000000" },
  { id: "prata", name: "Prata", hex: "#C0C0C0" },
  { id: "cinza", name: "Cinza", hex: "#6B7280" },
  { id: "vermelho", name: "Vermelho", hex: "#DC2626" },
  { id: "azul", name: "Azul", hex: "#1D4ED8" },
  { id: "verde", name: "Verde", hex: "#16A34A" },
  { id: "amarelo", name: "Amarelo", hex: "#FACC15" },
  { id: "marrom", name: "Marrom", hex: "#78350F" },
  { id: "bege", name: "Bege", hex: "#D4C5A9" },
];
