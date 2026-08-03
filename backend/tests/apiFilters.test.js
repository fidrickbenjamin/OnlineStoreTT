import test from 'node:test';
import assert from 'node:assert/strict';
import APIFilters from '../utils/apiFilters.js';

test('search matches product name, description, and numeric price terms', () => {
  const query = {
    find(criteria) {
      this.lastCriteria = criteria;
      return this;
    },
  };

  const filters = new APIFilters(query, { keyword: '500' });
  filters.search();

  assert.ok(query.lastCriteria.$or);
  assert.deepEqual(query.lastCriteria.$or[0], {
    name: { $regex: '500', $options: 'i' },
  });
  assert.deepEqual(query.lastCriteria.$or[1], {
    description: { $regex: '500', $options: 'i' },
  });
  assert.deepEqual(query.lastCriteria.$or[2], { price: 500 });
});
