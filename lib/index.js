const request = require('request');
const rp = require('request-promise-native').defaults({ jar: true })

const URL_SESSIONS = 'https://www.empatica.com/connect/sessions.php';

// This comes from the javascript source code of
// https://www.empatica.com/connect when viewing a session
const INTERVALS = {
  eda: 10000,
  accX: 6400,
  accY: 6400,
  accZ: 6400,
  hr: 100,
  bvp: -10,
  temp: 1000,
  batt: 100
}

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
    this._jar = request.jar()
  }

  /**
   * Authentication with the api endpoint to get session cookies, make sure to authenticate before any other api call
   * @return {Promise} Resolves with the user id
   * @example
   * await empticaApi.authenticate()
   */
  async authenticate() {
    return new Promise((resolve, reject) => {
      rp({
        method: 'POST',
        uri: 'https://www.empatica.com/connect/authenticate.php',
        followAllRedirects: true,
        jar: this._jar,
        form: {
          username: this._options.username,
          password: this._options.password,
        }
      }).then(res => {
        return rp({
          url: URL_SESSIONS,
          jar: this._jar,
        }).then(res => {
          let matches = res.match(/var userId = (\d+)/gm)
          if(matches == null) {
            return reject('authentication failed, userId couldn\'t be parsed')
          }
          this._userId = matches[0].replace('var userId = ', '')
          resolve(this._userId)
        })
      }).catch(err => {
        reject(err)
      })
    });
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
      json: true,
      jar: this._jar
    })
  }

  /**
   * Gets details about a session (but not the data itself, see `getSessionData`)
   * @param  {Number|String}  id session id
   * @return {Promise} resolves to json with session details
   * @example
   * await empticaApi.getSession(592760)
   */
  async getSession(id) {
    return rp({
      method: 'GET',
      uri: `https://www.empatica.com/connect/connect.php/sessions/${id}`,
      json: true,
      jar: this._jar
    })
  }

  /**
   * Get data for specific session by type (`temp`, `eda`, `ibi`, `batt`, `bvp`, `accX`, `accY`, `accZ`)
   * @param  {Number|String} id   session id
   * @param  {String} type type of the data
   * @return {Promise} resolves to json with the session `id`, `type`, `data` (array of all data points)
   * @example
   * const eda = await empticaApi.getSessionData(592760, 'eda')
   */
  async getSessionData(id, type) {
    let interval = INTERVALS[type];

    if(!interval) throw Error('type not supported yet')

    let session = await this.getSession(id);

    return rp({
      method: 'GET',
      uri: `https://www.empatica.com/connect/get_csv_proxy.php?id=${id}&file=${type}&unique_id=2`,
      jar: this._jar
    }).then(res => {
      return {
        id,
        type,
        start_time: session.start_time,
        interval,
        data: res.split('\n').map(l => parseInt(l, 36) / interval).filter(d => !!d)
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
      gzip: true,
      jar: this._jar
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
      jar: this._jar
    })
  }
}

module.exports = EmpaticaApi;
