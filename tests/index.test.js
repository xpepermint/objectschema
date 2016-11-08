import test from 'ava';
import * as objectschema from '../dist';

test('exposed content', (t) => {
  t.is(!!objectschema.Schema, true);
  t.is(!!objectschema.Document, true);
  t.is(!!objectschema.ValidatorError, true);
  t.is(!!objectschema.ValidationError, true);
});
