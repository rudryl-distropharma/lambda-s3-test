// Common medication suffixes (English and French)
const MEDICATION_SUFFIXES = [
  // English suffixes
  "ine",
  "ol",
  "il",
  "ate",
  "ide",
  "one",
  "ene",
  "ium",
  "cin",
  "mab",
  "nib",
  "zole",
  "pril",
  "sartan",
  "dine",
  "pam",
  "lam",
  "cillin",
  "mycin",
  "cycline",
  "azole",
  "vastatin",
  "oxacin",
  "micin",
  "rubicin",
  "trexate",
  "tidine",
  "dronate",
  "profen",
  "dipine",
  "afil",
  "azosin",
  "azepam",
  "lukast",
  "nacin",
  "parin",
  "phylline",
  "statin",
  "semide",
  "zosin",
  "fenac",
  "tidine",
  "triptyline",
  "zepam",
  "aline",

  // French suffixes
  "ase",
  "eur",
  "ique",
  "ine",
  "ole",
  "one",
  "ique",
  "ase",
  "ium",
  "cine",
  "yle",
  "zone",
  "alan",
  "rase",
  "mide",
  "pril",
  "pine",
  "tane",
  "cil",
];

// Common medication prefixes (English and French)
const MEDICATION_PREFIXES = [
  // English prefixes
  "cef",
  "ceph",
  "amox",
  "amp",
  "cipro",
  "doxy",
  "erythro",
  "fluoro",
  "met",
  "pred",
  "pro",
  "sul",
  "tetra",
  "vanco",
  "zithro",
  "acet",
  "adren",
  "ami",
  "ampi",
  "ator",
  "benz",
  "bisopro",
  "chlor",
  "clari",
  "dex",
  "diaz",
  "diclo",
  "dil",
  "dox",
  "eso",
  "fexo",
  "fluco",
  "fluox",
  "furo",
  "hydro",
  "ibu",
  "levo",
  "lora",
  "meto",
  "napro",
  "nife",
  "nitro",
  "omep",
  "ondan",
  "para",
  "phen",
  "pred",
  "rosu",
  "simva",
  "tra",
  "val",
  "vera",
  "warfa",

  // French prefixes
  "aci",
  "adré",
  "amio",
  "amo",
  "béta",
  "cali",
  "carb",
  "céf",
  "chlor",
  "clar",
  "clind",
  "déno",
  "dés",
  "dex",
  "diaz",
  "digo",
  "dilt",
  "dompé",
  "flucon",
  "genta",
  "ibupro",
  "indo",
  "kéto",
  "lido",
  "méto",
  "midi",
  "nifé",
  "nitro",
  "olan",
  "oxy",
  "panto",
  "para",
  "pravastat",
  "pred",
  "rami",
  "rosu",
  "salbuta",
  "sertra",
  "sildé",
  "simva",
  "tamo",
  "tramad",
  "valsar",
  "venlaf",
  "zopi",
];

// Common medication terms (English and French)
const MEDICATION_TERMS = [
  // English terms
  "tablet",
  "capsule",
  "injection",
  "solution",
  "suspension",
  "cream",
  "ointment",
  "gel",
  "drops",
  "spray",
  "powder",
  "syrup",
  "elixir",
  "patch",
  "inhaler",
  "lotion",
  "suppository",
  "lozenge",
  "implant",
  "foam",
  "plaster",
  "disc",
  "kit",
  "pen",
  "device",
  "system",
  "medicated",
  "controlled-release",
  "extended-release",
  "immediate-release",
  "long-acting",
  "sustained-release",
  "oral",
  "topical",
  "ophthalmic",
  "otic",
  "nasal",
  "rectal",
  "vaginal",
  "inhalation",
  "buccal",
  "sublingual",
  "transdermal",
  "parenteral",

  // French terms
  "comprimé",
  "gélule",
  "injection",
  "solution",
  "suspension",
  "crème",
  "pommade",
  "gel",
  "gouttes",
  "spray",
  "poudre",
  "sirop",
  "élixir",
  "patch",
  "inhalateur",
  "lotion",
  "suppositoire",
  "pastille",
  "implant",
  "mousse",
  "emplâtre",
  "disque",
  "kit",
  "stylo",
  "dispositif",
  "système",
  "médicamenté",
  "libération contrôlée",
  "libération prolongée",
  "libération immédiate",
  "longue durée d'action",
  "libération soutenue",
  "oral",
  "topique",
  "ophtalmique",
  "otique",
  "nasal",
  "rectal",
  "vaginal",
  "inhalation",
  "buccal",
  "sublingual",
  "transdermique",
  "parentéral",
];

