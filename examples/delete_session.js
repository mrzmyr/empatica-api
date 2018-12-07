const EmpticaApi = require('../');
const credentials = require('./credentials.json');
const moment = require('moment');

(async () => {

  let empticaApi = new EmpticaApi({
    username: credentials.username,
    password: credentials.password
  })

  await empticaApi.authenticate()
  const eda = await empticaApi.deleteSession(592748)
  
})()