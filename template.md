# <%= name %>

> <%= description %>

## Install

Install with [npm](https://www.npmjs.com/)

```sh
$ npm i <%= name %> --save
```

## Usage

```js
const credentials = require('./credentials.json');

const EmpaticaApi = require('<%= name %>');
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
Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](<%= bugs.url %>)

## Author

**<%= author.name %>**

+ [github/mrzmyr](https://github.com/mrzmyr)
+ [twitter/mrzmyr](http://twitter.com/mrzmyr)

## License
Copyright © <%= year() %> [<%= author.name %>](<%= author.url %>)
Licensed under the <%= license || licenses.join(', ') %> license.
