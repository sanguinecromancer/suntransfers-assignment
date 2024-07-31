import API_URL from "../constants";
import { Character } from "../types";

const loadAllCharacters = async (): Promise<Character[]> => {
  try {
    let allCharacters: Character[] = [];
    let url = API_URL;

    while (url) { // looping the url because of paginated response
      const res = await fetchWithTimeout(url, { timeout: 15000 });

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Resource not found (404)');
        } else if (res.status >= 500) {
          throw new Error('Server error, please try again later');
        } else {
          throw new Error(`Unexpected error: ${res.status}`);
        }
      }

      const data = await res.json();

      if (!data || !data.results || !Array.isArray(data.results)) {
        throw new Error('Unexpected API response structure');
      }

			// deep copy for immutability and preventing side-effects
      allCharacters = [...allCharacters, ...JSON.parse(JSON.stringify(data.results))];
      url = data.info.next; // next page URL
    }

    return allCharacters;
  } catch (error) {
    console.error('Failed to load characters:', error.message);
    return [];
  }
};

const fetchWithTimeout = async (url: string, options: { timeout: number }) => {
  const { timeout } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(url, {
    ...options,
    signal: controller.signal,
  });

  clearTimeout(id);

  return response;
};

export default loadAllCharacters;