![Build Status](https://travis-ci.org/xpepermint/objectschemajs.svg?branch=master)&nbsp;[![NPM Version](https://badge.fury.io/js/objectschema.svg)](https://badge.fury.io/js/objectschema)&nbsp;[![Dependency Status](https://gemnasium.com/xpepermint/objectschemajs.svg)](https://gemnasium.com/xpepermint/objectschemajs)

# objectschema.js

> Advanced schema enforced JavaScript objects.

This is a light weight open source package for use on **server or in browser**. The source code is available on [GitHub](https://github.com/xpepermint/objectschemajs) where you can also find our [issue tracker](https://github.com/xpepermint/objectschemajs/issues).

## Features

* Type casting
* Custom data types
* Field default value
* Field value transformation with getter and setter
* Strict and relaxed schemas
* Document nesting with support for self referencing
* Change tracking, data commits and rollbacks
* Advanced field validation

## Related Projects

* [Contextable.js](https://github.com/xpepermint/contextablejs): Simple, unopinionated and minimalist framework for creating context objects with support for unopinionated ORM, object schemas, type casting, validation and error handling and more.
* [Validatable.js](https://github.com/xpepermint/validatablejs): A library for synchronous and asynchronous validation.
* [Handleable.js](https://github.com/xpepermint/handleablejs): A library for synchronous and asynchronous error handling.
* [Typeable.js](https://github.com/xpepermint/typeablejs): A library for checking and casting types.

## Install

Run the command below to install the package.

```
$ npm install --save objectschema
```

## Example

```js
import {
  Document,
  Schema
} from 'objectschema';

let bookSchema = new Schema({
  fields: {
    title: {
      type: 'String',
      defaultValue: 'Lord of the flies',
      fakeValue: () => {
        return faker.lorem.sentence()
      }
    }
  }
});

let userSchema = new Schema({
  fields: {
    name: { // field name
      type: 'String', // field type
      validate: [
        {
          validator: 'presence',  // validator name
          message: 'is required' // validator error message
        }
      ]
    },
    books: {
      type: [bookSchema],
      validate: [
        {
          validator: 'presence',
          message: 'is required'
        }
      ]
    }
  }
});

let data = {
  name: 'John Smith',
  books: [
    {
      title: 'True Detective'
    }
  ]
};

let user = new Document(userSchema, data);
user.title // => True Detective
await user.validate({quiet: true});
user.isValid(); // -> false

// generate fake data
user.fake()
user.title // => lorem ipsum
user.reset() // use default value
user.title // => Lord of the flies
```

## API

This package consists of two core classes. The `Schema` class represents a configuration object and the `Document` represents a data object defined by the Schema. There is also the `Field` class which represents a document field.

This package also integrates [*typeable.js*](https://github.com/xpepermint/typeablejs) module for type casting and [*validatable.js*](https://github.com/xpepermint/validatablejs) for validating fields.

### Schema

Schema represents a configuration object which configures the `Document`. It holds information about fields, type casting, how fields are validated and what the default values are.

A Schema can also be used as a custom type object. This way you can create a nested data structure by setting a schema instance for a field `type`. When a document is created, each schema in a tree of fields will become an instance of a Document - a tree of documents.

**Schema({fakerRegistry, fields, strict, validatorOptions, typeOptions})**

> A class for defining document structure.

| Option | Type | Required | Default | Description
|--------|------|----------|---------|------------
| name   | String | No  | - | The name of the schema
| fakes  | Object,Function | No  | - | A registry of faker methods that can be used to for fake field data
| defaults  | Object,Function | No  | - | A registry of defaults methods that can be used for default data   
| fields | Object,Function | Yes | - | An object with fields definition. You should pass a function which returns the definition object in case of self referencing.
| strict | Boolean | No | true | A schema type (set to `false` to allow dynamic fields not defined in schema).
| validatorOptions | Object | No | validatable.js defaults | Configuration options for the `Validator` class, provided by the [validatable.js](https://github.com/xpepermint/validatablejs), which is used for field validation.
| typeOptions | Object | No | typeable.js defaults | Configuration options for the `cast` method provided by the [typeable.js](https://github.com/xpepermint/typeablejs), which is used for data type casting.
```js

// reusable fakes
const fakes = {
  // default faker functions if no key for schema name
  title: () => {
    return faker.lorem.sentence()
  },
  schemas: {
    book: { // used by book schema if present
      title: () => {
        return faker.book.title()
      },    
    }
  }
}

// reusable defaults
const defaults = {
  title: 'no title'
  // ... same as for fakes
}


new Schema({
  fakes, 
  defaults,
  fields: { // schema fields definition
    email: { // a field name holding a field definition
      type: 'String', // a field data type provided by typeable.js
      defaultValue: 'John Smith', // a default field value 
      validate: [ // field validations provided by validatable.js
        { // validator recipe
          validator: 'presence', // validator name
          message: 'is required' // validator error message
        }
      ]
    },
  },
  strict: true, // schema mode
  validatorOptions: {}, // validatable.js configuration options (see the package's page for details)
  typeOptions: {} // typeable.js configuration options (see the package's page for details)
});
```

This package uses [*typeable.js*](https://github.com/xpepermint/typeablejs) for data type casting. Many common data types and array types are supported, but we can also define custom types or override existing types through a `typeOptions` key. Please check package's website for a list of supported types and further information.

By default, all fields in a schema are set to `null`. We can set a default value for a field by setting the `defaultValue` option.

Validation is handled by the [*validatable.js*](https://github.com/xpepermint/validatablejs) package. We can configure the package by passing the `validatorOptions` option to our schema which will be passed directly to the `Validator` class. The package provides many built-in validators, allows adding custom validators and overriding existing ones. When a document is created all validator methods share document's context thus we can write context-aware checks. Please see package's website for details.

### Document

A document is a schema enforced data object. All document properties and configuration options are defined by the schema.

**Document(schema, data, parent)**

> A class for creating schema enforced objects.

| Option | Type | Required | Default | Description
|--------|------|----------|---------|------------
| schema | Schema | Yes | - | An instance of the Schema class.
| data | Object | No | - | Initial data object.
| parent | Document | No | - | Parent document instance (for nesting documents).

**Document.prototype.$parent**: Document

> Parent document instance.

**Document.prototype.$root**: Document

> The first document instance in a tree of documents.

**Document.prototype.$schema**: Schema

> Schema instance.

**Document.prototype.$validator**: Validator

> Validator instance, used for validating fields.

**Document.prototype.applyErrors(errors)**: Document

> Deeply populates fields with the provided `errors`.

```js
doc.applyErrors([
  {
    path: ['name'], // field path
    errors: [
      {
        name: 'ValidatorError', // error class name (ValidatorError or Error)
        validator: 'presence',  // validator name
        message: 'is required' // validator message
      }
    ]
  },
  {
    path: ['newBook', 'title'],
    errors: [
      {
        name: 'ValidatorError',
        validator: 'absence',
        message: 'must be blank'
      }
    ]
  },
  {
    path: ['newBooks', 1, 'title'],
    errors: [
      {
        name: 'ValidatorError',
        validator: 'presence',
        message: 'is required'
      }
    ]
  }
]);
```

**Document.prototype.clear()**: Document

> Sets all document fields to `null`.

**Document.prototype.clone()**: Document

> Returns a new Document instance which is the exact copy of the original.

**Document.prototype.collectErrors()**: Array

> Returns a list of errors for all the fields (e.g. [{path: ['name'], errors: [ValidatorError(), ...]}]).

**Document.prototype.commit()**: Document

> Sets initial value of each document field to the current value of a field. This is how field change tracking is restarted.

**Document.prototype.equals(value)**: Boolean

> Returns `true` when the provided `value` represents an object with the same fields as the document itself.

**Document.prototype.getPath(...keys)**: Field

> Returns a class instance of the field at path.

| Option | Type | Required | Default | Description
|--------|------|----------|---------|------------
| keys | Array | Yes | - | Path to a field (e.g. `['book', 0, 'title']`).

**Document.prototype.hasErrors()**: Boolean

> Returns `true` when no errors exist (inverse of `isValid()`). Make sure that you call the `validate()` method first.

**Document.prototype.hasPath(...keys)**: Boolean

> Returns `true` when a field path exists.

| Option | Type | Required | Default | Description
|--------|------|----------|---------|------------
| keys | Array | Yes | - | Path to a field (e.g. `['book', 0, 'title']`).

**Document.prototype.isChanged()**: Boolean

> Returns `true` if at least one document field has been changed.

**Document.prototype.isValid()**: Boolean

> Returns `true` when all document fields are valid (inverse of `hasErrors()`). Make sure that you call the `validate()` method first.

**Document.prototype.invalidate()**: Document

> Clears `errors` on all fields (the reverse of `validate()`).

**Document.prototype.populate(data)**: Document

> Applies data to a document.

| Option | Type | Required | Default | Description
|--------|------|----------|---------|------------
| data | Object | Yes | - | Data object.

**Document.prototype.reset()**: Document

> Sets each document field to its default value.

**Document.prototype.fake()**: Document

> Sets each document field to its fake value if a fake value generator is registered either on the field itself or in the fake registry of the schema (if not uses default value if present) 

**Document.prototype.rollback()**: Document

> Sets each document field to its initial value (last committed value). This is how you can discharge document changes.

**Document.prototype.toObject()**: Object

> Converts a document into serialized data object.

**Document.prototype.validate({quiet})**: Promise(Document)

> Validates document fields and throws a ValidationError error if not all fields are valid unless the `quiet` is set to `true`.

| Option | Type | Required | Default | Description
|--------|------|----------|---------|------------
| quiet | Boolean | No | false | When set to `true`, a ValidationError is thrown.

```js
try {
  await doc.validate(); // throws a ValidationError when fields are invalid
}
catch (e) {
  // `e` is an instance of ValidationError, which holds errors for all invalid fields (including those deeply nested)
}
```

### Field

When a document field is defined, another field with the same name but prefixed with the `$` sign is set. This special read-only field holds a reference to the actual field instance.

```js
let user = new Document(schema);
user.name = 'John'; // -> actual document field
user.$name; // -> reference to document field instance
user.$name.isChanged(); // -> calling field instance method
```

**Field(owner, name)**

> A field class which represents each field on a document.

| Option | Type | Required | Default | Description
|--------|------|----------|---------|------------
| owner | Document | Yes | - | An instance of a Document which owns the field.
| name | String | Yes | - | Field name

**Field.prototype.$owner**: Document

> A reference to a Document instance on which the field is defined.

**Field.prototype.name**: String

> Field name.

**Field.prototype.clear()**: Field

> Sets field and related sub fields to `null`.

**Field.prototype.commit()**: Field

> Sets initial value to the current value. This is how field change tracking is restarted.

**Field.prototype.defaultValue**: Any

> A getter which returns the default field value.

**Field.prototype.equals(value)**: Boolean

> Returns `true` when the provided `value` represents an object that looks the same.

**Field.prototype.hasErrors()**: Boolean

> Returns `true` when no errors exist (inverse of `isValid()`). Make sure that you call the `validate()` method first.

**Field.prototype.initialValue**: Any

> A getter which returns the initial field value (last committed value).

**Field.prototype.isChanged()**: Boolean

> Returns `true` if the field or at least one sub field have been changed.

**Field.prototype.isValid()**: Boolean

> Returns `true` if the field and all sub fields are valid (inverse of `hasErrors()`). Make sure that you call the `validate()` method first.

**Field.prototype.invalidate()**: Field

> Clears the `errors` field on all fields (the reverse of `validate()`).

**Field.prototype.reset()**: Field

> Sets the field to its default value.

**Field.prototype.fake()**: Field

> Sets the field to a fake value.

**Field.prototype.rollback()**: Field

> Sets the field to its initial value (last committed value). This is how you can discharge field's changes.

**Field.prototype.validate()**: Promise(Field)

> Validates the `value` and populates the `errors` property with errors.

**Field.prototype.value**: Any

> A getter and setter for the value of the field.

### SchemaMaster

The `schemaMaster` can be used to define global registries for:
- schemas
- fakes
- defaults 

When schemas can be registered, you gain the ability to build schemas from mixins, ie. reusable schema "fragments".
You can use this to extend schemas, such as for specializations (similar to models/classes)

Fakes and defaults registries can also be registered and will be available for all schemas registered on the `schemaMaster`. 

Note: Using the `schemaMaster` is fully optional. 

```js
import { schemaMaster } from 'objectschema'
import schemas from './schemas/base' 

const m = schemaMaster({
  name: 'master blaster',
  schemas,
  defaults: {
    age: 18
  },
  fakes: {
    country: 'UK'      
  }
})  

let personSchema = m.createSchema({
  name: 'Person',
  fields: () => ({
    name: {
      type: 'String'
      defaultValue: ''
    },
    age: {
      type: 'Integer'
    }
    country: {
      type: 'String',
      defaultValue: ''
    }
  })
});
```

When you generate field data for a document, the field will first try to use local `fakes` and `defaults` registries defined directly on the schema (if available).
Then the field will check to see if the schema is registered with a `schemaMaster`. If so, it will use the `schemaMaster` registries to 
create fake/default field data.

Also notice how we import an existing `schemas` registry which we use as the "base" for our schema master, so we can use them 
as building blocks using mixins

*Schema mixins*

With `schemaMaster` we gain the ability to use mixins with our schemas. We simply add a mixins property with a list of schemas 
to mixin. We can mixin either by schema reference or by name. By name requires that a schema of that exact name has already been registered.
We recommend registering schemas using class name "form" such as `AdminUser`.     

```js
let userSchema = m.createSchema({
  name: 'User',
  mixins: [personSchema],
  fields: {
    enabled: {
      type: 'Boolean'
    },
    tags: {
      type: ['String']
    },
    keywords: {
      type: []
    }
  }
});

let overrideSchema = m.createSchema({
  name: 'Override',
  mixins: ['User'],
  fields: {
    enabled: {
      type: 'String'
    }
  }
})
```

### ValidationError

**ValidationError(message, code)**

> A validation error class which is triggered by method `validate` when not all fields are valid.

| Option | Type | Required | Default | Description
|--------|------|----------|---------|------------
| paths | String[][] | No | [] | A list of all invalid document paths (e.g. [['friends', 1, 'name'], ...])
| message | String | No | Validation failed | General error message.
| code | Number | No | 422 | Error code.

### ValidatorError

**ValidatorError(validator, message, code)**

> A validator error class, provided by the `validatable.js`, which holds information about the validators which do not approve a value that has just been validated.

| Option | Type | Required | Default | Description
|--------|------|----------|---------|------------
| validator | String | Yes | - | Validator name.
| message | String | No | null | Validation error message.
| code | Integer | No | 422 | Error status code.

## License (MIT)

```
Copyright (c) 2016 Kristijan Sedlak <xpepermint@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
