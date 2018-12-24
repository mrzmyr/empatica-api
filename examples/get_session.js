const EmpticaApi = require('../');
const credentials = require('./credentials.json');

(async () => {

  let empticaApi = new EmpticaApi({
    username: credentials.username,
    password: credentials.password
  })

  await empticaApi.authenticate()
  const sessions = await empticaApi.getSessions()
  const eda = await empticaApi.getSession(sessions[0].id, 'eda')
  console.log(eda);
})()
