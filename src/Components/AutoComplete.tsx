import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Character } from '../types';

interface AutoCompleteProps {
  characters: Character[];
}

// Utility function to escape special characters in the search query
const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Debounce function to wait until user stops typing and then perform the search
const debounce = <T extends (...args: unknown[]) => void>(func: T, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

const AutoComplete: React.FC<AutoCompleteProps> = ({ characters }) => {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  }, []);

  const handleSelect = useCallback((character: Character) => {
    setSelectedCharacter(character);
    setSearch('');
    setSuggestions([]);
  }, []);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  // We wait 300 miliseconds after user stops typing, to show the results
  const debouncedFetchData = useCallback(
    debounce(async (query: any) => {
      if (query.length > 0) {
        const filteredCharacters = characters.filter(character =>
          character.name.toLowerCase().includes(query.toLowerCase())
        );
        setSuggestions(filteredCharacters);
      } else {
        setSuggestions([]);
      }
    }, 300),
    [characters]
  );

  // useEffect to call the debounced fetch data function
  useEffect(() => {
    debouncedFetchData(search);
  }, [search, debouncedFetchData]);

  const getHighlightedText = (text: string, highlight: string) => {
    const parts = text.split(new RegExp(`(${escapeRegExp(highlight)})`, 'gi'));
    return (
      <span>
        {parts.map((part, index) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={index} className="highlight">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <section className="container">
      <div className='title'>
        <h2>Zeynep assignment for Suntransfers</h2>
        <div className='title-underline'></div>
				
      </div>
      <div className="group" ref={dropdownRef}>
        <div className="form-control">
          <input
            type="text"
            className="form-input"
            value={search}
            onChange={handleChange}
            placeholder="Search characters"
          />
        </div>
        {suggestions.length > 0 && (
          <ul className="suggestions">
            {suggestions.map(character => (
              <li key={character.id} onClick={() => handleSelect(character)}>
                {getHighlightedText(character.name, search)}
              </li>
            ))}
          </ul>
        )}
      </div>
      {selectedCharacter && (
        <div className="selected-character">
          <p>Selected Character: {selectedCharacter.name}</p>
        </div>
      )}

		<p>Hello! In this search form, we are getting a paginated data from API and caching it (for performance purposes). We
			use useCallback and useEffect for memoization and preventing unnecessary re-renders.

			I tried to include as many scenarios as possible. In addition to regular http errors:

			- aborting in case of timeout.
			- fallback page with a refresh button
			- unexpected API response structure
			
		</p>
    </section>
  );
};

export default AutoComplete;