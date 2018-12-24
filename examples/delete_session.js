const EmpticaApi = require('../');
const credentials = require('./credentials.json');

(async () => {

  let empticaApi = new EmpticaApi({
    username: credentials.username,
    password: credentials.password
  })

  await empticaApi.authenticate()
  const eda = await empticaApi.deleteSession(592748)
})()
