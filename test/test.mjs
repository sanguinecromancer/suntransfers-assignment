import { before, after, test } from 'node:test';
import assert from 'node:assert';
import API_URL from '../src/constants.js';

// ---------- API TEST ---------------
let response;
let data;

before(async () => {
  // Fetching data before tests run
  response = await fetch(API_URL);
  data = await response.json();
});

after(() => {
  // Clean up if needed after tests
  response = null;
  data = null;
});

// let's check if the status code is 200.
test('character API status code', async () => {
  assert.strictEqual(response.status, 200, 'Expected status code 200');
});

// let's ensure the results field is an array.
test('character API returns an array', async () => {
  assert.strictEqual(Array.isArray(data.results), true, 'Expected results to be an array');
});

// let's verify that the first character object has all the expected properties.
test('character API returns characters with expected properties', async () => {
  const firstCharacter = data.results[0];
  const expectedProperties = [
    'id', 'name', 'status', 'species', 'type', 'gender', 'origin', 
    'location', 'image', 'episode', 'url', 'created'
  ];
  expectedProperties.forEach(prop => {
    assert.strictEqual(Object.prototype.hasOwnProperty.call(firstCharacter, prop), true, `Expected property ${prop} to exist`);
  });
});