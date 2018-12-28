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
const EmpaticaApi = require('empatica-api');
const empticaApi = new EmpticaApi({
  username: 'your_empatica_email@example.com'
  password: 'your_empatica_password'
})

const { userId } = await empticaApi.authenticate()
const sessions = await empticaApi.getSessions(userId)
console.log(sessions[0]);
// { id: '578634', start_time: '1541950248', duration: '70847', device_id: 'c004bc', label: '2588', device: 'E4 2.2', status: '0', exit_code: '0' }
```

Check the [examples](examples) directory for more useful basics or use the [full documentation here](docs.md).

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/mrzmyr/empatica-api/issues)

## License

Licensed under the MIT license.