// Common medication strength units (English and French)
const STRENGTH_UNITS = [
  // English units
  "mg",
  "g",
  "ml",
  "mcg",
  "iu",
  "units",
  "percent",
  "%",
  "w/v",
  "w/w",
  "microgram",
  "milligram",
  "gram",
  "international unit",
  "unit",
  "milliliter",
  "mg/ml",
  "mcg/ml",
  "g/ml",
  "mg/g",
  "mcg/g",
  "iu/ml",
  "units/ml",

  // French units
  "mg",
  "g",
  "ml",
  "mcg",
  "ui",
  "unités",
  "pour cent",
  "%",
  "p/v",
  "p/p",
  "microgramme",
  "milligramme",
  "gramme",
  "unité internationale",
  "unité",
  "millilitre",
  "mg/ml",
  "mcg/ml",
  "g/ml",
  "mg/g",
  "mcg/g",
  "ui/ml",
  "unités/ml",
];

export function isMedicationName(value: string): boolean {
  if (!value || typeof value !== "string") return false;

  const normalizedValue = value.toLowerCase().trim();

  // Check if it contains any medication suffixes
  const hasSuffix = MEDICATION_SUFFIXES.some((suffix) =>
    normalizedValue.endsWith(suffix)
  );

  // Check if it starts with any medication prefixes
  const hasPrefix = MEDICATION_PREFIXES.some((prefix) =>
    normalizedValue.startsWith(prefix)
  );

  // Check if it contains any medication terms
  const hasMedTerm = MEDICATION_TERMS.some((term) =>
    normalizedValue.includes(term)
  );

  // Check if it contains strength units
  const hasStrengthUnit = STRENGTH_UNITS.some((unit) =>
    normalizedValue.includes(unit)
  );

  // Check for common medication patterns
  const hasMedPattern =
    /^[a-zA-Z]+(?:[-\s][a-zA-Z]+)*\s*(?:\d+(?:\.\d+)?\s*(?:mg|g|ml|mcg|iu|%))?$/i.test(
      normalizedValue
    );

  // Return true if it matches multiple criteria
  return (
    (hasSuffix && hasPrefix) ||
    (hasSuffix && hasMedTerm) ||
    (hasPrefix && hasMedTerm) ||
    (hasMedPattern && (hasSuffix || hasPrefix)) ||
    hasStrengthUnit ||
    (hasStrengthUnit && (hasSuffix || hasPrefix || hasMedTerm))
  );
}

export function findMedicationColumn(rows: string[][]): number {
  if (!rows || rows.length < 2 || !rows[0].length) return -1;

  const numColumns = rows[0].length;
  const columnScores = new Array(numColumns).fill(0);

  // Skip header row and analyze each column
  for (let col = 0; col < numColumns; col++) {
    let medicationCount = 0;
    let totalValues = 0;

    for (let row = 1; row < rows.length; row++) {
      const value = rows[row][col];
      if (value && typeof value === "string") {
        totalValues++;
        if (isMedicationName(value)) {
          medicationCount++;
        }
      }
    }

    // Calculate score based on percentage of medication names
    if (totalValues > 0) {
      columnScores[col] = medicationCount / totalValues;
    }
  }

  // Find column with highest score
  const maxScore = Math.max(...columnScores);
  const medicationColumn = columnScores.indexOf(maxScore);

  // Return -1 if no column has a significant number of medication names
  return maxScore > 0.3 ? medicationColumn : -1;
}
