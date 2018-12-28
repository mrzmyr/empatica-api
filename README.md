# empatica-api

> Unofficial empatica node.js module to access web data

**Warning:** This module is under development, breaking changes should be expected

## Install

Install with [npm](https://www.npmjs.com/)

```sh
$ npm i empatica-api --save
```

## Usage

```js
const credentials = require('./credentials.json');

const EmpaticaApi = require('empatica-api');
const empticaApi = new EmpticaApi({
  username: credentials.username,
  password: credentials.password
})

await empticaApi.authenticate()
const sessions = await empticaApi.getSessions()
console.log(sessions[0]);
```

Check the [examples](examples) directory for more useful basics or use the [full documentation here](docs.md).

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/mrzmyr/empatica-api/issues)

## Author

**mrzmyr**

* [github/mrzmyr](https://github.com/mrzmyr)
* [twitter/mrzmyr](http://twitter.com/mrzmyr)

## License

Copyright © 2018 [mrzmyr](#mrzmyr)
Licensed under the MIT license.
