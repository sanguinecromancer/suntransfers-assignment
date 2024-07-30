import { useEffect, useState, lazy, Suspense } from 'react';
import loadAllCharacters from './api/api';
import { Character } from './types';
import Loading from './Components/Loading';

const AutoComplete = lazy(() => import('./Components/AutoComplete'));

const App = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const allCharacters = await loadAllCharacters();
        setCharacters(allCharacters);
      } catch (error) {
        setError('Failed to load characters');
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, [refreshKey]);

  // let's trigger a refresh with a refresh key, if button is clicked
  const handleRefresh = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  if (loading) {
    return (
      <main aria-busy="true">
        <Loading />
      </main>
    );
  }

  // displaying a refresh button if character cache is empty
  if (error || !characters || characters.length === 0) {
    return (
      <main>
        <div className='title'>
          <h2>No Characters Available</h2>
          <button className='btn' onClick={handleRefresh}>
            refresh
          </button>
        </div>
      </main>
    );
  }

  // wrapping AutoComplete component in React Suspense for lazy loading
  return (
    <main>
      <Suspense fallback={<Loading />}>
        <AutoComplete characters={characters} />
      </Suspense>
    </main>
  );
}

export default App;
