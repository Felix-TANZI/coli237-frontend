// Marques de deux-roues et véhicules courantes au Cameroun.
export const MARQUES_MOTO = [
  "Sanili",
  "Nasco",
  "Kymco",
  "Sanya",
  "Haojue",
  "Boxer",
  "Royal",
  "Jincheng",
  "Skygo",
  "Honda",
  "Yamaha",
  "Suzuki",
  "Apsonic",
  "TVS",
  "Bajaj",
];

export const MARQUES_VOITURE = [
  "Toyota",
  "Nissan",
  "Hyundai",
  "Kia",
  "Mercedes",
  "Volkswagen",
  "Peugeot",
  "Renault",
  "Ford",
  "Mitsubishi",
  "Honda",
  "Suzuki",
];

// Principales villes du Cameroun.
export const VILLES_CAMEROUN = [
  "Yaoundé",
  "Douala",
  "Bafoussam",
  "Bamenda",
  "Buea",
  "Garoua",
  "Maroua",
  "Ngaoundéré",
  "Bertoua",
  "Ebolowa",
  "Kribi",
  "Limbé",
  "Édéa",
  "Kumba",
  "Nkongsamba",
  "Dschang",
  "Foumban",
];

// Quartiers par ville (les principaux ; l'agent peut toujours écrire librement).
export const QUARTIERS_PAR_VILLE: Record<string, string[]> = {
  Yaoundé: [
    "Mvog-Ada",
    "Bastos",
    "Mvan",
    "Biyem-Assi",
    "Nsam",
    "Mokolo",
    "Essos",
    "Nlongkak",
    "Emombo",
    "Mendong",
    "Etoudi",
    "Ekounou",
    "Nkolbisson",
    "Obili",
    "Mimboman",
  ],
  Douala: [
    "Akwa",
    "Bonabéri",
    "Bonanjo",
    "Deido",
    "New Bell",
    "Bépanda",
    "Makepe",
    "Bonamoussadi",
    "Ndokotti",
    "Logbaba",
    "PK",
    "Bali",
    "Yassa",
    "Village",
  ],
  Bafoussam: ["Tamdja", "Kamkop", "Djeleng", "Tougang", "Banengo"],
  Bamenda: ["Commercial Avenue", "Nkwen", "Mankon", "Up Station", "Old Town"],
  Buea: ["Molyko", "Great Soppo", "Bonduma", "Mile 17", "Muea"],
  Garoua: ["Poumpoumré", "Djamboutou", "Roumdé Adjia", "Kolléré"],
  Maroua: ["Domayo", "Djarengol", "Founangué", "Pitoaré"],
  Ngaoundéré: ["Baladji", "Dang", "Bamyanga", "Mbideng"],
};

// Renvoie les quartiers d'une ville (correspondance souple).
export function quartiersDe(ville: string): string[] {
  const v = ville.trim().toLowerCase();
  for (const [nom, quartiers] of Object.entries(QUARTIERS_PAR_VILLE)) {
    if (nom.toLowerCase() === v) return quartiers;
  }
  return [];
}
