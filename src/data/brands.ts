export interface BrandData {
  id: string;
  name: string;
  models: string[];
}

export const BRANDS: BrandData[] = [
  { id: "fiat", name: "Fiat", models: ["Mobi", "Argo", "Cronos", "Strada", "Toro", "Pulse", "Fastback", "Uno", "Palio", "Siena", "Punto"] },
  { id: "volkswagen", name: "Volkswagen", models: ["Gol", "Polo", "Virtus", "T-Cross", "Nivus", "Jetta", "Tiguan", "Amarok", "Saveiro", "Voyage", "Fox", "Up"] },
  { id: "chevrolet", name: "Chevrolet", models: ["Onix", "Onix Plus", "Tracker", "Montana", "Spin", "S10", "Cruze", "Cobalt", "Prisma", "Trailblazer"] },
  { id: "toyota", name: "Toyota", models: ["Corolla", "Corolla Cross", "Yaris", "Hilux", "SW4", "RAV4", "Etios", "Camry"] },
  { id: "hyundai", name: "Hyundai", models: ["HB20", "HB20S", "Creta", "Tucson", "i30", "Azera", "ix35"] },
  { id: "honda", name: "Honda", models: ["Civic", "Fit", "HR-V", "City", "CR-V", "WR-V", "Accord"] },
  { id: "renault", name: "Renault", models: ["Kwid", "Sandero", "Logan", "Duster", "Captur", "Stepway", "Oroch", "Kardian"] },
  { id: "ford", name: "Ford", models: ["Ka", "Ecosport", "Ranger", "Territory", "Bronco", "Maverick", "Fiesta", "Focus", "Fusion"] },
  { id: "nissan", name: "Nissan", models: ["Kicks", "Versa", "March", "Frontier", "Sentra", "Livina"] },
  { id: "jeep", name: "Jeep", models: ["Renegade", "Compass", "Commander", "Wrangler", "Cherokee"] },
  { id: "peugeot", name: "Peugeot", models: ["208", "2008", "3008", "308", "Partner", "408"] },
  { id: "citroen", name: "Citroën", models: ["C3", "C4 Cactus", "Aircross", "C4 Lounge"] },
  { id: "mitsubishi", name: "Mitsubishi", models: ["L200", "Pajero", "Outlander", "ASX", "Eclipse Cross"] },
  { id: "bmw", name: "BMW", models: ["Série 1", "Série 3", "Série 5", "X1", "X3", "X5", "X6"] },
  { id: "mercedes", name: "Mercedes-Benz", models: ["Classe A", "Classe B", "Classe C", "GLA", "GLC", "GLE"] },
  { id: "audi", name: "Audi", models: ["A3", "A4", "Q3", "Q5", "Q7"] },
  { id: "kia", name: "Kia", models: ["Picanto", "Cerato", "Sportage", "Sorento", "Stonic", "Soul"] },
  { id: "caoa_chery", name: "Caoa Chery", models: ["Tiggo 3x", "Tiggo 5x", "Tiggo 7", "Tiggo 8", "Arrizo 5", "Arrizo 6"] },
  { id: "byd", name: "BYD", models: ["Dolphin", "Yuan Plus", "Song Plus", "Seal", "King", "Han"] },
  { id: "volvo", name: "Volvo", models: ["XC40", "XC60", "XC90", "S60", "V60"] },
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
