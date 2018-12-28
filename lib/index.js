const request = require('request');
const fs = require('fs');
const rp = require('request-promise-native')
const FileCookieStore = require('tough-cookie-filestore');

const URL_SESSIONS = 'https://www.empatica.com/connect/sessions.php';

// This comes from the javascript source code of
// https://www.empatica.com/connect when viewing a session
const INTERVALS = {
  eda: 10000,
  acc: 100,
  accX: 6400,
  accY: 6400,
  accZ: 6400,
  hr: 100,
  bvp: -10,
  temp: 1000,
  batt: 1000
}

const SUPPORTED_TYPES = [
  'eda',
  'acc',
  'accX',
  'accY',
  'accZ',
  'hr',
  'ibi',
  'bvp',
  'temp',
  'batt'
];

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

    this._jar = request.jar();

    if(typeof this._options.jar == 'string') {
      if(!fs.existsSync(this._options.jar)) {
        fs.writeFileSync(this._options.jar, '')
      }

      this._jar = request.jar(new FileCookieStore(this._options.jar));
    }

    if(this._options.userId) {
      this._userId = this._options.userId;
    }

    this._req = rp.defaults({ jar: this._jar })
  }

  /**
   * Authentication with the api endpoint to get session cookies
   * @return {Promise} Resolves with the user id
   * @example
   * const { userId } = await empticaApi.authenticate()
   */
  async authenticate() {
    return new Promise((resolve, reject) => {
      this._req({
        method: 'POST',
        uri: 'https://www.empatica.com/connect/authenticate.php',
        followAllRedirects: true,
        form: {
          username: this._options.username,
          password: this._options.password,
        }
      }).then(res => {
        return this._req({
          url: URL_SESSIONS,
        }).then(res => {
          let matches = res.match(/var userId = (\d+)/gm)
          if(matches == null) {
            return reject('authentication failed, userId couldn\'t be parsed')
          }
          this._userId = matches[0].replace('var userId = ', '')
          resolve({
            userId: this._userId,
          })
        })
      }).catch(err => {
        reject(err)
      })
    });
  }

  /**
   * Get all available sessions of a certain user
   * @return {Promise} resolves to json with all sessions
   * @param  {Number|String} userId the user id the sessions belongs to
   * @example
   * const { userId } = await empticaApi.authenticate()
   * const sessions = await empticaApi.getSessions(userId)
   * console.log(sessions[0]);
   * // { id: '578634', start_time: '1541950248', duration: '70847', device_id: 'c004bc', label: '2588', device: 'E4 2.2', status: '0', exit_code: '0' }
   */
  async getSessions(userId) {
    return this._req({
      method: 'GET',
      uri: `https://www.empatica.com/connect/connect.php/users/${userId}/sessions?from=0&to=999999999999`,
      json: true,
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
    return this._req({
      method: 'GET',
      uri: `https://www.empatica.com/connect/connect.php/sessions/${id}`,
      json: true,
    })
  }

  /**
   * Get data for specific session by type (`temp`, `eda`, `ibi`, `hr`, `batt`, `bvp`, `acc`, `accX`, `accY`, `accZ`)
   * @param  {Number|String} id   session id
   * @param  {String} type type of the data
   * @return {Promise} resolves to json with the session `id`, `type`, `data` (array of all data points)
   * @example
   * const eda = await empticaApi.getSessionData(592760, 'eda')
   */
  async getSessionData(id, type) {

    if(!SUPPORTED_TYPES.includes(type)) throw Error('type not supported yet')

    let interval = INTERVALS[type];
    let session = await this.getSession(id);

    return this._req({
      method: 'GET',
      uri: `https://www.empatica.com/connect/get_csv_proxy.php?id=${id}&file=${type}&unique_id=2`,
    }).then(res => {

      let data = null;
      let lines = res.split('\n')

      if(type === 'ibi') {
        data = lines.slice(1, lines.length).map(l => {
          let values = l.split(',')
          return [parseFloat(values[0])*1000, 60/parseFloat(values[1])]
        })
      } else if (type === 'acc') {
        let values = lines.map(l => parseInt(l, 36) / interval);
        let max = Math.max(...values);
        data = values.map(v => -2 + 4 * (v / max))
      } else {
        data = lines.map(l => parseInt(l, 36) / interval).filter(d => !!d)
      }

      return {
        id,
        type,
        start_time: session.start_time,
        interval,
        data
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
    return this._req({
      method: 'GET',
      uri: `https://www.empatica.com/connect/download.php?id=${id}`,
      encoding: null,
      gzip: true,
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
    return this._req({
      method: 'DELETE',
      uri: `https://www.empatica.com/connect/connect.php/sessions/${id}`,
    })
  }
}

module.exports = EmpaticaApi;
