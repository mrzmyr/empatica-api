const rp = require('request-promise-native').defaults({ jar: true })

const URL_SESSIONS = 'https://www.empatica.com/connect/sessions.php';

class EmpaticaApi {

  /**
   * EmpaticaApi constructor
   * @param  {Array} options Options holding the authentication data
   * @return {Object} Returns a `EmpaticaApi` instance
   * @example
   * const empaticaApi = new EmpaticaApi({
   *   username: '',
   *   password: ''
   * })
   */
  constructor(options) {
    this._options = Object.assign({
    }, options);
  }

  /**
   * Authentication with the api endpoint to get session cookies, make sure to authenticate before any other api call
   * @return {Promise} Resolves with the user id
   * @example
   * await empticaApi.authenticate()
   */
  async authenticate() {
    return rp({
      method: 'POST',
      uri: 'https://www.empatica.com/connect/authenticate.php',
      followAllRedirects: true,
      jar: true,
      form: {
        username: this._options.username,
        password: this._options.password,
      }
    }).then(res => {
      return rp(URL_SESSIONS).then(res => {
        let matches = res.match(/var userId = (\d+)/gm)
        this._userId = matches[0].replace('var userId = ', '')
        return this._userId;
      })
    })
  }

  /**
   * Get all available sessions
   * @return {Promise} resolves to json with all sessions
   * @example
   * await empticaApi.authenticate()
   * const sessions = await empticaApi.getSessions()
   * console.log(sessions[0]);
   * // { id: '578634', start_time: '1541950248', duration: '70847', device_id: 'c004bc', label: '2588', device: 'E4 2.2', status: '0', exit_code: '0' }
   */
  async getSessions() {
    return rp({
      method: 'GET',
      uri: `https://www.empatica.com/connect/connect.php/users/${this._userId}/sessions?from=0&to=999999999999`,
      json: true
    })
  }

  /**
   * Get data for specific session by type (`temp`, `eda`, `ibi`, `bpv`, `acc`)
   * @param  {Number|String} id   session id
   * @param  {String} type type of the data (`temp`, `eda`, `ibi`, `bpv`, `acc`)
   * @return {Promise} resolves to json with the session `id`, `type`, `data` (array of all data points)
   * @example
   * const eda = await empticaApi.getSession(592760, 'eda')
   */
  async getSession(id, type) {
    return rp({
      method: 'GET',
      uri: `https://www.empatica.com/connect/get_csv_proxy.php?id=${id}&file=${type}&unique_id=2`,
    }).then(res => {
      return {
        id,
        type,
        data: res.split('\n')
      }
    })
  }

  /**
   * Download `.zip` folder for a whole session (usually accessed by the download button in the Web UI)
   * @param  {Number|String} id session id
   * @return {Promise} resolves to binary data
   * @example
   * const data = await empticaApi.downloadSession(592760, './session.zip')
   * fs.writeFileSync('./session.zip', data, 'binary')
   */
  async downloadSession(id) {
    return rp({
      method: 'GET',
      uri: `https://www.empatica.com/connect/download.php?id=${id}`,
      encoding: null,
      gzip: true
    })
  }

  /**
   * Deletes a session
   * @param  {Number|String} id session id
   * @return {Promise}
   * @example
   * await empticaApi.deleteSession(592760)
   */
  async deleteSession(id) {
    return rp({
      method: 'DELETE',
      uri: `https://www.empatica.com/connect/connect.php/sessions/${id}`,
    })
  }
}

module.exports = EmpaticaApi;