import * as tlsclient from '@dryft/tlsclient'
import tough from 'tough-cookie'
import SSH2Promise from 'ssh2-promise'
import path from 'path'
import os from 'os'
import ioredis from 'ioredis'
import * as commander from '/usr/share/nodejs/commander/esm.mjs'

commander.program.requiredOption('--redis <>').option('--ip <>')
commander.program.parse()
const redis = new ioredis.Redis({port:26621, host:'timewall-chaowenguo.e.aivencloud.com', password:commander.program.opts().redis, tls:{}})
const ssh = commander.program.opts().ip ? new SSH2Promise({host:commander.program.opts().ip, username:'ubuntu', identity:path.join(os.homedir(), '.ssh', 'id_ed25519'), keepaliveInterval:60 * 1000}): new SSH2Promise([{host:'ssh.devcloud.intel.com', username:'guest', identity:path.join(os.homedir(), '.ssh', 'id_rsa'), keepaliveInterval:60 * 1000}, {username:'u214193', identity:path.join(os.homedir(), '.ssh', 'id_rsa'), keepaliveInterval:60 * 1000}])
const cookiejar = new tough.CookieJar()
await cookiejar.setCookie(new tough.Cookie({key:'csrfToken', value:'EXtDnMQO%2FxfNU0ngayrHwmU4NjFhYjU1MzhmNjdkNzVkNDQxM2I3MmUzNWMyNzNiYTZmNDFiYjQ%3D', domain:'timewall.io'}), 'https://timewall.io')
await cookiejar.setCookie(new tough.Cookie({key:'tw_rem_m_c', value:await redis.hget(commander.program.opts().ip ?? 'intel', 'tw_rem_m_c'), domain:'timewall.io'}), 'https://timewall.io')
await cookiejar.setCookie(new tough.Cookie({key:'cf_clearance', value:'vOA4BBzuyOgGJxoEWZ2JcmQQJ4zkDG7ckBQ.AdfEXDY-1717557999-1.0.1.1-gzoxFFS4gvycMYrK4HzjiM82A4IU1G7zDtgqZDIiHZptKZxx5Kp6xtAyDiar0KYrbRVAWQwT4bMl4FSjjOw57w', domain:'timewall.io'}), 'https://timewall.io')
const axios = tlsclient.createTLSClient({proxy:'socks5://localhost:' + await ssh.getSocksPort(), validateStatus:false, timeout:3 * 60 * 1000, cookiejar:cookiejar})
const Hash = await redis.hget(commander.program.opts().ip ?? 'intel', 'hash')
await redis.quit()
let xCsrfToken = null
while (true)
{
    while (!(xCsrfToken = await axios.get('https://timewall.io/clicks').then(_ => _.data.match(/(?<='X-CSRF-Token', ')[+/=\w]+(?=')/g)?.at(0))));
    let GetOneClick = null
    while (!(GetOneClick = await axios.post('https://timewall.io/clicks/postcallclicks', new globalThis.URLSearchParams({action:'GetOneClick'}), {headers:{'x-csrf-token':xCsrfToken}}).then(_ => _.data.data?.at(0))));
    const {timer, encrypted_ad_id} = GetOneClick
    const sessionId = await axios.post('https://timewall.io/clicks/postcallclicks', new globalThis.URLSearchParams({action:'CheckAdExpiry', adID:encrypted_ad_id}), {headers:{'x-csrf-token':xCsrfToken}}).then(_ => _.data.sessionid)
    await new globalThis.Promise(_ => globalThis.setTimeout(_, (globalThis.Number(timer) + 5) * 1000))
    await axios.post('https://timewall.io/clicks/postcallcreditclicks', new globalThis.URLSearchParams({action:'InsertClickCredit', Hash, adID:encrypted_ad_id, sessionId}), {headers:{'x-csrf-token':xCsrfToken}})
    //console.log(await axios.post('https://timewall.io/home/getuserwallet', {}, {headers:{'x-csrf-token':xCsrfToken}}).then(_ => _.data.wallet.CurrentEarningsPoints))
}