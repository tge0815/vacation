// Statische Schul-Vokabeln (aus dem Vokabelheft der Kinder abgetippt).
// Werden über den Eltern-Bereich pro Kind ins Vokabelheft (Englisch) importiert
// und dann im Vokabel-Training als Wiederholung mit eingemischt.
// Abgefragt wird Deutsch → Englisch: prompt = Deutsch (wird gezeigt),
// answer = Englisch (wird eingetippt).

export type VocabPair = { en: string; de: string };
export type VocabUnit = { title: string; pairs: VocabPair[] };

export const ENGLISH_VOCAB: VocabUnit[] = [
  {
    title: "Heft-Seite 1 (Schule, Zwillinge)",
    pairs: [
      { en: "on Albert Street", de: "in der Albert Street" },
      { en: "and", de: "und" },
      { en: "are", de: "bist" },
      { en: "listen to", de: "zuhören, (an)hören" },
      { en: "read", de: "lesen" },
      { en: "too", de: "auch" },
      { en: "twin", de: "Zwilling" },
      { en: "boring", de: "langweilig" },
      { en: "football", de: "Fußball" },
      { en: "learn your sentences", de: "lerne deine Sätze" },
      { en: "talk to a partner like this", de: "sprich so mit einem Partner" },
      { en: "what about you", de: "was ist mit dir" },
      { en: "what's your favourite …?", de: "was ist dein Lieblings…?" },
      { en: "what's", de: "was ist" },
      { en: "that", de: "das" },
      { en: "cat", de: "Katze" },
      { en: "her", de: "ihr(e)" },
      { en: "you", de: "du" },
      { en: "dog", de: "Hund" },
      { en: "much better", de: "viel besser" },
      { en: "skateboarding", de: "Skateboard fahren" },
      { en: "great", de: "großartig, toll" },
      { en: "it's", de: "es ist" },
      { en: "school", de: "Schule" },
      { en: "what's the name of your school?", de: "wie heißt eure Schule?" },
      { en: "for", de: "für" },
      { en: "girl", de: "Mädchen" },
      { en: "we can go to school together", de: "wir können zusammen zur Schule gehen" },
      { en: "boy", de: "Junge" },
      { en: "with", de: "mit" },
      { en: "he's", de: "er ist" },
      { en: "right", de: "richtig" },
      { en: "example", de: "Beispiel" },
      { en: "in-line skating", de: "Inlineskating" },
      { en: "house", de: "Haus" },
      {
        en: "listen to Caroline and look at the pictures of three houses in Manchester",
        de: "hör Caroline zu und sieh dir die Bilder von drei Häusern in Manchester an",
      },
    ],
  },
  {
    title: "Heft-Seite 2 (What can you see/hear)",
    pairs: [
      { en: "what can you see", de: "was siehst du" },
      { en: "can", de: "können" },
      { en: "see", de: "sehen" },
      { en: "I", de: "ich" },
      { en: "eye", de: "Auge" },
      { en: "a / an", de: "ein(e)" },
      { en: "what can you hear", de: "was hörst du" },
      { en: "where is …? / where are …?", de: "wo ist …? / wo sind …?" },
      { en: "the", de: "der, die, das" },
      { en: "in the road", de: "auf der Straße" },
      { en: "in a car", de: "in einem Auto" },
      { en: "in his room", de: "in seinem Zimmer" },
      { en: "in front of the shop", de: "vor einem Geschäft" },
      { en: "play", de: "spielen" },
      {
        en: "I spy with my little eye something red",
        de: "ich sehe was, was du nicht siehst und das ist rot",
      },
      { en: "bus", de: "Bus" },
      { en: "yes", de: "ja" },
    ],
  },
  {
    title: "Heft-Seite 3 (Haus & Gefühle)",
    pairs: [
      { en: "big", de: "groß" },
      { en: "small", de: "klein" },
      { en: "new", de: "neu" },
      { en: "lamp", de: "Lampe" },
      { en: "door", de: "Tür" },
      { en: "book", de: "Buch" },
      { en: "garden", de: "Garten" },
      { en: "window", de: "Fenster" },
      { en: "upstairs", de: "(nach) oben" },
      { en: "downstairs", de: "(nach) unten" },
      { en: "dad", de: "Papa" },
      { en: "mum", de: "Mama" },
      { en: "thing", de: "Ding" },
      { en: "phone", de: "Handy" },
      { en: "shoe", de: "Schuh" },
      { en: "on", de: "auf, an" },
      { en: "pencil case", de: "Federmäppchen" },
      { en: "schoolbag", de: "Schultasche" },
      { en: "pencil", de: "Bleistift" },
      { en: "to write (down)", de: "(auf)schreiben" },
      { en: "about", de: "über, von" },
      { en: "to close", de: "schließen" },
      { en: "read out your sentences to your partner", de: "lest eure Sätze eurer Partnerin vor" },
      { en: "that's", de: "das ist" },
      { en: "it", de: "er, sie, es" },
      { en: "imagine you live in a new city", de: "stell dir vor, du lebst in einer neuen Stadt" },
      { en: "say how you feel", de: "sag, wie du dich fühlst" },
      { en: "say", de: "sagen" },
      { en: "because", de: "weil, da" },
      { en: "friend", de: "Freund/in" },
      { en: "not", de: "nicht" },
      { en: "here", de: "hier" },
      { en: "many", de: "viele" },
    ],
  },
];

// Flach als {prompt, answer}-Paare. Abgefragt wird Deutsch → Englisch:
// prompt = Deutsch (gezeigt), answer = Englisch (einzutippen).
export function englishVocabPairs(): { prompt: string; answer: string }[] {
  return ENGLISH_VOCAB.flatMap((u) => u.pairs.map((p) => ({ prompt: p.de, answer: p.en })));
}
