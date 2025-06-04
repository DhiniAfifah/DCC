import axios from "axios";

export type Language = { label: string; value: string };
export const fetchLanguages = async (): Promise<Language[]> => {
  let allLanguages: Language[] = [];
  let start = 0;
  const limit = 100;
  let hasMore = true;

  while (hasMore) {
    try {
      const response = await axios.get(
        "https://public.opendatasoft.com/api/records/1.0/search/",
        {
          params: {
            dataset: "iso-language-codes-639-1-and-639-2",
            rows: limit,
            start,
          },
        }
      );

      const languages = response.data.records.map((rec: any) => ({
        label: rec.fields.english,
        value: rec.fields.alpha2,
      }));

      allLanguages = [
        ...allLanguages,
        ...languages.filter((c: Language) => c.label && c.value),
      ];

      start += limit;
      hasMore = response.data.records.length === limit;
    } catch (error) {
      console.error("Error fetching languages:", error);
      return allLanguages.sort((a, b) => a.label.localeCompare(b.label));
    }
  }

  return allLanguages.sort((a, b) => a.label.localeCompare(b.label));
};