const EmpticaApi = require('../');
const credentials = require('./credentials.json');
const fs = require('fs');

(async () => {

  let empticaApi = new EmpticaApi({
    username: credentials.username,
    password: credentials.password
  })

  const { userId } await empticaApi.authenticate()
  const sessions = await empticaApi.getSessions(userId)
  const data = await empticaApi.downloadSession(sessions[0], './session.zip')
  fs.writeFileSync('./session.zip', data, 'binary')

})()
