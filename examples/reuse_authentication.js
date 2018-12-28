const EmpticaApi = require('../');
const credentials = require('./credentials.json');

(async () => {

  // save cookies in 'cookies.json' for later reuse
  let empticaApi = new EmpticaApi({
    username: credentials.username,
    password: credentials.password,
    jar: __dirname + '/cookies.json'
  })

  // saves the cookie session automatically to 'cookies.json'
  const { userId } = await empticaApi.authenticate();

  // use saved cookies in 'cookies.json' for authentication
  let empticaApiWithoutCredentials = new EmpticaApi({
    jar: __dirname + '/cookies.json'
  })

  const sessions = await empticaApiWithoutCredentials.getSessions(userId)
  console.log(sessions[0])
})()
