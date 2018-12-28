const EmpticaApi = require('../');
const credentials = require('./credentials.json');

(async () => {

  let empticaApi = new EmpticaApi({
    username: credentials.username,
    password: credentials.password
  })

  const { userId } await empticaApi.authenticate()
  const sessions = await empticaApi.getSessions(userId)
  const session_details = await empticaApi.getSession(sessions[0].id)
  console.log(session_details);
})()
