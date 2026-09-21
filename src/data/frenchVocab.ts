// Statische Französisch-Vokabeln (aus der „Liste des mots" des Schulbuchs
// abgetippt: C'est parti! und Unité 1, Seiten 176–180).
// Werden über den Eltern-Bereich pro Kind ins Vokabelheft (Fach Französisch)
// importiert und dann im Vokabel-Training als Wiederholung mit eingemischt.
// Die Abfragerichtung ist NICHT fest: Das Training fragt mal Deutsch→Französisch,
// mal Französisch→Deutsch. Dubletten werden richtungsunabhängig erkannt.
//
// `ipa` ist die Lautschrift aus dem Buch (nur zur Anzeige, wird nicht abgefragt).
// `drill: false` markiert Einträge, die als Vokabel nichts taugen (z. B. die
// Artikel-Übersicht) — die stehen der Vollständigkeit halber drin, werden aber
// nicht ins Vokabelheft importiert.

export type FrenchVocabEntry = {
  fr: string;
  de: string;
  ipa?: string;
  note?: string;
  drill?: false;
};
export type FrenchVocabUnit = { title: string; entries: FrenchVocabEntry[] };

export const FRENCH_VOCAB: FrenchVocabUnit[] = [
  {
    title: "C'est parti! — Tu t'appelles comment?",
    entries: [
      { fr: "C'est parti!", de: "Los geht's!", ipa: "sepaʀti", note: "fam." },
      { fr: "Salut!", de: "Hallo!", ipa: "saly", note: "fam.; auch: Tschüss!" },
      { fr: "Tu t'appelles comment?", de: "Wie heißt du?", ipa: "tytapɛlkɔmɑ̃" },
      { fr: "je m'appelle", de: "ich heiße", ipa: "ʒəmapɛl", note: "+ Name" },
      { fr: "Et toi?", de: "Und du?", ipa: "etwa" },
      { fr: "et", de: "und", ipa: "e" },
      { fr: "toi", de: "du", ipa: "twa" },
      { fr: "À plus!", de: "Bis später!", ipa: "aplys", note: "fam." },
    ],
  },
  {
    title: "C'est parti! — Ça va?",
    entries: [
      { fr: "Ça va?", de: "Wie geht's?", ipa: "sava", note: "auch: Geht's dir gut?" },
      { fr: "bof", de: "na ja, es geht so", ipa: "bɔf", note: "fam." },
      { fr: "Ça va.", de: "Es geht mir gut.", ipa: "sava" },
      { fr: "super", de: "super, toll", ipa: "sypɛʀ", note: "adj. inv. fam." },
      { fr: "ah", de: "ach, ach so", ipa: "a" },
      { fr: "Ça sonne!", de: "Es klingelt!", ipa: "sasɔn" },
    ],
  },
  {
    title: "C'est parti! — Begrüßen und verabschieden",
    entries: [
      { fr: "Bonjour!", de: "Guten Tag!", ipa: "bɔ̃ʒuʀ", note: "auch: Guten Morgen!" },
      { fr: "Au revoir!", de: "Auf Wiedersehen!", ipa: "oʀəvwaʀ" },
      { fr: "À demain!", de: "Bis morgen!", ipa: "adəmɛ̃" },
      { fr: "la classe", de: "die Klasse", ipa: "laklas" },
      { fr: "Madame", de: "Frau", ipa: "madam", note: "Anrede; Abk. Mme" },
      { fr: "Monsieur", de: "Herr", ipa: "məsjø", note: "Anrede; Abk. M." },
    ],
  },
  {
    title: "C'est parti! — Tu as quel âge?",
    entries: [
      { fr: "Tu as quel âge?", de: "Wie alt bist du?", ipa: "tyakɛlɑʒ" },
      { fr: "j'ai ... ans", de: "ich bin ... Jahre alt", ipa: "ʒɛ ... ɑ̃" },
    ],
  },
  {
    title: "C'est parti! — Die Zahlen 0 bis 20",
    entries: [
      { fr: "zéro", de: "null", ipa: "zeʀo" },
      { fr: "un", de: "eins", ipa: "ɛ̃" },
      { fr: "deux", de: "zwei", ipa: "dø" },
      { fr: "trois", de: "drei", ipa: "tʀwa" },
      { fr: "quatre", de: "vier", ipa: "katʀ" },
      { fr: "cinq", de: "fünf", ipa: "sɛ̃k" },
      { fr: "six", de: "sechs", ipa: "sis" },
      { fr: "sept", de: "sieben", ipa: "sɛt" },
      { fr: "huit", de: "acht", ipa: "ɥit" },
      { fr: "neuf", de: "neun", ipa: "nœf" },
      { fr: "dix", de: "zehn", ipa: "dis" },
      { fr: "onze", de: "elf", ipa: "ɔ̃z" },
      { fr: "douze", de: "zwölf", ipa: "duz" },
      { fr: "treize", de: "dreizehn", ipa: "tʀɛz" },
      { fr: "quatorze", de: "vierzehn", ipa: "katɔʀz" },
      { fr: "quinze", de: "fünfzehn", ipa: "kɛ̃z" },
      { fr: "seize", de: "sechzehn", ipa: "sɛz" },
      { fr: "dix-sept", de: "siebzehn", ipa: "disɛt" },
      { fr: "dix-huit", de: "achtzehn", ipa: "dizɥit" },
      { fr: "dix-neuf", de: "neunzehn", ipa: "diznœf" },
      { fr: "vingt", de: "zwanzig", ipa: "vɛ̃" },
    ],
  },
  {
    title: "C'est parti! — Tu habites où?",
    entries: [
      { fr: "Tu habites où?", de: "Wo wohnst du?", ipa: "tyabitu" },
      { fr: "j'habite", de: "ich wohne", ipa: "ʒabit" },
      { fr: "en", de: "in", ipa: "ɑ̃", note: "vor Ländernamen: en France" },
      { fr: "à", de: "in", ipa: "a", note: "vor Städtenamen: à Paris" },
      { fr: "l'Allemagne", de: "Deutschland", ipa: "lalmaɲ", note: "f." },
      { fr: "la France", de: "Frankreich", ipa: "lafʀɑ̃s" },
      { fr: "Paris", de: "Paris", ipa: "paʀi", note: "Hauptstadt Frankreichs" },
    ],
  },
  {
    title: "C'est parti! — J'aime les jeux vidéo et le chocolat!",
    entries: [
      { fr: "moi", de: "ich", ipa: "mwa", note: "betonte Form des Personalpronomens" },
      { fr: "j'aime", de: "ich mag", ipa: "ʒɛm" },
      { fr: "je n'aime pas", de: "ich mag ... nicht", ipa: "ʒənɛmpa" },
      { fr: "mais", de: "aber", ipa: "mɛ" },
      { fr: "les jeux vidéo", de: "die Videospiele", ipa: "leʒøvideo", note: "m. pl." },
      { fr: "le shopping", de: "das Einkaufen, das Shoppen", ipa: "ləʃɔpiŋ" },
      { fr: "le sport", de: "der Sport", ipa: "ləspɔʀ" },
      { fr: "la musique", de: "die Musik", ipa: "lamyzik" },
      { fr: "la nature", de: "die Natur", ipa: "lanatyʀ" },
      { fr: "le chocolat", de: "die Schokolade", ipa: "ləʃɔkɔla" },
      { fr: "les spaghettis", de: "die Spaghetti", ipa: "lespageti", note: "m. pl." },
      { fr: "la pizza", de: "die Pizza", ipa: "lapidza" },
      { fr: "les tomates", de: "die Tomaten", ipa: "letɔmat", note: "f. pl." },
      { fr: "la salade", de: "der Salat", ipa: "lasalad" },
    ],
  },
  {
    title: "C'est parti! — Farben",
    entries: [
      { fr: "le jaune", de: "Gelb", ipa: "ləʒon" },
      { fr: "le rouge", de: "Rot", ipa: "ləʀuʒ" },
      { fr: "le bleu", de: "Blau", ipa: "ləblø" },
      { fr: "le vert", de: "Grün", ipa: "ləvɛʀ" },
      { fr: "le noir", de: "Schwarz", ipa: "lənwaʀ" },
    ],
  },
  {
    title: "C'est parti! — Tiere",
    entries: [
      { fr: "les chats", de: "die Katzen", ipa: "leʃa", note: "m. pl." },
      { fr: "les chiens", de: "die Hunde", ipa: "leʃjɛ̃", note: "m. pl." },
      { fr: "les rats", de: "die Ratten", ipa: "leʀa", note: "m. pl." },
      { fr: "les poissons", de: "die Fische", ipa: "lepwasɔ̃", note: "m. pl." },
      { fr: "les tortues", de: "die Schildkröten", ipa: "letɔʀty", note: "f. pl." },
    ],
  },
  {
    title: "C'est parti! — Tu aimes les tomates?",
    entries: [
      { fr: "Tu aimes ...?", de: "Magst du ...?", ipa: "tyɛm" },
      { fr: "oui", de: "ja", ipa: "wi", note: "adv." },
      { fr: "non", de: "nein", ipa: "nɔ̃", note: "adv." },
      { fr: "ou", de: "oder", ipa: "u" },
    ],
  },
  {
    title: "Unité 1 — Bienvenue à Paris",
    entries: [
      { fr: "Bienvenue!", de: "Willkommen!", ipa: "bjɛ̃vəny" },
      { fr: "la Tour Eiffel", de: "der Eiffelturm", ipa: "latuʀɛfɛl", note: "Wahrzeichen von Paris" },
      { fr: "le Louvre", de: "das Louvre", ipa: "ləluvʀ", note: "Kunstmuseum in Paris" },
      { fr: "la Villette", de: "die Villette", ipa: "lavilɛt", note: "Park im Norden von Paris" },
      { fr: "le Sacré-Cœur", de: "Sacré-Cœur", ipa: "ləsakʀekœʀ", note: "Wallfahrtskirche auf dem Montmartre" },
    ],
  },
  {
    title: "Unité 1 — Vocabulaire thématique: la ville",
    entries: [
      { fr: "la ville", de: "die Stadt", ipa: "lavil" },
      { fr: "le cinéma", de: "das Kino", ipa: "ləsinema" },
      { fr: "le parc", de: "der Park", ipa: "ləpaʀk" },
      { fr: "le théâtre", de: "das Theater", ipa: "ləteatʀ" },
      { fr: "le café", de: "das Café", ipa: "ləkafe", note: "auch: der Kaffee" },
      { fr: "le restaurant", de: "das Restaurant", ipa: "ləʀɛstɔʀɑ̃" },
      { fr: "l'hôtel", de: "das Hotel", ipa: "lotɛl", note: "m." },
      { fr: "le musée", de: "das Museum", ipa: "ləmyze" },
      { fr: "le métro", de: "die U-Bahn", ipa: "ləmetʀo", note: "auch: die Metro" },
      { fr: "la tour", de: "der Turm", ipa: "latuʀ" },
      { fr: "le supermarché", de: "der Supermarkt", ipa: "ləsypɛʀmaʀʃe" },
      { fr: "le collège", de: "die Schule", ipa: "ləkɔlɛʒ", note: "in Frankreich: 6. bis 9. Klasse" },
      { fr: "le stade", de: "das Stadion", ipa: "ləstad" },
      { fr: "pardon", de: "Verzeihung, Entschuldigung", ipa: "paʀdɔ̃" },
      { fr: "Où est ...?", de: "Wo ist ...?", ipa: "uɛ" },
      { fr: "Où ...?", de: "Wo ...?, Wohin ...?", ipa: "u", note: "Fragewort" },
      { fr: "c'est", de: "das ist", ipa: "sɛ" },
      { fr: "là", de: "da, hier", ipa: "la", note: "adv." },
      { fr: "merci", de: "danke", ipa: "mɛʀsi" },
    ],
  },
  {
    title: "Unité 1, Volet 1 — Sich und andere vorstellen",
    entries: [
      { fr: "ce sont", de: "das sind", ipa: "səsɔ̃" },
      { fr: "C'est qui?", de: "Wer ist das?", ipa: "sɛki" },
      { fr: "moi, c'est", de: "ich heiße", ipa: "mwasɛ", note: "+ Name; wörtlich: Name + „das bin ich\"" },
      { fr: "Comment ...?", de: "Wie ...?", ipa: "kɔmɑ̃", note: "Fragewort" },
      { fr: "voilà", de: "hier ist, hier sind", ipa: "vwala" },
      { fr: "la fille", de: "das Mädchen", ipa: "lafij" },
      { fr: "le garçon", de: "der Junge", ipa: "ləgaʀsɔ̃" },
      { fr: "l'ami", de: "der Freund", ipa: "lami", note: "m." },
      { fr: "l'amie", de: "die Freundin", ipa: "lami", note: "f." },
      { fr: "de", de: "von", ipa: "də" },
      { fr: "mon ami", de: "mein Freund", ipa: "mɔ̃nami" },
      { fr: "mon amie", de: "meine Freundin", ipa: "mɔ̃nami" },
      { fr: "il s'appelle", de: "er heißt", ipa: "ilsapɛl" },
      { fr: "elle s'appelle", de: "sie heißt", ipa: "ɛlsapɛl" },
      { fr: "le/la/l'", de: "bestimmte Artikel im Singular", drill: false },
      { fr: "les", de: "bestimmter Artikel im Plural", ipa: "le", drill: false },
    ],
  },
  {
    title: "Unité 1, Volet 1 — weitere Wörter",
    entries: [
      { fr: "avec", de: "mit", ipa: "avɛk" },
      { fr: "d'accord", de: "einverstanden, okay", ipa: "dakɔʀ" },
      { fr: "Je ne sais pas.", de: "Ich weiß es nicht.", ipa: "ʒənəsɛpa" },
      { fr: "ici", de: "hier", ipa: "isi", note: "adv." },
      { fr: "depuis", de: "seit, seitdem", ipa: "dəpɥi", note: "adv." },
      { fr: "samedi", de: "Samstag, am Samstag", ipa: "samdi" },
    ],
  },
];

// Flach als {prompt, answer}-Paare. Abgefragt wird Deutsch → Französisch:
// prompt = Deutsch (gezeigt), answer = Französisch (einzutippen).
// Einträge mit drill:false (Artikel-Übersichten) bleiben außen vor.
export function frenchVocabPairs(): { prompt: string; answer: string }[] {
  return FRENCH_VOCAB.flatMap((u) =>
    u.entries.filter((e) => e.drill !== false).map((e) => ({ prompt: e.de, answer: e.fr })),
  );
}
