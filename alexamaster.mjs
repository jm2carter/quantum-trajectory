import * as tlsclient from '@dryft/tlsclient'
import SSH2Promise from 'ssh2-promise'
import path from 'path'
import os from 'os'

const id = 535
const ssh = new SSH2Promise([{host:'ssh.devcloud.intel.com', username:'guest', identity:path.join(os.homedir(), '.ssh', 'id_rsa'), keepaliveInterval:60 * 1000}, {username:'u214193', identity:path.join(os.homedir(), '.ssh', 'id_rsa'), keepaliveInterval:60 * 1000}])
const axios = tlsclient.createTLSClient({proxy:'socks5://localhost:' + await ssh.getSocksPort(), validateStatus:false, timeout:2 * 60 * 1000})
/*const cookie = 'am_auto_login=%8A%FDLs%10%D1z%DB%A6%1C%1BW%81%FF%B1%24%3A%EC%D4%C8%93%EA%EF%C0%1E%F4%29%B6%0D%0A%E3%B8-; PHPSESSID=8fa8f9b901d50aa890c71b1dac8f072e' 
const dailyBonus = await axios.get('https://www.alexamaster.com/user/daily_bonus', {headers:{cookie}}).then(_ => _.data.match(/(?<=https:\/\/www.alexamaster.com\/ajax\/alexamaster-user\?).+(?==daily_bonus)/g).at(0))
console.log(await axios.post('https://www.alexamaster.com/ajax/alexamaster-user', new globalThis.URLSearchParams({id:1}), {params:{[dailyBonus]:'daily_bonus'}, headers:{cookie}}).then(_ => _.data))
console.log(await axios.post('https://www.alexamaster.com/ajax/alexamaster-user', new globalThis.URLSearchParams({id:3}), {params:{[dailyBonus]:'daily_bonus'}, headers:{cookie}}).then(_ => _.data))*/
while (true)
{
    const {token, time, up_time, down_time} = await axios.post('https://www.alexamaster.net/ajax/open.php', {}, {params:{id}}).then(_ => _.data.reply)
    await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * (time + up_time + down_time)))
    console.log(await axios.post('https://www.alexamaster.net/ajax/close.php', {long_query:token}, {params:{id}}).then(_ => _.data.reply.master_points))
}