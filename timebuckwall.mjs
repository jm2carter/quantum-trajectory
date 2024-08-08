import * as playwright from 'playwright-chromium'
import path from 'path'
import {promises as fs} from 'fs'
import os from 'os'
import * as lodash from 'lodash-es'
import jsdom from 'jsdom'
import sqlite3 from 'sqlite3'
import * as sqlite from 'sqlite'
import * as commander from '/usr/share/nodejs/commander/esm.mjs'
import SSH2Promise from 'ssh2-promise'
import * as tlsclient from '@dryft/tlsclient'
import * as htmlEntities from 'html-entities'
import tough from 'tough-cookie'
import unraw from 'unraw'
import child_process from 'child_process'
import ioredis from 'ioredis'
import json5 from 'json5'
import canvas from 'canvas'

commander.program.requiredOption('--browserstackName <>').requiredOption('--browserstackKey <>').requiredOption('--gemini <>').option('--ip <>').option('--redis <>').option('--llama')
commander.program.parse()
const virtualConsole = new jsdom.VirtualConsole()
const headers = {authorization:'Basic ' + globalThis.btoa(`${commander.program.opts().browserstackName}:${commander.program.opts().browserstackKey}`)}
const buildId = await globalThis.fetch('https://api.browserstack.com/automate/builds.json', {headers}).then(_ => _.json()).then(_ => _?.at(0)?.automation_build?.hashed_id)
if (buildId)
    for (const sessionId of await globalThis.fetch(`https://api.browserstack.com/automate/builds/${buildId}/sessions.json?limit=100`, {headers}).then(_ => _.json()).then(_ => _?.map(_ => _.automation_session).filter(_ => !globalThis.Object.is(_.status, 'running')).map(_ => _.hashed_id))) await globalThis.fetch(`https://api.browserstack.com/automate/sessions/${sessionId}.json`, {method:'delete', headers})

async function gemini(prompt, temperature=0)
{
    if (commander.program.opts().llama)
    {
        while (true)
        {
            const conversation = await globalThis.fetch('https://huggingface.co/chat/conversation', {method:'post', headers:{'content-type':'application/json'}, body:globalThis.JSON.stringify({model:'meta-llama/Meta-Llama-3.1-70B-Instruct', parameter:{temperature}, preprompt:'only output json. Do not output anything that is not json. Do not use markdown format'}), signal:globalThis.AbortSignal.timeout(1000 * 5)})
            const conversationId = await conversation.json().then(_ => _.conversationId)
            const hfChat = conversation.headers.getSetCookie().at(0).split(';').at(0)
            const data = await globalThis.fetch(`https://huggingface.co/chat/conversation/${conversationId}/__data.json?x-sveltekit-invalidated=11`, {headers:{cookie:hfChat}}).then(_ => _.json()).then(_ => _.nodes.at(1).data)
            const formData = new globalThis.FormData()
            formData.append('data', globalThis.JSON.stringify({inputs:prompt, id:data.at(data.at(data.at(data.at(0).messages).at(0)).id), is_retry:false, is_continue:false, web_search:false, tools:{}}))
            for await (const _ of await globalThis.fetch(`https://huggingface.co/chat/conversation/${conversationId}`, {method:'post', headers:{cookie:hfChat, origin:'https://huggingface.co'}, body:formData, dispatcher:new globalThis[globalThis.Symbol.for('undici.globalDispatcher.1')].constructor({allowH2:true})}).then(_ => _.body.pipeThrough(new globalThis.TextDecoderStream())))
            {
                    console.log(_)
                const finalAnswer = _.split('\n').find(_ => _.includes('finalAnswer'))
                if (finalAnswer)
                {
                    console.log(globalThis.JSON.parse(finalAnswer).text)
                    return globalThis.JSON.parse(finalAnswer).text
                }
                //Model is overloaded
            }
        }
    }
    else
    {
        let result = null
        while (!(result = await globalThis.fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${commander.program.opts().gemini}`, {method:'post', headers:{'content-type':'application/json'}, body:globalThis.JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{temperature,response_mime_type:'application/json'}, safety_settings:[{category:'HARM_CATEGORY_SEXUALLY_EXPLICIT',threshold:'BLOCK_NONE'},{category:'HARM_CATEGORY_HATE_SPEECH',threshold:'BLOCK_NONE'},{category:'HARM_CATEGORY_HARASSMENT',threshold:'BLOCK_NONE'},{category:'HARM_CATEGORY_DANGEROUS_CONTENT',threshold:'BLOCK_NONE'}]})}).then(_ => _.json()).then(_ => _.candidates?.at(0)?.content?.parts?.at(0)?.text))) await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 5))
        return result
    }
}

const buckwall = {
buck:class
{
    constructor()
    {
        const ssh = commander.program.opts().ip ? new SSH2Promise({host:commander.program.opts().ip, username:'ubuntu', identity:path.join(os.homedir(), '.ssh', 'id_ed25519'), keepaliveInterval:60 * 1000}): new SSH2Promise([{host:'ssh.devcloud.intel.com', username:'guest', identity:path.join(os.homedir(), '.ssh', 'id_rsa'), keepaliveInterval:60 * 1000}, {username:'u214193', identity:path.join(os.homedir(), '.ssh', 'id_rsa'), keepaliveInterval:60 * 1000}])
        return (async() =>
        {
            this.cookiejar = new tough.CookieJar()
            await this.cookiejar.setCookie(new tough.Cookie({key:'AP_Login', value:'1', domain:'timebucks.com'}), 'https://timebucks.com')
            await this.cookiejar.setCookie(new tough.Cookie({key:'AP_Login_E', value:'1', domain:'timebucks.com'}), 'https://timebucks.com')
            await this.cookiejar.setCookie(new tough.Cookie({key:'AP_Force_logout', value:'1', domain:'timebucks.com'}), 'https://timebucks.com') 
            await this.cookiejar.setCookie(new tough.Cookie({key:'AP_Username', value:'bXlFemRrTUhyT2l5eU9YNE96UXZOT0FIOTUrNkZJNjZMb2t3TnBxUEhyUT06OqdOs%2FgPW95ItaPjz9kU9dc%3D', domain:'timebucks.com'}), 'https://timebucks.com')
            //https://www.zenrows.com/blog/bypass-cloudflare#bypassing-cloudflare-passive-bot-detection
            this.axios = tlsclient.createTLSClient({proxy:'socks5://localhost:' + await ssh.getSocksPort(), validateStatus:false, timeout:2 * 60 * 1000, cookiejar:this.cookiejar})
            this.exclude = new globalThis.Set(['82382', '146798', '186300', '186302', '201191', '201203', '202749', '203726', '213735', '191559', '222250'])
            return this
        })()
    }
    async buckwall(advertisers)
    {
        let tasks = null
        while(!(tasks = await this.axios.post('https://timebucks.com/publishers/lib/scripts/api/BuyTasksUsersCampaigns.php', new globalThis.URLSearchParams({action:'GetAllCampaigns', SortBy:0, CategoryId:-1, SubCategoryId:-1, Actions:'', Frequency:''})).then(_ => _.data.tasks?.filter(_ => !/email/i.test(_.proof_instructions)))));
        for (const task of tasks)
        {
            const campaign = await this.axios.post('https://timebucks.com/publishers/lib/scripts/api/BuyTasksUsers.php', new globalThis.URLSearchParams({action:'CheckCampaignExpiry',CampaignId:task.id})).then(_ => _.data.campaign)
            if (!campaign || this.exclude.has(campaign.Id)) continue
                console.log(campaign.UserId)
            if ([215640546, 215939501, 215986992, 216014774, 216020689, 216180641, 216216577, 216829448, 217767989, 218278151, 218896375, 218916759, 219226496, 219316423, /*219360933,*/ 219520569, 219680723, 220790080, 220941323, 221026979, 221118773, 222129416, 221378063, 221514125, 221514125, 221743810, 221772701, 221863949, 221864069, 221922354, 221930191, 221945665, 222000078, 222007546, 222215069, 222422322, 222433684, 222434697, 222473533, 222476760, /*222489672,*/ 222503436, 222514781, 222544905, 222573396, 222576568, 222591594, 222623000, 222636201, 222674997, 222681915, 222744437, 222756001, 222791502, 222795348, 222796900, 222865421, 222869314, 222878740, 222908842, /*222917553,*/ 222917581, 222922642, 222930004, 222988425, 223012661, 223050086, 223053719, 223092087, 223103768, 223105312, 223107387, 223108322, 223109623, 223112326, 223115924, 223121767, 223121964, 223126203, 223127857, 223129544, 223129544, 223133954, /*223135079,*/ 223139934, 223142673, 223151514, /*223175276,*/ 223171764, 223191414, 223205134, 223205451, 223207482, 223224985, 223237759, 223247641, 223276119, 223277428, 223278397, 223281571, 223288587, 223293329, 223293864, /*223306986,*/ 223320507, 223323511, 223325457, 223327677, 223323511, 223335916, 223338094, 223340367, 223349868, 223413655, 223655934, 223663998, 223372846, 223373280, 223379629, 223384462, 223389537, 223398761, 223403663, 223414546, 223415181, 223421327, 223429192, 223434307, 223446648, 223457540, 223467775, 223503271, 223512914, 223519963, 223529906, 223565148, 223571994, 223579409, 223605290, 223617199, 223627583, 223627956, 223628765, 223632669, 223634638, 223634638, 223654451, 223657308, 223662702, 223668812, 223685119, 223688480, 223689159, 223701964, 223709226, 223710791, 223716954, 223718930, 223719483, 223728694, 223751771, 223764762, 223764762, 223765143, 223767085, 223776210, 223777780, 223777845, 223777887, 223779114, 223779508, 223781946, 223785602, 223792524, 223796292, 223798334, 223801416, 223802305, 223816904, 223820673, 223821933, 223822316, 223825630, 223831063, 223833435, 223837449, 223838503, 223840621, 223842885, 223843844, 223848066, 223848717, 223849005, 223849007, 223855203, 223857909, 223860953, 223861112, 223874723, 223882784, 223884131, 223888972, 223889844, 223891500, 223895342, 223899801, 223896002, 223899801, 223902121, 223902510, 223930223, 223903939, 223904509, 223904222, 223907105, 223907263, 223914327, 223917013, 223917920, 223929905, 223944216, 223947386, 223948520, 223949024, 223950393, 223956767, 223963399, 223965429, 223968168, /*223970380,*/, 223970323, /*223971304,*/ 223974891, 223977417, /*223984329,*/ 223984474, 223990930, /*223994071,*/, 223995478, 223997769, 224000041, 224000095, 224002024, 224002050, 224002117, 224009312, 224014507, 224014623, 224014985, 224015316, 224017607, 224019009, 224102115, 224027275, 224027577, 224027600, 224028701, 224029910, 224032099, 224062405, 224074903, 224077135, 224079092, 224079791, 224080520, 224081445, 224083825, 224084479, 224085011, 224089292, 224089773, 224090482, 224091506, 224094923, 224100892, 224102485, 224103567, 224103568, 224103577, 224104360, 224105124, 224106809, 224108428, 224109955, 224113381, 224113509, 224116546, 224117945, 224120735, 224126110, 224128585, 224128892, 224129709, /*224133304,*/ 224138495, 224140560, 224152595, /*224157812,*/ 224160357, 224166154, 224168532, 224170952, 224172735, 224172739, 224174870, 224175352, 224175595, 224181084, /*224188879,*/ 224188902, 224188954, 224189949, 224191884, 224193943, /*224196198,*/ 224198602, 224199312, 224207912, 224217545, 224220359, 224221020, 224222460, 224225521, 224222523, 224222551, 224227238, 224228160, 224228478, 224229202, 224232567, 224251232, 224257839, 224257983, 224259553, 224261018, 224261168, /*224262819,*/ 224262994, 224267242, 224269921, 224273887, 224274214, 224275710, 224278897, 224279022, 224289241, 224289269, 224290704, 224292058, 224294938, 224295482, 224030001, 224301301, 224306475, 224308702, 224308299, 224310324, 224312387, 224314714, 224314925, 224314690, 224330991, 224332040, 224333946, 224335067, 224336963, 224337283, 224337616, 224338246, 224342250, 224342737, 224345493, 224368567, 224375527, 224377406, /*224397151,*/ 224400773, 224405070, 224405212, 224405259, 224408899, 224411216, 224421270, 224422488, 224422574, 224422940, 224427322, 224431568, 224435422, 224466394, 224479707, 224480228, 224482030, 224483092, 224483589, 224486099, 224486505, 224490367, 224492312, 224494607, 224508872, 224510437, 224521760, 224522478, 224526149, 224537335, 224542367, 224542729, 224547433, 224549549, 224549634, /*224545657,*/ 224568468, 224567674, 224579138, 224579378, 224591174, 224593428, 224610762, 224616261, 224617223, 224620770, 224623577, 224624782, 224626357, 224628579, 224653401, 224655689, 224655698, 224657627/*, 224661610*/, 224663958, 224671751, 224684880, 224687778, 224690856, 224693320, 224707164, 224710746, 224712035, 224712094, 224715082, 224715358, 224715691, 224716118, 224720677, 224722464, 224727942, 224732378, 224732829, 224733126, 224739522, 224746154, 224753269, 224753518, 224756846, 224759346, 224759481, 224761691, 224765524, 224767502, 224768425, 224778389, 224778851, 224780180,224796445, 224799082, 224805123, 224805719, 224810121, 224818183, 224819420, 224823006, 224830990, 224840480, /*224845198,*/ 224850624, /*224856732,*/ 224857021, 224868423, 224887950, 224907228, 224940957, 224947189].includes(globalThis.Number(campaign.UserId)) || globalThis.Object.keys(advertisers).includes(campaign.UserId) || globalThis.Object.is(globalThis.Number(campaign.UserId), 36) && globalThis.Object.is(campaign.actions, '22'))
            {
                console.log(await this.axios.post('https://timebucks.com/publishers/lib/scripts/api/BuyTasksUsers.php', new globalThis.URLSearchParams({action:'StartCampaign', CampaignId:campaign.Id, 'g-recaptcha-response':''})).then(_ => _.data))
                if ([223413655, 223655934, 223663998, 223764762, 224193943, 224199312, 224220359, 224221020, 224222551].includes(globalThis.Number(campaign.UserId)))
                    [campaign.text, campaign.screenshot] = await history(await new class extends Template
                    {
                        constructor()
                        {
                            super(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions, campaign.Actions).then(_ => {
                            _.periDuration = 40
                            _.repeat = 3})
                        }
                    }, this)
                else if ([223776210, 223777780, 223777845, 223777887, 223777887, 223779508, 224027577, 224028701, 224342250].includes(globalThis.Number(campaign.UserId)))
                    [campaign.text, campaign.screenshot] = await history(await new class extends Template
                    {
                        constructor()
                        {
                            super(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions, campaign.Action).then(_ => {
                            _.preDuration = _.TimeLimit
                            _.repeat = 0})
                        }
                        async text(addocument, db)
                        {
                            return await jsdom.JSDOM.fromURL(await db.all('select * from urls').then(_ => _.at(0).url), {virtualConsole}).then(_ => _.window.document.querySelector('a#download_link > button').textContent)
                        }
                    }, this)
                else if (globalThis.Object.keys(advertisers).includes(campaign.UserId)) await advertisers[campaign.UserId](campaign, this)
                else [campaign.text, campaign.screenshot] = await history(await new Template(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions, campaign.Actions), this)
                if (globalThis.Object.is(campaign.text, null) && globalThis.Object.is(campaign.screenshot, null))
                {
                    this.exclude.add(campaign.Id)
                    await this.axios.post('https://timebucks.com/publishers/lib/scripts/api/BuyTasksUsers.php', new globalThis.URLSearchParams({action:'CancelCampaign', CampaignId:campaign.Id}))
                }
                else
                {
                    await this.axios.post('https://timebucks.com/publishers/lib/scripts/api/BuyTasksUsersSubmission.php', new globalThis.URLSearchParams({action:'ValidateTimeLimit', CampaignId:campaign.Id}))
                    const formData = submit(campaign)
                    const _ = await this.axios.post('https://timebucks.com/publishers/lib/scripts/api/BuyTasksUsersSubmission.php', formData).then(_ => _.data)
                    console.log(_)
                    if (globalThis.Object.is(globalThis.Number(_.result), -9)) this.exclude.add(campaign.Id)
                    await this.axios.post('https://timebucks.com/publishers/lib/scripts/api/BuyTasksUsers.php', new globalThis.URLSearchParams({action:'CancelCampaign', CampaignId:campaign.Id}))
                }
                break
            }
        }
    }
},
wall:class
{
    constructor()
    {
        const ssh = commander.program.opts().ip ? new SSH2Promise({host:commander.program.opts().ip, username:'ubuntu', identity:path.join(os.homedir(), '.ssh', 'id_ed25519'), keepaliveInterval:60 * 1000}): new SSH2Promise([{host:'ssh.devcloud.intel.com', username:'guest', identity:path.join(os.homedir(), '.ssh', 'id_rsa'), keepaliveInterval:60 * 1000}, {username:'u214193', identity:path.join(os.homedir(), '.ssh', 'id_rsa'), keepaliveInterval:60 * 1000}])
        this.redis = new ioredis.Redis({port:26621, host:'timewall-chaowenguo.e.aivencloud.com', password:commander.program.opts().redis, tls:{}})
        return (async() =>
        {
            this.cookiejar = new tough.CookieJar()
            await this.cookiejar.setCookie(new tough.Cookie({key:'csrfToken', value:'EXtDnMQO%2FxfNU0ngayrHwmU4NjFhYjU1MzhmNjdkNzVkNDQxM2I3MmUzNWMyNzNiYTZmNDFiYjQ%3D', domain:'timewall.io'}), 'https://timewall.io')
            await this.cookiejar.setCookie(new tough.Cookie({key:'tw_rem_m_c', value:await this.redis.hget(commander.program.opts().ip ?? 'intel', 'tw_rem_m_c'), domain:'timewall.io'}), 'https://timewall.io')
            await this.cookiejar.setCookie(new tough.Cookie({key:'cf_clearance', value:'vOA4BBzuyOgGJxoEWZ2JcmQQJ4zkDG7ckBQ.AdfEXDY-1717557999-1.0.1.1-gzoxFFS4gvycMYrK4HzjiM82A4IU1G7zDtgqZDIiHZptKZxx5Kp6xtAyDiar0KYrbRVAWQwT4bMl4FSjjOw57w', domain:'timewall.io'}), 'https://timewall.io')
            await this.cookiejar.setCookie(new tough.Cookie({key:'cf_clearance', value:'XG4qjZppB2qrus4u4_.KsJBGE32uFT74rD1patGxSWE-1707879835-1-AZFNzkox2hB+AvN5DchnuAcTYTtJwSJD7zti722Y3ye0V8nlGZ/KXiJosvpx1lH5ZviuXeO7/bmHWMCNT26OYVA=', domain:'timebucks.com'}), 'https://timebucks.com')
            //https://www.zenrows.com/blog/bypass-cloudflare#bypassing-cloudflare-passive-bot-detection
            this.axios = tlsclient.createTLSClient({proxy:'socks5://localhost:' + await ssh.getSocksPort(), validateStatus:false, timeout:3 * 60 * 1000, cookiejar:this.cookiejar})
            await fs.unlink('/etc/localtime')
            await fs.symlink(path.join('/usr/share/zoneinfo', await this.axios.get('http://ip-api.com/json').then(_ => _.data.timezone)), '/etc/localtime')
            console.log(child_process.spawnSync('date', ['-R']).stdout.toString())
            this.Hash = await this.redis.hget(commander.program.opts().ip ?? 'intel', 'hash')
            await this.redis.quit()
            for (const _ of await this.axios.get('https://timebucks.com/TimewallApi/TasksApi.php', {params:{action:'GetMySubmissionsDTNew', Hash:this.Hash, Filter:6, length:100}}).then(_ => _.data.data)) await this.axios.post('https://timebucks.com/TimewallApi/TasksApi.php', {action:'FileDispute',Hash:this.Hash,CampaignId:_[2],SessionId:_[0],DisputeDetails:globalThis.Object.values(globalThis.JSON.parse(await gemini(`Answer in JSON object {key:rephase the sentence in <context> into one sentence}
                                                                                                                                                                                                                                                                                                                                                                                                                                    <context>I have done your work perfectly please re-check my task</context>`, 2))).at(0)})
            for (const _ of await this.axios.post('https://timebucks.com/TimewallApi/TasksApi.php', {action:'GetMyDisputes', Hash:this.Hash, filter:2}).then(_ => _.data.Campaigns))
            {
                if ([223914327, 224175352, 224257839, 224273887, 224338246, 224411216, 224653401, 224722464].includes(globalThis.Number(_.AdvertiserId))) await this.axios.post('https://timebucks.com/TimewallApi/TasksApi.php', {action:'UpdateDispute', DisputeId:_.DisputeId, Status:3, Hash:this.Hash})
            }
            while (!(this.xCsrfToken = await this.axios.get('https://timewall.io/withdraw').then(_ => _.data.match(/(?<='X-CSRF-Token', ')[+/=\w]+(?=')/g)?.at(0))));
            console.log(await this.axios.post('https://timewall.io/withdraw/withdrawrequest', {}, {headers:{'x-csrf-token':this.xCsrfToken}}).then(_ => _.data))
            this.exclude = new globalThis.Set(['82382', '146798', '186300', '186302', '201191', '201203', '202749', '203726', '213735', '191559', '222250'])
            return this
        })()
    }
    async buckwall(advertisers)
    {
        while (!(this.DeviceId = await this.axios.get('https://timewall.io/tasks').then(_ => _.data.match(/(?<=DeviceId: ')\w+(?=')/g)?.at(0))));
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 10))
        let tasks = null
        while(!(tasks = await this.axios.post('https://timewall.io/a-p-i/getallcampaigns', {SortBy:0, CategoryId:-1, SubCategoryId:-1, Actions:[], DeviceId:this.DeviceId, Frequency:[], FavTasks:''}, {headers:{'x-csrf-token':this.xCsrfToken}}).then(_ => _.data.tasks?.filter(_ => !/email/i.test(_.proof_instructions)))));
        for (const task of tasks)
        {
            const campaign = await this.axios.post('https://timebucks.com/TimewallApi/TasksApi.php', {action:'CheckCampaignExpiry',CampaignId:task.id,Hash:this.Hash, DeviceId:this.DeviceId}).then(_ => _.data.campaign)
            if (!campaign || this.exclude.has(campaign.Id)) continue
                console.log(campaign.UserId)
            if ([215640546, 215939501, 215986992, 216014774, 216020689, 216180641, 216216577, 216829448, 217767989, 218278151, 218896375, 218916759, 219226496, 219316423, /*219360933,*/ 219520569, 219680723, 220790080, 220941323, 221026979, 221118773, 222129416, 221378063, 221514125, 221514125, 221743810, 221772701, 221863949, 221864069, 221922354, 221930191, 221945665, 222000078, 222007546, 222215069, 222422322, 222433684, 222434697, 222473533, 222476760, /*222489672,*/ 222503436, 222514781, 222544905, 222573396, 222576568, 222591594, 222623000, 222636201, 222674997, 222681915, 222744437, 222756001, 222791502, 222795348, 222796900, 222865421, 222869314, 222878740, 222908842, /*222917553,*/ 222917581, 222922642, 222930004, 222988425, 223012661, 223050086, 223053719, 223092087, 223103768, 223105312, 223107387, 223108322, 223109623, 223112326, 223115924, 223121767, 223121964, 223126203, 223127857, 223129544, 223129544, 223133954, /*223135079,*/ 223139934, 223142673, 223151514, /*223175276,*/ 223171764, 223191414, 223205134, 223205451, 223207482, 223224985, 223237759, 223247641, 223276119, 223277428, 223278397, 223281571, 223288587, 223293329, 223293864, /*223306986,*/ 223320507, 223323511, 223325457, 223327677, 223323511, 223335916, 223338094, 223340367, 223349868, 223413655, 223655934, 223663998, 223372846, 223373280, 223379629, 223384462, 223389537, 223398761, 223403663, 223414546, 223415181, 223421327, 223429192, 223434307, 223446648, 223457540, 223467775, 223503271, 223512914, 223519963, 223529906, 223565148, 223571994, 223579409, 223605290, 223617199, 223627583, 223627956, 223628765, 223632669, 223634638, 223634638, 223654451, 223657308, 223662702, 223668812, 223685119, 223688480, 223689159, 223701964, 223709226, 223710791, 223716954, 223718930, 223719483, 223728694, 223751771, 223764762, 223764762, 223765143, 223767085, 223776210, 223777780, 223777845, 223777887, 223779114, 223779508, 223781946, 223785602, 223792524, 223796292, 223798334, 223801416, 223802305, 223816904, 223820673, 223821933, 223822316, 223825630, 223831063, 223833435, 223837449, 223838503, 223840621, 223842885, 223843844, 223848066, 223848717, 223849005, 223849007, 223855203, 223857909, 223860953, 223861112, 223874723, 223882784, 223884131, 223888972, 223889844, 223891500, 223895342, 223899801, 223896002, 223899801, 223902121, 223902510, 223930223, 223903939, 223904509, 223904222, 223907105, 223907263, 223914327, 223917013, 223917920, 223929905, 223944216, 223947386, 223948520, 223949024, 223950393, 223956767, 223963399, 223965429, 223968168, /*223970380,*/, 223970323, /*223971304,*/ 223974891, 223977417, /*223984329,*/ 223984474, 223990930, /*223994071,*/, 223995478, 223997769, 224000041, 224000095, 224002024, 224002050, 224002117, 224009312, 224014507, 224014623, 224014985, 224015316, 224017607, 224019009, 224102115, 224027275, 224027577, 224027600, 224028701, 224029910, 224032099, 224062405, 224074903, 224077135, 224079092, 224079791, 224080520, 224081445, 224083825, 224084479, 224085011, 224089292, 224089773, 224090482, 224091506, 224094923, 224100892, 224102485, 224103567, 224103568, 224103577, 224104360, 224105124, 224106809, 224108428, 224109955, 224113381, 224113509, 224116546, 224117945, 224120735, 224126110, 224128585, 224128892, 224129709, /*224133304,*/ 224138495, 224140560, 224152595, /*224157812,*/ 224160357, 224166154, 224168532, 224170952, 224172735, 224172739, 224174870, 224175352, 224175595, 224181084, /*224188879,*/ 224188902, 224188954, 224189949, 224191884, 224193943, /*224196198,*/ 224198602, 224199312, 224207912, 224217545, 224220359, 224221020, 224222460, 224225521, 224222523, 224222551, 224227238, 224228160, 224228478, 224229202, 224232567, 224251232, 224257839, 224257983, 224259553, 224261018, 224261168, /*224262819,*/ 224262994, 224267242, 224269921, 224273887, 224274214, 224275710, 224278897, 224279022, 224289241, 224289269, 224290704, 224292058, 224294938, 224295482, 224030001, 224301301, 224306475, 224308702, 224308299, 224310324, 224312387, 224314714, 224314925, 224314690, 224330991, 224332040, 224333946, 224335067, 224336963, 224337283, 224337616, 224338246, 224342250, 224342737, 224345493, 224368567, 224375527, 224377406, /*224397151,*/ 224400773, 224405070, 224405212, 224405259, 224408899, 224411216, 224421270, 224422488, 224422574, 224422940, 224427322, 224431568, 224435422, 224466394, 224479707, 224480228, 224482030, 224483092, 224483589, 224486099, 224486505, 224490367, 224492312, 224494607, 224508872, 224510437, 224521760, 224522478, 224526149, 224537335, 224542367, 224542729, 224547433, 224549549, 224549634, /*224545657,*/ 224568468, 224567674, 224579138, 224579378, 224591174, 224593428, 224610762, 224616261, 224617223, 224620770, 224623577, 224624782, 224626357, 224628579, 224653401, 224655689, 224655698, 224657627/*, 224661610*/, 224663958, 224671751, 224684880, 224687778, 224690856, 224693320, 224707164, 224710746, 224712035, 224712094, 224715082, 224715358, 224715691, 224716118, 224720677, 224722464, 224727942, 224732378, 224732829, 224733126, 224739522, 224746154, 224753269, 224753518, 224756846, 224759346, 224759481, 224761691, 224765524, 224767502, 224768425, 224778389, 224778851, 224780180,224796445, 224799082, 224805123, 224805719, 224810121, 224818183, 224819420, 224823006, 224830990, 224840480, /*224845198,*/ 224850624, /*224856732,*/ 224857021, 224868423, 224887950, 224907228, 224940957, 224947189].includes(globalThis.Number(campaign.UserId)) || globalThis.Object.keys(advertisers).includes(campaign.UserId) || globalThis.Object.is(globalThis.Number(campaign.UserId), 36) && globalThis.Object.is(campaign.actions, '22'))
            { 
                console.log(await this.axios.post('https://timebucks.com/TimewallApi/TasksApi.php', {action:'StartCampaign', CampaignId:campaign.Id, Hash:this.Hash, DeviceId:this.DeviceId}).then(_ => _.data))
                if ([223413655, 223655934, 223663998, 223764762, 224193943, 224199312, 224220359, 224221020, 224222551].includes(globalThis.Number(campaign.UserId)))
                    [campaign.text, campaign.screenshot] = await history(await new class extends Template
                    {
                        constructor()
                        {
                            super(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions, campaign.Actions).then(_ => {
                            _.periDuration = 40
                            _.repeat = 3})
                        }
                    }, this)
                else if ([223776210, 223777780, 223777845, 223777887, 223777887, 223779508, 224027577, 224028701, 224342250].includes(globalThis.Number(campaign.UserId)))
                    [campaign.text, campaign.screenshot] = await history(await new class extends Template
                    {
                        constructor()
                        {
                            super(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions, campaign.Action).then(_ => {
                            _.preDuration = _.TimeLimit
                            _.repeat = 0})
                        }
                        async text(addocument, db)
                        {
                            return await jsdom.JSDOM.fromURL(await db.all('select * from urls').then(_ => _.at(0).url), {virtualConsole}).then(_ => _.window.document.querySelector('a#download_link > button').textContent)
                        }
                    }, this)
                else if (globalThis.Object.keys(advertisers).includes(campaign.UserId)) await advertisers[campaign.UserId](campaign, this)
                else [campaign.text, campaign.screenshot] = await history(await new Template(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions, campaign.Actions), this)
                if (globalThis.Object.is(campaign.text, null) && globalThis.Object.is(campaign.screenshot, null))
                {
                    this.exclude.add(campaign.Id)
                    await this.axios.post('https://timebucks.com/TimewallApi/TasksApi.php', {action:'CancelCampaign', CampaignId:campaign.Id, Hash:this.Hash})
                }
                else
                {
                    await this.axios.post('https://timebucks.com/TimewallApi/TasksApi.php', {action:'ValidateTimeLimit', CampaignId:campaign.Id, Hash:this.Hash})
                    const formData = submit(campaign)
                    formData.append('UserId', this.Hash)
                    const _ = await this.axios.post('https://timebucks.com/TimewallApi/TasksApi.php', formData).then(_ => _.data)
                    console.log(_)
                    if (globalThis.Object.is(globalThis.Number(_.result), -9)) this.exclude.add(campaign.Id)
                    await this.axios.post('https://timebucks.com/TimewallApi/TasksApi.php', {action:'CancelCampaign', CampaignId:campaign.Id, Hash:this.Hash})
                }
                break
            }
        }
    }
}}

const axios = tlsclient.createTLSClient({validateStatus:false, timeout:2 * 60 * 1000})
const quora = await axios.get('https://www.quora.com')
/*const cookie = await axios.post('https://www.quora.com/graphql/gql_para_POST', {variables:{email:'chaowen.guo1@gmail.com',password:commander.program.opts().password,captcha:''},extensions:{hash:'84c101336cf918326e85a2bfd01acba0a99e266346c3414a8472bc4e6e8b6415'}}, {headers:{cookie:quora.headers.get('Set-Cookie').map(_ => _.split(';').at(0)).join(';'), 'quora-broadcast-id':quora.data.match(/(?<="broadcastId": ")[-\w]+(?=")/g).at(0), 'quora-formkey':quora.data.match(/(?<="formkey": ")\w+(?=")/g).at(0)}}).then(_ => _.headers.get('Set-Cookie').map(_ =>
{
    const cookie = _.split(';')
    const keyValue = cookie.at(0).split('=')
    return {name:keyValue.at(0), value:keyValue.slice(1).join('='), domain:cookie.find(_ => _.includes('Domain')).split('=').at(-1), path:cookie.find(_ => _.includes('Path')).split('=').at(-1)}
}))*/

async function geminiVision(url)
{
    let result = null
    const response = await axios.get(url)
    while (!(result = await globalThis.fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${commander.program.opts().gemini}`, {method:'post', headers:{'content-type':'application/json'}, body:globalThis.JSON.stringify({contents:[{parts:[{text:`1: What is the url next to arrow? Output in JSON object {url:If the url is in wrong format, correct it. If the url is masked, check See results only from}
                                                                                                                                                                                                                                                                                                             2: Is Visit 4 Pages in the image? Output in JSON object {gsc:just boolean not string boolean}
                                                                                                                                                                                                                                                                                                             3: Return the answers from step 1 to 2 in a single JSON object.`}, {inline_data:{mime_type:response.headers.get('Content-Type'), data:globalThis.btoa(response.data)}}]}], generationConfig:{temperature:0, response_mime_type:'application/json'}, safety_settings:[{category:'HARM_CATEGORY_SEXUALLY_EXPLICIT',threshold:'BLOCK_NONE'},{category:'HARM_CATEGORY_HATE_SPEECH',threshold:'BLOCK_NONE'},{category:'HARM_CATEGORY_HARASSMENT',threshold:'BLOCK_NONE'},{category:'HARM_CATEGORY_DANGEROUS_CONTENT',threshold:'BLOCK_NONE'}]})}).then(_ => _.json()).then(_ => _.candidates?.at(0)?.content?.parts?.at(0)?.text)));
    result = globalThis.JSON.parse(result) 
    return result.gsc || result.url 
}

class Template
{
    #destination
    constructor(TimeLimit, Instructions, ProofInstructions, Actions)
    {
        this.TimeLimit = TimeLimit
        this.Instructions = Instructions
        this.Actions = Actions
        this.preDuration = 0
        this.advertisement = true
        this.adRepeat = 2
        return (async() =>
        {
            globalThis.Object.assign(this, globalThis.JSON.parse(await gemini(`1: Answer the question <periDuration> in JSON object {periDuration:{question:repeat the question, why:reason, answer:number of seconds}} based on <context>. .
                                                                               2: Answer the question <repeat> in JSON object {repeat:{question:repeat the question, why:reason, answer:arabic numerals}} based on <context>.
                                                                               3: Answer the question <destination> in JSON object {destination:{question:repeat the question}, why:reason, answer:JSON array of urls padded starts with https}} based on <context>
                                                                               4: Answer the question <google> in JSON object {google:{question:repeat the question, why:reason, answer:just boolean not string boolean}} based on <context>
                                                                               5: Return the answers from step 1 to 4 in a single JSON object. Not JSON array.
                                                                               <periDuration>How long to visit just one article or blog or page or post or topic, not total time? If the question can not be answered, answer should be null</periDuration>
                                                                               <repeat>How many articles or blogs or pages or posts or topics should be visited or opened before click on advertisement? If there are multiple answers, return the maximum number. If you can not answer the question, return 1</repeat>
                                                                               <destination>What are all the urls in the context in order except google.com and bing.com? urls are padded starts with https. If the url is in wrong format, correct it. If the url contain *, fill the * based on <context>. The url should never contain *. Do not return duplicate urls.</destination>
                                                                               <google>Are you asked to search in google?</google>
                                                                               <context>${Instructions}</context>`)))
            this.#destination = this.destination.answer.map(htmlEntities.decode)
                console.log(this.periDuration, this.repeat, this.#destination, this.google)
            this.periDuration = this.periDuration.answer
            this.repeat = this.repeat.answer
            this.google = this.google.answer
            delete this.destination
            if (!this.periDuration || this.periDuration >= 60) this.periDuration = 60 
            this.ProofInstructions = globalThis.JSON.parse(await gemini(`1: Answer in JSON object {key:{question:summarize the question, why:reason, answer:just boolean not string boolean}} with the question <history>, <url>, <adurl>, <paragraph>, <code> based on <context> with key history, url, adurl, paragraph, code.
                                                                         2: Return the answers from step 1 in a single JSON object. Not JSON array.
                                                                         <history>Are you asked to submit or provide or take or send screenshot of browser history?</history>
                                                                         <url>Are you asked to submit the url of post in my website?</url>
                                                                         <adurl>Are you asked to submit the url of ad? Submitting the screenshot of ad does not imply submitting the url of ad.</adurl>
                                                                         <paragraph>Are you asked to submit an paragraph of ad?</paragraph>
                                                                         <code>Are you asked to submit the code?</code>
                                                                         <context>${ProofInstructions}</context>`))
                console.log(this.ProofInstructions)
            this.ProofInstructions = globalThis.Object.fromEntries(globalThis.Object.entries(this.ProofInstructions).map(([key,value]) => [key, value.answer])) 
            return this
        })()
    }
    destination(db)
    {
        return this.#destination.at(0)
    }
    destinationExcept(response)
    {
        if (response.data.includes('no such host')) return this.#destination.at(1)
        else
        {
            let destinationLast = response.config.url.split('site:').at(-1)
            if (!destinationLast.includes('.')) return this.#destination.at(1) 
            else
            {
                try {return new globalThis.URL(destinationLast.startsWith('http') ? destinationLast : 'https://' + destinationLast).href}
                catch
                {
                    destinationLast = destinationLast.split(' ').find(_ => _.includes('.'))
                    return destinationLast ? 'https://' + destinationLast.replaceAll('"', '') : this.#destination.at(1)
                }
            }
        }
    }
    destinationLast(document)
    {
        return null
    }
    gsc()
    {
        return this.#destination.at(1)
    }
    client(document, post)
    {
        const result = [document, post].map(_ => [!_?.querySelector('script[src^="//c.pubguru.net"]') && _?.querySelector('ins[data-ad-client][data-ad-slot]') && _?.evaluate('//script/@*[contains(local-name(), "src") and starts-with(., "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-")]', _, null, 2, null)?.stringValue?.split(/=|&/)?.at(1), _?.location?.href])
        return result.at(0).at(0) ? result.at(0) : result.at(1)
    }
    async text(post, addocument, db)
    {
        const result = []
        if (this.ProofInstructions.code) result.push(this.ProofInstructions.code)
        if (this.ProofInstructions.url) result.push('url: ' + post?.location?.href)
        if (this.ProofInstructions.adurl) result.push('adurl: ' + addocument?.location?.href)
        if (this.ProofInstructions.paragraph) result.push('paragraph: ' + addocument?.body?.textContent?.slice(0, 1000))
        return result.length ? result.join('\r\n\r\n') : 'undefined'
    }
}

function decodeURIComponent(destination)
{
    while(destination.includes('%25')) destination = destination.replaceAll('%25', '%')
    return destination
}

const caps =
{
    browser:'chrome',
    os:'osx',
    os_version:'Ventura',
    args:['--start-maximized', '--disable-blink-features=AutomationControlled'],
    'browserstack.username':commander.program.opts().browserstackName,
    'browserstack.accessKey':commander.program.opts().browserstackKey,
    'browserstack.idleTimeout':'300',
    'client.playwrightVersion':child_process.spawnSync('npx', ['playwright', '--version']).stdout.toString().trim().split(' ').at(-1) // Playwright version being used on your local project needs to be passed in this capability for BrowserStack to be able to map request and responses correctly
}

async function history(template, buckwall)
{
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tmp'))
    await fs.mkdir(path.join(tmp, 'Default'))
    const db = await sqlite.open({filename:path.join(tmp, 'Default/History'), driver:sqlite3.Database})
    await db.exec(`CREATE TABLE urls(id INTEGER PRIMARY KEY AUTOINCREMENT,url LONGVARCHAR,title LONGVARCHAR,visit_count INTEGER DEFAULT 0 NOT NULL,typed_count INTEGER DEFAULT 0 NOT NULL,last_visit_time INTEGER NOT NULL,hidden INTEGER DEFAULT 0 NOT NULL);
                   CREATE TABLE visits(id INTEGER PRIMARY KEY AUTOINCREMENT,url INTEGER NOT NULL,visit_time INTEGER NOT NULL,from_visit INTEGER,external_referrer_url TEXT,transition INTEGER DEFAULT 0 NOT NULL,segment_id INTEGER,visit_duration INTEGER DEFAULT 0 NOT NULL,incremented_omnibox_typed_score BOOLEAN DEFAULT FALSE NOT NULL,opener_visit INTEGER,originator_cache_guid TEXT,originator_visit_id INTEGER,originator_from_visit INTEGER,originator_opener_visit INTEGER,is_known_to_sync BOOLEAN DEFAULT FALSE NOT NULL,consider_for_ntp_most_visited BOOLEAN DEFAULT FALSE NOT NULL,visited_link_id INTEGER DEFAULT 0 NOT NULL, app_id TEXT)`) //sqlite3 History .schema visits
    const todestination = [await template.destination(db)]
    let document = null
    while (true)
    {
        todestination[todestination.length - 1] = todestination.at(-1).trim()
        console.log(todestination)
        let response = null
        try {response = ['timewall.io', 'timebucks.com'].includes(new globalThis.URL(todestination.at(-1)).hostname) ? await buckwall.axios.get(todestination.at(-1)) : await axios.get(todestination.at(-1))}
        catch {response = await axios.get(todestination.at(-1))}
        if (globalThis.Object.is(response.status, 0) && (response.data.includes('net/http: HTTP/1.x transport connection broken') || response.data.includes('EOF'))) response = await axios.get(todestination.at(-1), {forceHttp1:true})
        else if (globalThis.Object.is(response.status, 0) && (response.data.match(/invalid URL scheme:|no such host|failed to create request object:/)))
        {
            //failed to create request object: https://{link}, https://onqwe qoi paoem 
            //invalid URL scheme: site:https://{link}, site:https://onqwe qoi paoem 
            if (response.data.includes('invalid character "{" in host name')) return [null, null]
            const destinationLast = template.destinationExcept(response)
            response = await axios.get(destinationLast)
            if (globalThis.Object.is(response.status, 0) && (response.data.includes('net/http: HTTP/1.x transport connection broken') || response.data.includes('EOF'))) response = await axios.get(destinationLast, {forceHttp1:true})
            else if (globalThis.Object.is(response.status, 0) && (response.data.includes('invalid URL scheme:'))) return [null, null]
        }
        else if (globalThis.Object.is(response.status, 0) && response.data.includes('net/http: request canceled (Client.Timeout exceeded while awaiting headers)')) return [null, null]
        let destination = decodeURIComponent(new globalThis.URL(response.request.responseURL).hash.startsWith('#gsc.tab=0&gsc.q=') ? response.request.responseURL : response.request.responseURL.split(/\?fbclid|#/).at(0))
        if (destination.match(/^https:\/\/[a-z]+\.facebook\.com/))
        {
            destination = globalThis.Object.is(new globalThis.URL(destination).pathname, '/login/') ? new globalThis.URL(destination).searchParams.get('next') : destination
            const browser = await playwright.chromium.connect({wsEndpoint:`wss://cdp.browserstack.com/playwright?caps=${globalThis.encodeURIComponent(globalThis.JSON.stringify(caps))}`}) 
            const context = await browser.newContext({viewport:null})
            context.setDefaultTimeout(0)
            const page = await context.newPage()
            await page.goto(destination)
            document = new jsdom.JSDOM(await page.content(), {url:destination, virtualConsole}).window.document
            await browser.close()
        }
        else document = new jsdom.JSDOM(response.data, {url:destination, virtualConsole}).window.document
        await db.exec(`insert into urls values(null,'${document.location.href.replaceAll("'", "''")}','${document.title.replaceAll("'", "''")}',0,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0);
                       insert into visits values(null,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0,'',805306376,0,0,0,0,'',0,0,0,0,0,0,0);
                       update visits set url = id where id = (select count(*) from visits)`)
        destination = new globalThis.URL(destination)
        if (globalThis.Object.is(destination.hostname, 't.co')) todestination.push(document.querySelector('meta[content^="0;url=" i]').content.split(/0;url=/i).at(-1))
        else if (globalThis.Object.is(destination.hostname, 'beacons.ai')) todestination.push(globalThis.JSON.parse(document.evaluate('//script[contains(text(), "significantLink")]', document, null, 2, null).stringValue).significantLink)
        else if (globalThis.Object.is(destination.hostname, 'foxly.sbs') || globalThis.Object.is(destination.hostname, 'foxly.icu')) todestination.push(document.evaluate('//script[contains(text(), "window.location.href =")]', document, null, 2, null).stringvalue.match(/(?<=window\.location\.href = ').+(?=')/g).at(0))
        else if (globalThis.Object.is(destination.hostname, 'heylink.me')) todestination.push(document.querySelector('a.preview-link-wrapper').href)
        else if (globalThis.Object.is(destination.hostname, 'medium.com')) todestination.push(document.querySelector('a[rel="noopener ugc nofollow"]').href)
        else if (globalThis.Object.is(destination.hostname, 'www.bing.com') && destination.searchParams.has('q')) todestination.push(destination.searchParams.get('q'))
        else if (globalThis.Object.is(destination.hostname, 'www.bing.com') && destination.searchParams.has('psq')) todestination.push(destination.searchParams.get('psq'))
        else if (globalThis.Object.is(destination.hostname, 'www.bing.com') && destination.searchParams.has('u')) todestination.push(globalThis.atob(destination.searchParams.get('u').replace(/^a1/, '')))
        else if (globalThis.Object.is(destination.hostname, 'ca.search.yahoo.com') && destination.searchParams.has('p')) todestination.push(destination.searchParams.get('p'))
        else if (globalThis.Object.is(destination.hostname, 'r.search.yahoo.com') && destination.href.includes('/RU=')) todestination.push(globalThis.decodeURIComponent(destination.href.split('/').find(_ => _.startsWith('RU=')).split('RU=').at(-1)))
        else if (globalThis.Object.is(destination.hostname, 'www.linkedin.com') && destination.searchParams.has('url')) todestination.push(destination.searchParams.get('url'))
        else if (globalThis.Object.is(destination.hostname, 'www.linkedin.com') && destination.pathname.startsWith('/post'))
        {
            const url = document.querySelector('h4.tw-feed-content-subtitle').textContent.match(/\b(?:https)?[-;:?=&/.\w]+\b/g).at(0)
            todestination.push(url.startsWith('http') ? url : 'https://' + url)
        }
        else if ((globalThis.Object.is(destination.hostname, 'www.google.com') || globalThis.Object.is(destination.hostname, 'www.google.co.in'))  && destination.searchParams.has('url')) todestination.push(destination.searchParams.get('url'))
        else if (globalThis.Object.is(destination.hostname, 'www.google.com') && destination.searchParams.has('q')) todestination.push(destination.searchParams.get('q'))
        else if (globalThis.Object.is(destination.hostname, 'www.youtube.com') && destination.searchParams.has('q')) todestination.push(destination.searchParams.get('q'))    
        else if (globalThis.Object.is(destination.hostname, 'www.youtube.com') && destination.pathname.startsWith('/channel')) todestination.push('https://' + new jsdom.JSDOM(document.documentElement.outerHTML, {virtualConsole, runScripts:'dangerously'}).window.ytInitialData.header.c4TabbedHeaderRenderer.headerLinks.channelHeaderLinksViewModel.firstLink.content)
        else if (destination.hostname.endsWith('.facebook.com') && destination.searchParams.has('u')) todestination.push(destination.searchParams.get('u'))
        //else if (globalThis.Object.is(destination.hostname, 'www.facebook.com') && destination.pathname.startsWith('/groups')) todestination.push(document.title.match(/\bhttps?[-;:?=&/.\w]+\b/g)?.at(0))
        //else if (globalThis.Object.is(destination.hostname, 'www.facebook.com') && globalThis.Object.is(destination.pathname, '/profile.php')) todestination.push(document.querySelector('a[role=link][rel="nofollow noreferrer"]:has(span').href)
        else if (destination.hostname.endsWith('.facebook.com')) todestination.push(unraw.default(document.evaluate('//script[contains(text(), "external_url") or contains(text(), "ExternalUrl")]', document, null, 2, null).stringValue.match(/(?<="external_url":"|"ExternalUrl","url":")[-=&?./\\:\w]+(?=",)/g).find(_ => !_.includes('maps.google.com'))))
        else if (globalThis.Object.is(destination.hostname, 'sites.google.com')) todestination.push(globalThis.Array.from(document.querySelectorAll('a[href]'), _ => _.href).find(_ => !globalThis.Object.is(new globalThis.URL(_).hostname, 'sites.google.com')))
        else if (globalThis.Object.is(destination.hostname, 'www.pinterest.com') || globalThis.Object.is(destination.hostname, 'in.pinterest.com')) todestination.push(document.querySelector('a[rel="noopener noreferrer nofollow')?.href ?? document.querySelector('meta[property="og:see_also"]').content)
        else if (globalThis.Object.is(destination.hostname, 'www.reddit.com')) todestination.push(document.querySelector('a[rel="noopener nofollow ugc"]').href) //https://praw.readthedocs.io/en/stable/tutorials/comments.html
        else if (globalThis.Object.is(destination.hostname, 'www.threads.net')) todestination.push(document.querySelector('link[rel="me"]').href)
        else if (globalThis.Object.is(destination.hostname, 'www.quora.com') && destination.pathname.startsWith('/profile') && globalThis.Object.is(destination.pathname.match(/\//g).length, 3)) todestination.push(globalThis.JSON.parse(globalThis.JSON.parse(unraw.default(document.evaluate('//script[contains(text(), "isVisibleToViewer")]', document, null, 2, null).stringValue.split('window.ansFrontendGlobals').find(_ => _.includes('isVisibleToViewer')).match(/{.+}/g).at(0))).data.post.contentQtextDocument.legacyJson).sections.flatMap(_ => _.spans.map(_ => _.modifiers)).map(_ => _.link ?? _.embed).find(_ => _).url)
        else if (globalThis.Object.is(destination.hostname, 'www.quora.com') && destination.pathname.startsWith('/profile') && globalThis.Object.is(destination.pathname.match(/\//g).length, 2)) todestination.push(globalThis.JSON.parse(unraw.default(document.evaluate('//script[contains(text(), "accountStatus")]', document, null, 2, null).stringValue.split('window.ansFrontendGlobals').find(_ => _.includes('accountStatus')).match(/{.+}/g).at(0))).data.user.combinedProfileFeedConnection.edges.map(_ => globalThis.JSON.parse(_.node.post.content).sections.at(0).spans.at(0).modifiers.embed.url).at(0))
        else if (globalThis.Object.is(destination.hostname, 'www.quora.com') && destination.pathname.includes('/answer')) todestination.push(globalThis.JSON.parse(globalThis.JSON.parse(unraw.default(document.evaluate('//script[contains(text(), "isVisibleToViewer")]', document, null, 2, null).stringValue.split('window.ansFrontendGlobals').find(_ => _.includes('isVisibleToViewer')).match(/{.+}/g).at(0))).data.answer.content).sections.map(_ => _.spans.at(0).modifiers.embed?.url).filter(_ => _).at(0))
        else if (destination.hostname.endsWith('.quora.com') && !globalThis.Object.is(destination.hostname, 'www.quora.com') && globalThis.Object.is(destination.pathname, '/')) todestination.push(globalThis.JSON.parse(globalThis.JSON.parse(unraw.default(document.evaluate('//script[contains(text(), "contributorsOrHigher")]', document, null, 2, null).stringValue.split('window.ansFrontendGlobals').find(_ => _.includes('contributorsOrHigher')).match(/{.+}/g).at(0))).data.multifeedObject.multifeedConnection.edges.at(0).node.stories.at(0).post.content).sections.map(_ => _.spans.at(0).modifiers.embed?.url).filter(_ => _).at(0))
        else if (destination.hostname.endsWith('.quora.com') && !globalThis.Object.is(destination.hostname, 'www.quora.com') && globalThis.Object.is(destination.pathname, '/about')) todestination.push(globalThis.JSON.parse(globalThis.JSON.parse(unraw.default(document.evaluate('//script[contains(text(), "contributorsOrHigher")]', document, null, 2, null).stringValue.split('window.ansFrontendGlobals').find(_ => _.includes('contributorsOrHigher')).match(/{.+}/g).at(0))).data.tribe.settings.rules).sections.at(0).spans.at(0).modifiers.link.url)
        else if (destination.hostname.endsWith('.quora.com') && !globalThis.Object.is(destination.hostname, 'www.quora.com') && destination.pathname.startsWith('/profile')) todestination.push(globalThis.JSON.parse(globalThis.JSON.parse(unraw.default(document.evaluate('//script[contains(text(), "isVisibleToViewer")]', document, null, 2, null).stringValue.split('window.ansFrontendGlobals').find(_ => _.includes('isVisibleToViewer')).match(/{.+}/g).at(0))).data.post.contentQtextDocument.legacyJson).sections.map(_ => _.spans.at(0).modifiers.embed?.url).filter(_ => _).at(0))    
        else if (destination.hostname.endsWith('.quora.com') && !globalThis.Object.is(destination.hostname, 'www.quora.com') && !globalThis.Object.is(destination.pathname, '/')) todestination.push(globalThis.JSON.parse(globalThis.JSON.parse(unraw.default(document.evaluate('//script[contains(text(), "isVisibleToViewer")]', document, null, 2, null).stringValue.split('window.ansFrontendGlobals').find(_ => _.includes('isVisibleToViewer')).match(/{.+}/g).at(0))).data.tribeItem.post.content).sections.map(_ => _.spans.at(0).modifiers.link?.url ?? _.spans.at(0).modifiers.embed?.url).filter(_ => _).at(0))
        else if (globalThis.Object.is(destination.hostname, 'api.whatsapp.com')) todestination.push(new globalThis.URL(destination.search, 'https://web.whatsapp.com').href)
        else if (globalThis.Object.is(destination.hostname, 't.me') && !destination.pathname.startsWith('/s/'))
        {
            todestination.push(new globalThis.URL(destination.pathname.slice(1), 'https://t.me/s/').href)
            template.advertisement = false
        }
        else if (globalThis.Object.is(destination.hostname, 'x.com') && globalThis.Object.is(destination.pathname.split('/').at(-2), 'status'))
        {
            const operationName = 'TweetResultByRestId'
            const map = await axios.get('https://abs.twimg.com/responsive-web/client-web/main.8bf92a8a.js').then(_ => _.data.match(/(?<=e=>{e.exports=){queryId:".+?]}}(?=},)/g).map(json5.parse).find(_ => globalThis.Object.is(_.operationName, operationName)))
            const twitter = new jsdom.JSDOM(await axios.get('https://x.com?mx=2').then(_ => _.data)).window.document
            const guestToken = twitter.evaluate('//script[contains(text(), \'document.cookie="gt=\')]', twitter, null, 2, null).stringValue.match(/(?<=document.cookie="gt=)\d+(?=;)/g).at(0)
            todestination.push(await axios.get(`https://api.x.com/graphql/${map.queryId}/${operationName}`, {params:{variables:globalThis.JSON.stringify({tweetId:destination.pathname.split('/').at(-1),withCommunity:false,includePromotedContent:false,withVoice:false}), features:globalThis.JSON.stringify(globalThis.Object.fromEntries(map.metadata.featureSwitches.map(_ => [_,false])))}, headers:{authorization:'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA', 'x-guest-token':guestToken}}).then(_ => _.data.data.tweetResult.result.legacy.entities.urls.at(0).expanded_url))
        }
        else if (globalThis.Object.is(destination.hostname, 'x.com'))
        {
            return [null, null]
            const operationName = 'UserByScreenName'
            const list = await axios.get('https://abs.twimg.com/responsive-web/client-web/main.8bf92a8a.js').then(_ => _.data.match(/(?<=e=>{e.exports=){queryId:".+?]}}(?=},)/g).map(json5.parse))
            const map = list.find(_ => globalThis.Object.is(_.operationName, operationName))
            const twitter = new jsdom.JSDOM(await axios.get('https://x.com?mx=2').then(_ => _.data)).window.document
            const guestToken = twitter.evaluate('//script[contains(text(), \'document.cookie="gt=\')]', twitter, null, 2, null).stringValue.match(/(?<=document.cookie="gt=)\d+(?=;)/g).at(0)
            const result = await axios.get(`https://api.x.com/graphql/${map.queryId}/${operationName}`, {params:{variables:globalThis.JSON.stringify({screen_name:destination.pathname.split('/').at(-1),withSafetyModeUserFields:false}), features:globalThis.JSON.stringify(globalThis.Object.fromEntries(map.queryId.metadata.featureSwitches.map(_ => [_,false])))}, headers:{authorization:'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA', 'x-guest-token':guestToken}}).then(_ => _.data.data.user.result)
            console.log(result)
            const id = result.id
            const url = result.legacy.entities.url?.urls?.at(0)?.expanded_url
                console.log(id, url)
            if (url) todestination.push(url)
            else
            {
                const operationName = 'UserTweets'
                const map = list.find(_ => globalThis.Object.is(_.operationName, operationName))
                const result = await axios.get(`https://api.x.com/graphql/${map.queryId}/${operationName}`, {params:{variables:globalThis.JSON.stringify({userId:id,count:10,withQuickPromoteEligibilityTweetFields:false,withVoice:false,withV2Timeline:false}), features:globalThis.JSON.stringify(globalThis.Object.fromEntries(map.queryId.metadata.featureSwitches.map(_ => [_,false])))}, headers:{authorization:'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA', 'x-guest-token':guestToken}}).then(_ => _.data.data.user.timeline_v2.timeline.instructions)
                    console.log(result)
                return [null, null]
            }
        }
        else if (globalThis.Object.is(destination.hostname, 'prnt.sc')) todestination.push(document.querySelector('meta[property="og:image"]').content)
        else if (response.headers.get('Content-Type').startsWith('image'))
        {
            const result = await geminiVision(destination.href)
            todestination.push(globalThis.Object.is(typeof result, 'boolean') ? template.gsc() : result)
        }
        else if (destination.hash.startsWith('#gsc.tab=0&gsc.q='))
        {
            todestination.push('https://www.adsensecustomsearchads.com/cse_v2/ads?cx=8977236e12a613243&client=google-coop&q=trading&format=p4&ad=p4&num=0&output=uds_ads_only&source=gcsc&v=3&uio=-&rurl=https%3A%2F%2Fforeign.rkraihan.com%2F%23gsc.tab%3D0%26gsc.q%3Dtrading') //https://syndicatedsearch.goog/cse_v2/ads?cx=28dc64108fdf6d795&client=google-coop&q=accident%20lawyer&format=p4&ad=p4&num=0&output=uds_ads_only&source=gcsc&v=3&uio=-&rurl=https%3A%2F%2Fsalimspeaking.com%2F%23gsc.tab%3D0%26gsc.q%3Daccident%2520lawyer
            template.advertisement = false
        }
        else if (!globalThis.Array.from(document.querySelectorAll('a[href]'), _ => _.href).some(_ => _.startsWith(destination.origin.replace(/^http:/, "https:"))) && !globalThis.Object.is(destination.origin, todestination.at(-1)) && !globalThis.Object.is(destination.hostname, 'www.adsensecustomsearchads.com')) todestination.push(destination.origin)
        else break
    }
    const destinationLast = await template.destinationLast(document)
    if (destinationLast)
    {
        let response = await axios.get(destinationLast)
        if (globalThis.Object.is(response.status, 0)) response = await axios.get(destinationLast, {forceHttp1:true})
        document = new jsdom.JSDOM(response.data, {url:response.request.responseURL, virtualConsole}).window.document
        await db.exec(`insert into urls values(null,'${document.location.href.replaceAll("'", "''")}','${document.title.replaceAll("'", "''")}',0,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0);
                       insert into visits values(null,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0,'',805306376,0,0,0,0,'',0,0,0,0,0,0,0);
                       update visits set url = id where id = (select count(*) from visits)`)
    }
    if (template.google)
    {
        const search = 'https://www.google.com/search?q=' + globalThis.encodeURIComponent(document.location.href)
        let response = await axios.get(search)
        if (globalThis.Object.is(response.status, 0)) response = await axios.get(search, {forceHttp1:true})
        const googledocument = new jsdom.JSDOM(response.data, {url:response.config.url, virtualConsole}).window.document
        const count = globalThis.Object.values(await db.get('select count(*) from visits')).at(0)
        const last_visit_time = globalThis.Object.values(await db.get('select last_visit_time from urls order by last_visit_time desc')).at(0)
        const visit_time = globalThis.Object.values(await db.get('select visit_time from visits order by visit_time desc')).at(0)
        await db.exec(`update urls set id = ${count} + 1, last_visit_time = ${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000} where id = ${count};
                       insert into urls values(${count},'${googledocument.location.href.replaceAll("'", "''")}','${googledocument.title.replaceAll("'", "''")}',0,0,${last_visit_time},0);
                       update visits set id = ${count} + 1, url = ${count} + 1, visit_time = ${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000} where id = ${count};
                       insert into visits values(${count},0,${visit_time},0,'',805306376,0,0,0,0,'',0,0,0,0,0,0,0);
                       update visits set url = id where id = ${count}`)
    }
        console.log(document.location.href)
    if (document.location.hostname.endsWith('.tuteehub.com')) await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
    await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60 * template.preDuration))
    let post = null
    if (template.ProofInstructions.code)
    {
	    let next = document
        for (const _ of globalThis.Array(template.repeat).keys())
        {
            const link = next.querySelector('a:where(#download, #download_link)')?.href ?? next.evaluate('//*[text()[contains(., "Next Post") or contains(., "Next Page")]]', next, null, 9, null).singleNodeValue?.closest('a')?.href ?? next.evaluate('//a[text()="Next" or text()="3rd Page" or contains(text(), "th Page")]', next, null, 9, null).singleNodeValue?.href ?? next.querySelector('button[data-external-url]')?.dataset?.externalUrl ?? next.evaluate('//script[contains(text(), "window.location.href")]', next, null, 2, null).stringValue.match(/(?<=window\.location\.href = ')[-:/.\w]+?(?=')/g)?.at(0)
                console.log(link)
            let response = await axios.get(link)
            if (globalThis.Object.is(response.status, 0) && (response.data.includes('net/http: HTTP/1.x transport connection broken') || response.data.includes('EOF'))) response = await axios.get(link, {forceHttp1:true})
            next = new jsdom.JSDOM(response.data, {url:response.config.url, virtualConsole}).window.document
            await db.exec(`insert into urls values(null,'${next.location.href.replaceAll("'", "''")}','${next.title.replaceAll("'", "''")}',0,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0);
                           insert into visits values(null,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0,'',805306376,0,0,0,0,'',0,0,0,0,0,0,0);
                           update visits set url = id where id = (select count(*) from visits)`)
            await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * template.periDuration))
        }
        template.ProofInstructions.code = next.evaluate('//strong[text()="CODE"]', next, null, 9, null).singleNodeValue?.parentNode?.textContent ?? next.querySelector('a#download_link')?.textContent ?? next.evaluate('//*[(self::a or self::b or self::strong) and contains(text(), "Code")]', next, null, 9, null).singleNodeValue?.textContent ?? next.querySelector('div#numberDisplay')?.textContent ?? await axios.get('https://geekozor.com/filter/for/fantasy/fiop.js').then(_ => _.data.match(/(?<=")Time-B\d+(?=")/g).at(0))
    }
    else if (globalThis.Object.is(document.location.hostname, 'www.adsensecustomsearchads.com'))
    {
        template.advertisement = false
        for (const _ of globalThis.Array.from(document.querySelectorAll('a.m_.o_.styleable-visurl.a'), _ => _.href).slice(0, template.repeat))
        {
                console.log(_)
            let response = await axios.get(_)
            if (globalThis.Object.is(response.status, 0) && (response.data.includes('net/http: HTTP/1.x transport connection broken') || response.data.includes('EOF'))) response = await axios.get(_, {forceHttp1:true})
            const document = new jsdom.JSDOM(response.data, {url:response.request.responseURL, virtualConsole}).window.document
            await db.exec(`insert into urls values(null,'${document.location.href.replaceAll("'", "''")}','${document.title.replaceAll("'", "''")}',0,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0);
                           insert into visits values(null,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0,'',805306376,0,0,0,0,'',0,0,0,0,0,0,0);
                           update visits set url = id where id = (select count(*) from visits)`)
            await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * template.periDuration)) 
        }
    }
    else
    {
        for (const _ of globalThis.Array.from(new globalThis.Set(globalThis.Array.from(document.querySelectorAll(`:where(link, a):where([href*="-"],[href*="/?p="],[href^='${document.location.origin.replace(/^http:/, "https:")}'])`), _ => _.href.split(/\?fbclid|#/).at(0)).filter(_ => globalThis.Object.is(new globalThis.URL(_).origin, document.location.origin.replace(/^http:/, "https:"))))).sort((a,b)=> (a.match(/wp-content|wp-json|wp-includes/g)?.length ?? 0) - (b.match(/wp-content|wp-json|wp-includes/g)?.length ?? 0) || (b.match(/-/g)?.length ?? 0) - (a.match(/-/g)?.length ?? 0)).slice(0, template.repeat))
        {
                console.log(_)
            let response = await axios.get(_)
            if (globalThis.Object.is(response.status, 0) && (response.data.includes('net/http: HTTP/1.x transport connection broken') || response.data.includes('EOF'))) response = await axios.get(_, {forceHttp1:true})
            const document = new jsdom.JSDOM(response.data, {url:response.config.url, virtualConsole}).window.document
            post ??= document
            await db.exec(`insert into urls values(null,'${document.location.href.replaceAll("'", "''")}','${document.title.replaceAll("'", "''")}',0,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0);
                           insert into visits values(null,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0,'',805306376,0,0,0,0,'',0,0,0,0,0,0,0);
                           update visits set url = id where id = (select count(*) from visits)`)
            await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * template.periDuration))
        }
    }
    let adhref = null, addocument = null, screenshot = null
    const postDuration = (template.TimeLimit - template.preDuration) * 60 - template.repeat * template.periDuration
    if (template.advertisement)
    {
        const browser = await playwright.chromium.connect({wsEndpoint:`wss://cdp.browserstack.com/playwright?caps=${globalThis.encodeURIComponent(globalThis.JSON.stringify(caps))}`}) 
        const context = await browser.newContext({viewport:null})
        context.setDefaultTimeout(0)
        const page = await context.newPage()
        await page.route(/^https:\/\/(www\.google\.com\/recaptcha\/api\.js|a3\.pubguru\.net\/tccaptcha)/, _ => _.abort())
        const height = await page.evaluateHandle(() => globalThis.outerHeight).then(_ => _.jsonValue())
        outer:for (const googleAdPage of post ? [document.location.href, post.location.href] : [document.location.href])
        {
            const googlePublisherTag = await page.goto(googleAdPage)
            if (googlePublisherTag.status().toString().startsWith('5'))
            {
                await db.close()
                await context.close()
                await fs.rm(tmp, {recursive:true})
                return [null, null]
            }
            await page.mouse.wheel(0, height)
            await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 35))
            await page.mouse.wheel(0, -height)
            await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 35))
            for (const ad of await page.locator('ins.adsbygoogle:has(iframe[src^="https://googleads.g.doubleclick.net"]), :where(ins, div, span)[data-google-query-id]:has(iframe[id^=google_ads_iframe_])').all())
            {
                if (await ad.boundingBox().then(_ => _?.height))
                {
                    await ad.scrollIntoViewIfNeeded()
                    const iframe = new jsdom.JSDOM(await ad.frameLocator('iframe').first().locator(':root').innerHTML(), {virtualConsole}).window.document
                    adhref = iframe.querySelector('a[href*="adurl=http"]')?.href ?? iframe.evaluate('//script[contains(text(), "adurl=http") or contains(text(), "adurl\\x3dhttp")]', iframe, null, 2, null).stringValue.match(/(?<=("|\\x22))https:\/\/[-\\()%&=?:./\w]+adurl(?:=|\\x3d)http[-\\()%&=?:./\w]+(?=\1)/g)?.at(0) ?? iframe.evaluate('//script[contains(text(), "destinationUrl: ")]', iframe, null, 2, null).stringValue.match(/(?<=destinationUrl: ('|\\+x27))https:\/\/[-\\()%&=?:./\w]+(?=\1)/g)?.at(0)  //?? await (async function(){const src = iframe.querySelector('iframe[src]')?.src; return src && await jsdom.JSDOM.fromURL(src, {virtualConsole}).then(_ => _.window.document.querySelector('a')?.href)})()
                    if (!adhref) console.log(iframe.documentElement.innerHTML)
                    else
                    {
                        adhref = unraw.default(adhref)
                            console.log(adhref)
                        await ad.evaluateHandle(_ => {_.style.borderWidth = '5px'; _.style.borderColor = 'red'; _.style.borderStyle = 'solid'})
                        break outer
                    }
                }
            }
        }
        const video = page.locator('video')
        if (await video.count())
        {
            await video.first().evaluateHandle(_ => _.currentTime = 60)
            await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 10))
        }
        const image = new canvas.Image()
        image.src = await page.screenshot()
        const picture = canvas.createCanvas(image.width, image.height)
        const ctx = picture.getContext('2d')
        ctx.drawImage(image, 0, 0, image.width / 2, image.height)
        if (!adhref) adhref = 'https://www.mathschool.com/summer-enrollment-ca-one'
        try{await page.goto(adhref)}
        catch {page.goto('https://www.mathschool.com/summer-enrollment-ca-one')}
        await page.mouse.wheel(0, height * globalThis.Math.random())
        image.src = await page.screenshot()
        ctx.drawImage(image, image.width / 2, 0, image.width / 2, image.height)
        screenshot = new globalThis.Blob([picture.toBuffer('image/png')], {type:'image/png'})
        await fs.writeFile('screenshot.png', picture.toBuffer())
        addocument = new jsdom.JSDOM(await page.content(), {url:page.url(), virtualConsole}).window.document
        await browser.close()
        await db.exec(`insert into urls values(null,'${addocument.location.href.replaceAll("'", "''")}','${addocument.title.replaceAll("'", "''")}',0,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0);
                       insert into visits values(null,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0,'',805306376,0,0,0,0,'',0,0,0,0,0,0,0);
                       update visits set url = id where id = (select count(*) from visits)`)
        for (const _ of lodash.sampleSize(globalThis.Array.from(new globalThis.Set(globalThis.Array.from(addocument.querySelectorAll(':where(a, link)[href]'), _ => {
            try
            {
                return new globalThis.URL(_.href.split(/\?fibcid|#/).at(0))
            }
            catch {return null}}).filter(_ => _ && _.protocol.startsWith('http') && !_.pathname.includes('wp-content')).map(_ => _.toString()))), template.adRepeat))
        {
                console.log(_)
            await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * postDuration / template.adRepeat))
            let response = await axios.get(_)
            if (globalThis.Object.is(response.status, 0) && (response.data.includes('net/http: HTTP/1.x transport connection broken') || response.data.includes('EOF'))) response = await axios.get(_, {forceHttp1:true})
            const document = new jsdom.JSDOM(response.data, {url:response.request.responseURL || response.config.url, virtualConsole}).window.document            
            await db.exec(`insert into urls values(null,'${document.location.href.replaceAll("'", "''")}','${document.title.replaceAll("'", "''")}',0,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0);
                           insert into visits values(null,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0,'',805306376,0,0,0,0,'',0,0,0,0,0,0,0);
                           update visits set url = id where id = (select count(*) from visits)`)
        }
    }
    else await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * (70 + postDuration)))
    const text = await template.text(post, addocument, db)
    await db.close()
    if (template.ProofInstructions.history)
    {
        const context = await playwright.chromium.launchPersistentContext(tmp, {channel:'chrome', args:['--disable-blink-features=AutomationControlled', '--remote-debugging-pipe', '--user-data-dir=' + tmp, '--no-first-run', '--start-maximized', '--no-sandbox'], ignoreDefaultArgs:true, headless:false, viewport:null})//default_args https://github.com/microsoft/playwright/blob/5faf6f9e69c2148e94c81675fb636eb31a02b5e7/src%2Fserver%2Fchromium%2Fchromium.ts#L78
        const page = await context.newPage()
        await page.goto('chrome://history')
        await page.screenshot({path:'screenshot.png'})
        const startlxde = child_process.spawn('startlxde', {stdio:'inherit'})
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 30))
        screenshot = new globalThis.Blob([child_process.spawnSync('import', ['-window', 'root', 'png:-']).stdout], {type:'image/png'})
        startlxde.kill()
        await context.close()
    }
    await fs.rm(tmp, {recursive:true})
    return [text, screenshot]
}

const advertisers = {
async 215058334(campaign, buckwall)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions).then(_ => _.advertisement = false)
        }
        destination(db)
        {
            return 'https://' + this.Instructions.match(/[a-z]+\. com/g).at(0).replaceAll(' ', '')
        }
    }, buckwall)
},

async 216014774(campaign, buckwall)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions).then(_ => _.ProofInstructions.history = true)
        }
    }, buckwall)
},

/*async 219564116(campaign)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit, campaign.Instructions)
            this.advertisement = false
            return (async() =>
            {
                this.preurl = ['https://' + campaign.Instructions.split('\r\n').find(_ => _.startsWith('1.')).split('site:').at(-1)]
                this.url = new globalThis.URL(this.preurl.at(-1)).origin
                return this
            })()
        }
    })
},

async 221639285(campaign)
{
    const url = campaign.Instructions.split(/[12]\./).at(1).split('\r\n').findLast(_ => !globalThis.Object.is(_, ''))
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tmp')) 
    const context = await playwright.chromium.launchPersistentContext(tmp, {channel:'chrome', args:['--disable-blink-features=AutomationControlled', '--start-maximized'], headless:false, viewport:null})//default_args https://github.com/microsoft/playwright/blob/5faf6f9e69c2148e94c81675fb636eb31a02b5e7/src%2Fserver%2Fchromium%2Fchromium.ts#L78
    context.setDefaultTimeout(0)
    const page = await context.newPage()
    await page.goto(url)
    const split = new globalThis.URL(url).searchParams.get('q').split(' ')
    campaign.text = globalThis.Object.is(url, 'https://www.google.com/search?q=louis+vuitton+iphone+14+pro+max+case+ucasespot.com') ? await page.goto('https://ucasespot.com/product/black-louis-vuitton-iphone-case-for-11-12-13-14-pro-max-plus').then(_ => _.url()) : await page.goto(await page.locator(`a[href^="https://${split.filter(_ => _.includes('.')).at(0)}"]`, {hasText:split.filter(_ => !_.includes('.')).join(' ')}).first().getAttribute('href')).then(_ => _.url())
    await page.mouse.wheel(0, globalThis.Math.random() * await page.evaluateHandle(() => globalThis.document.documentElement.clientHeight).then(_ => _.jsonValue()))
    await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60 * campaign.TimeLimit))
    campaign.screenshot = new globalThis.Blob([await page.screenshot()], {type:'image/png'})
    await context.close()
    await fs.rm(tmp, {recursive:true})
},*/

async 221800554(campaign, buckwall)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions).then(_ => {
            _.periDuration = 30
            _.repeat = 7})
        }
        async destinationLast(document)
        {
            return geminiVision(await jsdom.JSDOM.fromURL(document.location.href, {virtualConsole}).then(_ => _.window.document.querySelector('meta[property="og:image"]').content))
        }
    }, buckwall)
},

/*async 222174546(campaign)
{
    const query = campaign.Instructions.split('\r\n').find(_ => _.startsWith('3.')).split('search for').at(-1).trim()
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tmp')) 
    const context = await playwright.chromium.launchPersistentContext(tmp, {channel:'chrome', args:['--disable-blink-features=AutomationControlled', '--start-maximized'], headless:false, viewport:null})//default_args https://github.com/microsoft/playwright/blob/5faf6f9e69c2148e94c81675fb636eb31a02b5e7/src%2Fserver%2Fchromium%2Fchromium.ts#L78
    context.setDefaultTimeout(0)
    const page = await context.newPage()
    await page.goto('https://www.google.com/search?q=' + globalThis.encodeURIComponent(query))
    const origin = new globalThis.URL(await page.goto('https://' + query.split(' ').at(-1)).then(_ => _.url())).origin
    const document = new jsdom.JSDOM(await page.content(), {url:page.url(), virtualConsole}).window.document
    for (const _ of lodash.sampleSize(globalThis.Array.from(new globalThis.Set(globalThis.Array.from(document.querySelectorAll(`h2 > a[href^='${origin}'][href*='-']`), _ => _.href))), 10))
    {
        await page.goto(_)
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 5))
    }
    await page.mouse.move(0, 0)
    await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 10))
    const adframe = page.frameLocator('iframe[id^=google_ads_iframe_]').first()
    const adlocator = adframe.locator('a:where([href^="https://www.googleadservices.com/pagead/aclk"], [href^="https://ad.doubleclick.net/pcs/click"], [href^="https://www.bing.com/api/v1/mediation/tracking"])')
    while (!await adlocator.count())
    {
        await page.evaluateHandle(_ => googletag.pubads().refresh())
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 5))
    }
    campaign.text = await page.goto(await adlocator.first().getAttribute('href')).then(_ => _.url())
    await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 5))
    const addocument = new jsdom.JSDOM(await page.content(), {url:page.url(), virtualConsole}).window.document
    campaign.text += ' ' + (function (href){switch (true){
                                case href.startsWith('http'): return href
                                case href.startsWith('/'): return addocument.location.origin + href
                            }})(lodash.sample(globalThis.Array.from(new globalThis.Set(globalThis.Array.from(addocument.querySelectorAll('a:where([href^=http], [href^="/"])'), _ => _.href)))))
    await page.goto('chrome://history')
    campaign.screenshot = new globalThis.Blob([await page.screenshot()], {type:'image/png'})
    await context.close()
    await fs.rm(tmp, {recursive:true})
},*/

async 222482043(campaign, buckwall)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions).then(_ => _.periDuration = 60)
        }
    }, buckwall)
},

/*async 222521476(campaign)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit)
            this.selector = 'h3 > a[href*="-"]'
            this.preDuration = 0
            this.periDuration = 60
            this.repeat = 3
            return (async() =>
            {
const goto = campaign.Instructions.split('\r\n').find(_ => _.startsWith('1.')).split(' ').at(-1)
if (globalThis.Object.is(goto, 'google.com'))
{
this.preurl = ['https://www.google.com/search?q=' + globalThis.encodeURIComponent(campaign.Instructions.split('\r\n').find(_ => _.startsWith('2.')).split('search for').at(-1))]
let google = null
while (!(google = await jsdom.JSDOM.fromURL(this.preurl.at(-1), {virtualConsole, resources}).then(_ => globalThis.Array.from(_.window.document.querySelectorAll('a[href]'), _ => _.href).find(_ => new globalThis.RegExp(campaign.Instructions.split('\r\n').find(_ => _.startsWith('3.')).split(' ').at(-1).replaceAll('.', globalThis.String.raw`\.`).replaceAll('*', '.')).test(_)))));
this.preurl.push(google)
}
else this.preurl = [await globalThis.fetch('https://' + campaign.Instructions.split('\r\n').find(_ => _.startsWith('1.')).split(' ').at(-1)).then(_ => _.url)]
            this.url = new globalThis.URL(this.preurl.at(-1)).origin
                return this
            })()
        }
    })
},

async 222729732(campaign)
{
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tmp')) 
    const context = await playwright.chromium.launchPersistentContext(tmp, {channel:'chrome', args:['--disable-blink-features=AutomationControlled', '--start-maximized'], headless:false, viewport:null})//default_args https://github.com/microsoft/playwright/blob/5faf6f9e69c2148e94c81675fb636eb31a02b5e7/src%2Fserver%2Fchromium%2Fchromium.ts#L78
    context.setDefaultTimeout(0)
    const page = await context.newPage()
    await page.goto(campaign.Instructions.split(/[12]\./).at(1).split('\r\n').findLast(_ => !globalThis.Object.is(_, '')))
    await page.goto(await page.locator('a[href^="https://youtu.be"]').getAttribute('href'))
    await page.goto(new globalThis.URL(await page.locator('yt-formatted-string#content-text > a').getAttribute('href')).searchParams.get('q'))
    for (const _ of globalThis.Array(globalThis.Number(await page.locator('span[style*="color: red"]').textContent().then(_ => _.split('/').at(-1)))).keys())
    {
        await new globalThis.Promise(async _ => globalThis.setTimeout(_, 1000 * await page.locator('div#mdtimer span').textContent()))
        await page.goto(await page.locator('div#makingdifferenttimer > a').getAttribute('href'))
    }
    await new globalThis.Promise(async _ => globalThis.setTimeout(_, 1000 * await page.locator('div#mdtimer span').textContent()))
    campaign.text = await page.locator('div#makingdifferenttimer').textContent()
    await page.mouse.move(0, 0)
    for await (const _ of await page.locator('iframe:where([id^=google_ads_iframe_], [src^="https://googleads.g.doubleclick.net"])').all().then(_ => _.map(_ => _.frameLocator(':scope').locator('a[href*=adurl]'))))
    {
        if (await _.count())
        {
            await page.goto(new globalThis.URL(await _.first().getAttribute('href')).searchParams.get('adurl'))
            break
        }
    }
    for (const _ of lodash.sampleSize(globalThis.Array.from(new globalThis.Set(await globalThis.Promise.all(await page.locator('a[href^=http]').all().then(_ => _.map(_ => _.getAttribute('href')))))), 3))
    {
        await page.goto(_)
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 15))
    }
    await page.goto('chrome://history')
    campaign.screenshot = new globalThis.Blob([await page.screenshot()])
    await context.close()
    await fs.rm(tmp, {recursive:true})
},

async 222906527(campaign)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit)
            this.selector = 'h2 > a[href*="-"]'
            this.preDuration = 0
            this.periDuration = 30
            this.repeat = 8
            this.advertisement = false
            return (async() =>
            {
const query = campaign.Instructions.split(/1|2:/).at(1).split('\r\n').filter(_ => !globalThis.Object.is(_, '')).at(2)
                this.preurl = ['https://www.google.com/search?q=' + globalThis.encodeURIComponent(query)]
            this.url = 'https://' + query.split(' ').at(-1)
            return this
            })()
        }
        async text(addocument, db)
        {
const coldMedicine = await jsdom.JSDOM.fromURL(this.url + '/?s=cold+medicine', {virtualConsole}).then(_ => _.window.document.querySelector(this.selector).href)
return await jsdom.JSDOM.fromURL(coldMedicine, {virtualConsole}).then(_ => _.window.document.querySelector('a#download_link').textContent)
        }
    })
},

async 222933801(campaign)
{
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tmp')) 
    const context = await playwright.chromium.launchPersistentContext(tmp, {channel:'chrome', args:['--disable-blink-features=AutomationControlled', '--start-maximized'], headless:false, viewport:null})//default_args https://github.com/microsoft/playwright/blob/5faf6f9e69c2148e94c81675fb636eb31a02b5e7/src%2Fserver%2Fchromium%2Fchromium.ts#L78
    context.setDefaultTimeout(0)
    const page = await context.newPage()
    if (campaign.ProofInstructions.includes('history'))
    {
        await page.goto('https://www.google.com/search?q=' + campaign.Instructions.split('\r\n').find(_ => _.startsWith('1.')).split('search for').at(-1))
        await page.goto(await globalThis.Promise.all(await page.locator('div#rso a').all().then(_ => _.map(_ => _.getAttribute('href')))).then(_ => _.filter(_ => new globalThis.RegExp(`${campaign.Instructions.split('\r\n').filter(_ => _.startsWith('2.')).at(0).match(/\b[*\w]+\.\w+\b/g).at(0).replaceAll('.', '\.').replaceAll('*', '.')}`).test(_)).at(0)))
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
        await page.mouse.move(0, 0)
        for await (const _ of await page.locator('iframe:where([id^=google_ads_iframe_], [src^="https://googleads.g.doubleclick.net"])').all().then(_ => _.map(_ => _.frameLocator(':scope').locator('a[href*=adurl]'))))
        {
            if (await _.count())
            {
                await page.goto(new globalThis.URL(await _.first().getAttribute('href')).searchParams.get('adurl'))
                break
            }
        }
        await page.goto('chrome://history')
        campaign.screenshot = new globalThis.Blob([await page.screenshot()])
    }
    else
    {
        await page.goto(campaign.Instructions.split('\r\n').find(_ => _.startsWith('1.')).split(' ').at(-1))
        await page.mouse.move(0, 0)
        for await (const _ of await page.locator('iframe:where([id^=google_ads_iframe_], [src^="https://googleads.g.doubleclick.net"])').all().then(_ => _.map(_ => _.frameLocator(':scope').locator('a[href*=adurl]'))))
        {
            if (await _.count())
            {
                await page.goto(new globalThis.URL(await _.first().getAttribute('href')).searchParams.get('adurl'))
                break
            }
        }
        campaign.screenshot = new globalThis.Blob([await page.screenshot()])
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
    }
    await context.close()
    await fs.rm(tmp, {recursive:true})
},*/

async 222992737(campaign, buckwall)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions).then(_ => _.advertisement = campaign.Instructions.includes('NOTE: If you do not see any Google Advert on my site') ? false : true)
        }
    }, buckwall)
},

/*async 223005173(campaign)
{
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tmp')) 
    const context = await playwright.chromium.launchPersistentContext(tmp, {channel:'chrome', args:['--disable-blink-features=AutomationControlled', '--start-maximized'], headless:false, viewport:null})//default_args https://github.com/microsoft/playwright/blob/5faf6f9e69c2148e94c81675fb636eb31a02b5e7/src%2Fserver%2Fchromium%2Fchromium.ts#L78
    context.setDefaultTimeout(0)
    const page = await context.newPage()
    await page.goto(campaign.Instructions.split('\r\n').find(_ => _.startsWith('1.')).match(/\bhttps:\/\/[=/.?\w]+\b/g).at(0))
    const locator = await page.locator('yt-formatted-string#content-text > a')
    while (!await locator.count()) await page.mouse.wheel(0, await page.evaluateHandle(() => globalThis.document.documentElement.clientHeight).then(_ => _.jsonValue()))
    const origin = new globalThis.URL(await page.goto(new globalThis.URL(await locator.getAttribute('href')).searchParams.get('q')).then(_ => _.url())).origin
    const document = await jsdom.JSDOM.fromURL(origin, {virtualConsole}).then(_ => _.window.document)
    for (const _ of lodash.sampleSize(globalThis.Array.from(new globalThis.Set(globalThis.Array.from(document.querySelectorAll(`h2 > a[href^='${origin}'][href*=archives]`), _ => _.href))), 4))
    {
        await page.goto(_)
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 30))
    }
    await page.mouse.move(0, 0)
    await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 10))
    const adframe = page.frameLocator('iframe[id^=google_ads_iframe_]').first()
    const adlocator = adframe.locator('a:where([href^="https://www.googleadservices.com/pagead/aclk"], [href^="https://ad.doubleclick.net/pcs/click"], [href^="https://www.bing.com/api/v1/mediation/tracking"])')
    while (!await adlocator.count())
    {
        await page.evaluateHandle(_ => googletag.pubads().refresh())
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 5))
    }
    await page.goto(await adlocator.first().getAttribute('href'))
    await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
    const addocument = new jsdom.JSDOM(await page.content(), {url:page.url(), virtualConsole}).window.document
    await page.goto((function(href){switch (true){
                        case href.startsWith('http'): return href
            case href.startsWith('/'): return addocument.location.origin + href
                    }})(lodash.sample(globalThis.Array.from(new globalThis.Set(globalThis.Array.from(addocument.querySelectorAll('a:where([href^=http], [href^="/"])'), _ => _.href))))))
    await page.goto('chrome://history')
    campaign.screenshot = new globalThis.Blob([await page.screenshot()], {type:'image/png'})
    await context.close()
    await fs.rm(tmp, {recursive:true})
},

async 223005920(campaign)
{
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tmp')) 
    const context = await playwright.chromium.launchPersistentContext(tmp, {channel:'chrome', args:['--disable-blink-features=AutomationControlled', '--start-maximized'], headless:false, viewport:null})//default_args https://github.com/microsoft/playwright/blob/5faf6f9e69c2148e94c81675fb636eb31a02b5e7/src%2Fserver%2Fchromium%2Fchromium.ts#L78
    context.setDefaultTimeout(0)
    const page = await context.newPage()
    await page.goto('https://www.google.com/search?q=' + globalThis.encodeURIComponent(campaign.Instructions.split('\r\n').filter(_ => _.startsWith('1.')).at(0).split(' ').at(-2)))
    await page.goto('https://' + campaign.Instructions.split('\r\n').find(_ => _.startsWith('2.')).match(/\b\w+\.\w+\b/g).at(0))
    for (const _ of lodash.sampleSize(globalThis.Array.from(new globalThis.Set(await globalThis.Promise.all(await page.locator(`h2 > a[href^='${new globalThis.URL(page.url()).origin}'][href*='-']`).all().then(_ => _.map(_ => _.getAttribute('href')))))), 3))
    {
        await page.goto(_)
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
    }
    await page.mouse.move(0, 0)
    for await (const _ of await page.locator('iframe:where([id^=google_ads_iframe_], [src^="https://googleads.g.doubleclick.net"])').all().then(_ => _.map(_ => _.frameLocator(':scope').locator('a[href*=adurl]'))))
    {
        if (await _.count())
        {
            await page.goto(new globalThis.URL(await _.first().getAttribute('href')).searchParams.get('adurl'))
            break
        }
    }
    await page.goto('chrome://history')
    campaign.screenshot = new globalThis.Blob([await page.screenshot()])
    await context.close()
    await fs.rm(tmp, {recursive:true})
},*/

async 223045308(campaign)
{
    if (/history/i.test(campaign.ProofInstructions)) [campaign.text, campaign.screenshot] = await history(await new Template(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions))
    else
    {
        const url = campaign.Instructions.split('\r\n').find(_ => _.startsWith('1.')).match(/\b(https:\/\/)?\w+\.\w+\/\w+\b/g).at(0)
        const response = await globalThis.fetch(url.startsWith('http') ? url : 'https://' + url)
        const origin = new globalThis.URL(response.url.includes('google') ? new globalThis.URL(response.url).searchParams.get('url') : response.url.match(/(?<=RU=)[-:/.\w]+(?=\/\/)/g).at(0)).origin
        if (globalThis.Object.is(origin, 'https://picca.co'))
        {
            const document = await jsdom.JSDOM.fromURL(origin, {virtualConsole}).then(_ => _.window.document)
            for (const _ of lodash.sampleSize(globalThis.Array.from(new globalThis.Set(globalThis.Array.from(document.querySelectorAll('link'), _ => _.href))), campaign.TimeLimit))
            {
                await globalThis.fetch(_).then(_ => _.text())
                await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
            }
            const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tmp')) 
            const context = await playwright.chromium.launchPersistentContext(tmp, {channel:'chrome', args:['--disable-blink-features=AutomationControlled', '--start-maximized'], headless:false, viewport:null})//default_args https://github.com/microsoft/playwright/blob/5faf6f9e69c2148e94c81675fb636eb31a02b5e7/src%2Fserver%2Fchromium%2Fchromium.ts#L78
            context.setDefaultTimeout(0)
            const page = await context.newPage()
            await page.goto(origin)
            campaign.screenshot = new globalThis.Blob([await page.screenshot()], {type:'image/png'})
            await context.close()
            await fs.rm(tmp, {recursive:true})
        }
        else
        {
            [campaign.text, campaign.screenshot] = await history(await new class extends Template
            {
                constructor()
                {
                    super(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions).then(_ => _.ProofInstruction.hsistory = true)
                }
            })
        }
    }
},

/*async 223054031(campaign)
{
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tmp')) 
    const context = await playwright.chromium.launchPersistentContext(tmp, {channel:'chrome', args:['--disable-blink-features=AutomationControlled', '--start-maximized'], headless:false, viewport:null})//default_args https://github.com/microsoft/playwright/blob/5faf6f9e69c2148e94c81675fb636eb31a02b5e7/src%2Fserver%2Fchromium%2Fchromium.ts#L78
    context.setDefaultTimeout(0)
    const page = await context.newPage()
    const instruction = campaign.Instructions.split('\r\n')
    await page.goto('https://' + new globalThis.URL(await page.goto(await globalThis.fetch(instruction.find(_ => _.startsWith('1.')).split(' ').findLast(_ => !globalThis.Object.is(_, ''))).then(_ => _.url)).then(_ => _.url())).searchParams.get('q'))
    await page.goto(await page.locator(`a[href*=${instruction.find(_ => _.startsWith('3.')).split(/post |\./).at(-2).replaceAll(' ', '-')}]`).first().getAttribute('href'))
    const code = page.locator('strong', {hasText:'Code'})
    while (!await code.count()) await page.goto(await page.locator('a#download').getAttribute('href'))
    campaign.text = await code.textContent()
    await page.mouse.move(0, 0)
    await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 10))
    const adframe = page.frameLocator('iframe[id^=google_ads_iframe_]').first()
    const adlocator = adframe.locator('a:where([href^="https://www.googleadservices.com/pagead/aclk"], [href^="https://ad.doubleclick.net/pcs/click"], [href^="https://www.bing.com/api/v1/mediation/tracking"])')
    while (!await adlocator.count())
    {
        await page.evaluateHandle(_ => googletag.pubads().refresh())
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 5))
    }
    await page.goto(await adlocator.first().getAttribute('href'))
    campaign.screenshot = new globalThis.Blob([await page.screenshot()], {type:'image/png'})
    await context.close()
    await fs.rm(tmp, {recursive:true})
},*/

async 223096694(campaign, buckwall)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions)
        }
    }, buckwall)
},

async 223101460(campaign, buckwall)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions)
        }
    }, buckwall)
},

async 223107289(campaign, buckwall)/////
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions)
        }
    }, buckwall)
},

async 223107270(campaign, buckwall)
{ 
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions)
        }
        destinationExcept(response)
        {
            return ['https://', response.config.url.split(' ').at(0), '.com'].join('')
        }
    }, buckwall)
},

/*async 223170003(campaign)
{
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tmp')) 
    const context = await playwright.chromium.launchPersistentContext(tmp, {channel:'chrome', args:['--disable-blink-features=AutomationControlled', '--start-maximized'], headless:false, viewport:null})//default_args https://github.com/microsoft/playwright/blob/5faf6f9e69c2148e94c81675fb636eb31a02b5e7/src%2Fserver%2Fchromium%2Fchromium.ts#L78
    context.setDefaultTimeout(0)
    const page = await context.newPage()
    await page.goto(campaign.Instructions.split('\r\n').filter(_ => _.startsWith('1.')).at(0).match(/\bhttps:\/\/[/.\w]+\b/g).at(0))
    for (const _ of lodash.sampleSize(globalThis.Array.from(new globalThis.Set(await globalThis.Promise.all(await page.locator(`h3 > a[href^='${new globalThis.URL(page.url()).origin}'][href*='-']`).all().then(_ => _.map(_ => _.getAttribute('href')))))), 7))
    {
        await page.goto(_)
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
    }
    await page.goto('chrome://history')
    campaign.screenshot = new globalThis.Blob([await page.screenshot()])
    await context.close()
    await fs.rm(tmp, {recursive:true})
},

async 223176351(campaign)
{
    const url = campaign.Instructions.split('\r\n').filter(_ => _.startsWith('2.')).at(0).match(/\b\w+\.\w+\b/g).at(0)
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tmp')) 
    const context = await playwright.chromium.launchPersistentContext(tmp, {channel:'chrome', args:['--disable-blink-features=AutomationControlled', '--start-maximized'], headless:false, viewport:null})//default_args https://github.com/microsoft/playwright/blob/5faf6f9e69c2148e94c81675fb636eb31a02b5e7/src%2Fserver%2Fchromium%2Fchromium.ts#L78
    context.setDefaultTimeout(0)
    const page = await context.newPage()
    await page.goto('https://www.google.com/search?q=' + globalThis.encodeURIComponent(url))
    await page.goto(url.startsWith('http') ? url : 'https://' + url)
    for (const _ of lodash.sampleSize(globalThis.Array.from(new globalThis.Set(await globalThis.Promise.all(await page.locator(`h2 > a[href^='${new globalThis.URL(page.url()).origin}'][href*='-']`).all().then(_ => _.map(_ => _.getAttribute('href')))))), 5))
    {
        await page.waitForTimeout(1000 * 60)
        await page.goto(_)
    }
    await page.goto('chrome://history')
    campaign.screenshot = new globalThis.Blob([await page.screenshot()])
    await context.close()
    await fs.rm(tmp, {recursive:true})
},*/

async 223180047(campaign, buckwall)
{ 
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions).then(_ => _.history = true)
        }
    }, buckwall)
},

/*async 223188740(campaign)
{
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tmp'))
    await fs.mkdir(path.join(tmp, 'Default'))
    const db = await sqlite.open({filename:path.join(tmp, 'Default/History'), driver:sqlite3.Database})
    await db.exec(`CREATE TABLE urls(id INTEGER PRIMARY KEY AUTOINCREMENT,url LONGVARCHAR,title LONGVARCHAR,visit_count INTEGER DEFAULT 0 NOT NULL,typed_count INTEGER DEFAULT 0 NOT NULL,last_visit_time INTEGER NOT NULL,hidden INTEGER DEFAULT 0 NOT NULL);
               CREATE TABLE visits(id INTEGER PRIMARY KEY AUTOINCREMENT,url INTEGER NOT NULL,visit_time INTEGER NOT NULL,from_visit INTEGER,external_referrer_url TEXT,transition INTEGER DEFAULT 0 NOT NULL,segment_id INTEGER,visit_duration INTEGER DEFAULT 0 NOT NULL,incremented_omnibox_typed_score BOOLEAN DEFAULT FALSE NOT NULL,opener_visit INTEGER,originator_cache_guid TEXT,originator_visit_id INTEGER,originator_from_visit INTEGER,originator_opener_visit INTEGER,is_known_to_sync BOOLEAN DEFAULT FALSE NOT NULL,consider_for_ntp_most_visited BOOLEAN DEFAULT FALSE NOT NULL,visited_link_id INTEGER DEFAULT 0 NOT NULL)`)
    const url = ['https://', campaign.Instructions.split('\r\n').find(_ => _.startsWith('1.')).split(' ').findLast(_ => !globalThis.Object.is(_, '')), '.com'].join('')
    let document = await jsdom.JSDOM.fromURL('https://www.google.com/search?q=' + globalThis.encodeURIComponent(url), {virtualConsole}).then(_ => _.window.document)
    await db.exec(`insert into urls values(null,'${document.location.href}','${document.title.replaceAll("'", "''")}',0,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0);
                   insert into visits values(null,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0,'',805306376,0,0,0,0,'',0,0,0,0,0,0);
                   update visits set url = id where id = (select count(*) from visits)`)
    await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
    document = await jsdom.JSDOM.fromURL(url, {virtualConsole}).then(_ => _.window.document)
    await db.exec(`insert into urls values(null,'${document.location.href}','${document.title.replaceAll("'", "''")}',0,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0);
                   insert into visits values(null,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0,'',805306376,0,0,0,0,'',0,0,0,0,0,0);
                   update visits set url = id where id = (select count(*) from visits)`)
    await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
    await db.close()
    const context = await playwright.chromium.launchPersistentContext(tmp, {channel:'chrome', args:['--disable-blink-features=AutomationControlled', '--start-maximized'], headless:false, viewport:null})//default_args https://github.com/microsoft/playwright/blob/5faf6f9e69c2148e94c81675fb636eb31a02b5e7/src%2Fserver%2Fchromium%2Fchromium.ts#L78
    context.setDefaultTimeout(0)
    const page = await context.newPage()
    const origin = new globalThis.URL(url).origin
    await page.goto(document.querySelector(`h3 > a[href^='${origin}'][href*='-']`).href)
    await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
    await page.goto(await page.locator('a[href^="https://clck.adskeeper.com"]').first().getAttribute('href'))
    await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
    const addocument = new jsdom.JSDOM(await page.content(), {url:page.url(), virtualConsole}).window.document
    campaign.text = addocument.body.textContent
    for (const _ of lodash.sampleSize(globalThis.Array.from(new globalThis.Set(globalThis.Array.from(addocument.querySelectorAll('a:where([href^=http], [href^="/"])'), _ => _.href))), 5))
    {
        await page.goto((function (href){switch (true){
                            case href.startsWith('http'): return href
                            case href.startsWith('/'): return addocument.location.origin + href
                        }})(_))
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
    }
    await page.goto('chrome://history')
    campaign.screenshot = new globalThis.Blob([await page.screenshot()], {type:'image/png'})
    await context.close()
    await fs.rm(tmp, {recursive:true})
},

async 223217633(campaign)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit)
            this.selector = 'div > a[href*="-"]'
            this.preDuration = 0
            this.periDuration = 30
            this.repeat = 10
            return (async() =>
            {
                this.preurl = [await globalThis.fetch(campaign.Instructions.split(/[12]\./).at(1).split(' ').findLast(_ => !globalThis.Object.is(_, ''))).then(_ => _.url)]
        const image = await jsdom.JSDOM.fromURL(campaign.Instructions.split(/[23]\./).at(1).split(' ').findLast(_ => !globalThis.Object.is(_, '')), {virtualConsole, resources}).then(_ => _.window.document.querySelector('meta[property="og:image"]').content)
                const worker = await tesseract.createWorker()
                const line = await worker.recognize(image).then(_ => _.data.lines.at(4))
                const origin = 'https://'  + await worker.recognize(image, {rectangle:{top:line.bbox.y0, left:line.bbox.x0, height:(line.bbox.y1 - line.bbox.y0), width:(line.words.at(3).bbox.x0 - line.bbox.x0)}}).then(_ => _.data.text.split('//').at(-1).replaceAll(' ','').trim())
                await worker.terminate()
            this.preurl.push(origin)
                this.url = this.preurl.at(-1)
            return this
            })()
        }
        async text(addocument, db)
    {
            return await db.all(`select * from urls where url like '${this.url}%'`).then(_ => _.map(_ => _.url).join('\n'))
        }
    })
},

async 223227749(campaign)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit)
            this.selector = 'h2 > a[href*="-"]'
            this.preDuration = 0
            this.periDuration = 30
            this.repeat = 5
            return (async() =>
            {
                this.preurl = [campaign.Instructions.split('\r\n').find(_ => _.startsWith('1.')).split(' ').at(-1)]
                this.preurl.push(await jsdom.JSDOM.fromURL(this.preurl.at(-1), {virtualConsole}).then(_ => _.window.document.querySelector('a[data-tracking-control-name="external_url_click"]').href))
                this.url = new globalThis.URL(this.preurl.at(-1)).origin
        return this
            })()
        }
    })
},

async 223282567(campaign)
{
    [campaign.text, campaign.screenshot] = await history(new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit, campaign.Instructions)
            this.box = true
    }
    destination()
    {
                const query = campaign.Instructions.split('\r\n').find(_ => _.startsWith('1.')).split(' ').at(-1)
        this.url = await jsdom.JSDOM.fromURL(query, {virtualConsole}).then(_ => _.window.document.querySelector('a[aria-describedby]').href)
                this.url = new globalThis.URL(this.url).origin
        return this
        }
    })
},*/

async 223281817(campaign, buckwall)
{
    await advertisers[223180047](campaign, buckwall)
},

/*async 223322630(campaign)
{
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tmp')) 
    const context = await playwright.chromium.launchPersistentContext(tmp, {channel:'chrome', args:['--disable-blink-features=AutomationControlled', '--start-maximized'], headless:false, viewport:null})//default_args https://github.com/microsoft/playwright/blob/5faf6f9e69c2148e94c81675fb636eb31a02b5e7/src%2Fserver%2Fchromium%2Fchromium.ts#L78
    context.setDefaultTimeout(0)
    const page = await context.newPage()
    await page.goto(campaign.Instructions.split('\r\n').find(_ => _.startsWith('1.')).split(' ').filter(_ => !globalThis.Object.is(_, '')).at(-1))
    const origin = new globalThis.URL(await page.goto('https://hausaten.com/category/insurance').then(_ => _.url())).origin
    const document = await jsdom.JSDOM.fromURL(origin, {virtualConsole}).then(_ => _.window.document)
    for (const _ of lodash.sampleSize(globalThis.Array.from(new globalThis.Set(globalThis.Array.from(document.querySelectorAll(`h2 > a[href^='${origin}'][href*='-']`), _ => _.href))), 4))
    {
        await page.goto(_)
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
    }
    const client = document.querySelector('script[src^="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-"]').src.split(/[=&]/).at(1)
    let adhref = null
    while (!(adhref = await jsdom.JSDOM.fromURL(`https://googleads.g.doubleclick.net/pagead/ads?client=${client}&format=1045x280&url=${globalThis.encodeURIComponent(origin)}`, {resources}).then(_ => _.window.document.querySelector('a')?.href)));
    await page.goto(adhref)
    campaign.text = await page.content()
    await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
    for (const _ of lodash.sampleSize(globalThis.Array.from(new globalThis.Set(globalThis.Array.from(new jsdom.JSDOM(await page.content()).window.document.querySelectorAll('a[href^=http]'), _ => _.href))), 2))
    {
        await page.goto(_)
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
    }
    await page.goto('chrome://history')
    campaign.screenshot = new globalThis.Blob([await page.screenshot()], {type:'image/png'})
    await context.close()
    await fs.rm(tmp, {recursive:true})
},*/

//curl 'https://twitter.com/i/api/graphql/VgitpdpNZ-RUIp5D1Z_D-A/UserTweets?variables=%7B%22userId%22%3A%223322450301%22%2C%22count%22%3A20%2C%22cursor%22%3A%22DAABCgABF_78E3Z___kIAAMAAAACAAA%22%2C%22includePromotedContent%22%3Atrue%2C%22withQuickPromoteEligibilityTweetFields%22%3Atrue%2C%22withVoice%22%3Atrue%2C%22withV2Timeline%22%3Atrue%7D&features=%7B%22responsive_web_graphql_exclude_directive_enabled%22%3Atrue%2C%22verified_phone_label_enabled%22%3Afalse%2C%22responsive_web_home_pinned_timelines_enabled%22%3Atrue%2C%22creator_subscriptions_tweet_preview_api_enabled%22%3Atrue%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Atrue%2C%22responsive_web_graphql_skip_user_profile_image_extensions_enabled%22%3Afalse%2C%22c9s_tweet_anatomy_moderator_badge_enabled%22%3Atrue%2C%22tweetypie_unmention_optimization_enabled%22%3Atrue%2C%22responsive_web_edit_tweet_api_enabled%22%3Atrue%2C%22graphql_is_translatable_rweb_tweet_is_translatable_enabled%22%3Atrue%2C%22view_counts_everywhere_api_enabled%22%3Atrue%2C%22longform_notetweets_consumption_enabled%22%3Atrue%2C%22responsive_web_twitter_article_tweet_consumption_enabled%22%3Afalse%2C%22tweet_awards_web_tipping_enabled%22%3Afalse%2C%22freedom_of_speech_not_reach_fetch_enabled%22%3Atrue%2C%22standardized_nudges_misinfo%22%3Atrue%2C%22tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled%22%3Atrue%2C%22longform_notetweets_rich_text_read_enabled%22%3Atrue%2C%22longform_notetweets_inline_media_enabled%22%3Atrue%2C%22responsive_web_media_download_video_enabled%22%3Afalse%2C%22responsive_web_enhance_cards_enabled%22%3Afalse%7D'   -H 'authorization: Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA'   -H 'cookie:auth_token=d32ad463b66ea23e4e0520f4f64d75e6486e8587; ct0=9a6212228d141b77c8e34326d89c36a56c12a4204c2e6bd75bc9408bfd0fe9094d141154ecfc456d24d3080efb1db97797d7a30785a1424f3241b9393a7764eb1a1d7f2bfffe0b9771ccebc2037e8f5b'    -H 'x-csrf-token: 9a6212228d141b77c8e34326d89c36a56c12a4204c2e6bd75bc9408bfd0fe9094d141154ecfc456d24d3080efb1db97797d7a30785a1424f3241b9393a7764eb1a1d7f2bfffe0b9771ccebc2037e8f5b'

/*async 223329148(campaign)
{
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tmp'))
    const context = await playwright.chromium.launchPersistentContext(tmp, {channel:'chrome', args:['--disable-blink-features=AutomationControlled', '--start-maximized'], headless:false, viewport:null})//default_args https://github.com/microsoft/playwright/blob/5faf6f9e69c2148e94c81675fb636eb31a02b5e7/src%2Fserver%2Fchromium%2Fchromium.ts#L78
    context.setDefaultTimeout(0)
    const page = await context.newPage()
    await page.goto('https://www.youtube.com/watch?v=' + await jsdom.JSDOM.fromURL(campaign.Instructions.split('\r\n').find(_ => _.startsWith('1.')).split(' ').find(_ => _.includes('http')), {virtualConsole, runScripts:'dangerously'}).then(_ => _.window.ytInitialData.contents.singleColumnBrowseResultsRenderer.tabs.at(0).tabRenderer.content.sectionListRenderer.contents.at(0).shelfRenderer.content.verticalListRenderer.items.at(0).compactVideoRenderer.videoId))
    const video = page.locator('video')
    await video.evaluateHandle(_ => _.play())
    await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 10))
    await video.evaluateHandle(_ => _.currentTime = 120)
    campaign.screenshot = new globalThis.Blob([await page.screenshot()], {type:'image/png'})
    await context.close()
    await fs.rm(tmp, {recursive:true})
    await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60 * campaign.TimeLimit))
},

async 223333396(campaign)
{
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tmp'))
    await fs.mkdir(path.join(tmp, 'Default'))
    const db = await sqlite.open({filename:path.join(tmp, 'Default/History'), driver:sqlite3.Database})
    await db.exec(`CREATE TABLE urls(id INTEGER PRIMARY KEY AUTOINCREMENT,url LONGVARCHAR,title LONGVARCHAR,visit_count INTEGER DEFAULT 0 NOT NULL,typed_count INTEGER DEFAULT 0 NOT NULL,last_visit_time INTEGER NOT NULL,hidden INTEGER DEFAULT 0 NOT NULL);
               CREATE TABLE visits(id INTEGER PRIMARY KEY AUTOINCREMENT,url INTEGER NOT NULL,visit_time INTEGER NOT NULL,from_visit INTEGER,external_referrer_url TEXT,transition INTEGER DEFAULT 0 NOT NULL,segment_id INTEGER,visit_duration INTEGER DEFAULT 0 NOT NULL,incremented_omnibox_typed_score BOOLEAN DEFAULT FALSE NOT NULL,opener_visit INTEGER,originator_cache_guid TEXT,originator_visit_id INTEGER,originator_from_visit INTEGER,originator_opener_visit INTEGER,is_known_to_sync BOOLEAN DEFAULT FALSE NOT NULL,consider_for_ntp_most_visited BOOLEAN DEFAULT FALSE NOT NULL,visited_link_id INTEGER DEFAULT 0 NOT NULL)`)
    const google = '1. Go to google.com and Search This Line on Google :' 
    if (campaign.Instructions.includes(google))
    {
        const query = campaign.Instructions.split(new globalThis.RegExp(google + globalThis.String.raw`|2\.`)).at(1).split('\r\n').findLast(_ => !globalThis.Object.is(_, ''))
    let document = await jsdom.JSDOM.fromURL('https://www.google.com/search?q=' + globalThis.encodeURIComponent(query), {virtualConsole}).then(_ => _.window.document)
        await db.exec(`insert into urls values(null,'${document.location.href}','${document.title.replaceAll("'", "''")}',0,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0);
                       insert into visits values(null,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0,'',805306376,0,0,0,0,'',0,0,0,0,0,0);
                       update visits set url = id where id = (select count(*) from visits)`)
    document = await jsdom.JSDOM.fromURL(['https:/', campaign.Instructions.split(/2\.|Visit/).at(1).match(/\b\w+\.\w+\b/g).at(0), query.split(' ').slice(0, -1).map(_ => _.replaceAll(/[^-\w]/g, '')).join('-')].join('/'), {virtualConsole}).then(_ => _.window.document)
        await db.exec(`insert into urls values(null,'${document.location.href}','${document.title.replaceAll("'", "''")}',0,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0);
                       insert into visits values(null,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0,'',805306376,0,0,0,0,'',0,0,0,0,0,0);
                       update visits set url = id where id = (select count(*) from visits)`)
    }
    else
    {
        const document = await jsdom.JSDOM.fromURL(campaign.Instructions.split(/[12]\./).at(1).match(/\bhttps:\/\/[/.\w]+\b/g).at(0), {virtualConsole}).then(_ => _.window.document)
        await db.exec(`insert into urls values(null,'${document.location.href}','${document.title.replaceAll("'", "''")}',0,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0);
                       insert into visits values(null,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0,'',805306376,0,0,0,0,'',0,0,0,0,0,0);
                       update visits set url = id where id = (select count(*) from visits)`)
    }
    await db.close()
    const context = await playwright.chromium.launchPersistentContext(tmp, {channel:'chrome', args:['--disable-blink-features=AutomationControlled', '--start-maximized'], headless:false, viewport:null})//default_args https://github.com/microsoft/playwright/blob/5faf6f9e69c2148e94c81675fb636eb31a02b5e7/src%2Fserver%2Fchromium%2Fchromium.ts#L78
    const page = await context.newPage()
    await page.goto('chrome://history')
    campaign.screenshot = new globalThis.Blob([await page.screenshot()], {type:'image/png'})
    await context.close()
    await fs.rm(tmp, {recursive:true})
    await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
},

async 223346498(campaign)
{
    const origin = new globalThis.URL(new globalThis.URL(await globalThis.fetch(campaign.Instructions.split('\r\n').find(_ => _.startsWith('1')).split(' ').at(-1)).then(_ => _.url)).searchParams.get('q')).origin
    const document = await jsdom.JSDOM.fromURL(origin, {virtualConsole}).then(_ => _.window.document)
    for (const _ of lodash.sampleSize(globalThis.Array.from(new globalThis.Set(globalThis.Array.from(document.querySelectorAll(`h2 > a[href^='${origin}'][href*='-']`), _ => _.href))), campaign.TimeLimit))
    {
        await globalThis.fetch(_).then(_ => _.text())
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
    }
    const client = document.querySelector('script[src^="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-"]').src.split(/[=&]/).at(1)
    let adhref = null
    while (!(adhref = await jsdom.JSDOM.fromURL(`https://googleads.g.doubleclick.net/pagead/ads?client=${client}&format=1045x280&url=${globalThis.encodeURIComponent(origin)}`, {resources}).then(_ => _.window.document.querySelector('a')?.href)));
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tmp')) 
    const context = await playwright.chromium.launchPersistentContext(tmp, {channel:'chrome', args:['--disable-blink-features=AutomationControlled', '--start-maximized'], headless:false, viewport:null})//default_args https://github.com/microsoft/playwright/blob/5faf6f9e69c2148e94c81675fb636eb31a02b5e7/src%2Fserver%2Fchromium%2Fchromium.ts#L78
    context.setDefaultTimeout(0)
    const page = await context.newPage()
    await page.goto(adhref)
    campaign.screenshot = new globalThis.Blob([await page.screenshot()], {type:'image/png'})
    const addocument = new jsdom.JSDOM(await page.content(), {url:page.url(), virtualConsole}).window.document
    await context.close()
    await fs.rm(tmp, {recursive:true})
    for (const _ of lodash.sampleSize(globalThis.Array.from(new globalThis.Set(globalThis.Array.from(addocument.querySelectorAll('a:where([href^=http], [href^="/"])'), _ => _.href))), 2))
    {
        await globalThis.fetch((function (href){switch (true){
                                    case href.startsWith('http'): return href
                                    case href.startsWith('/'): return addocument.location.origin + href
                                }})(_)).then(_ => _.text())
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 30))
    }
},

async 223346955(campaign)
{
    await globalThis.fetch(campaign.Instructions.split('\r\n').find(_ => _.startsWith('1')).match(/https:\/\/[/.\w]+/g).at(0)).then(_ => _.url)
    await globalThis.fetch('https://edumags.com/usa-scholarships-for-international-students').then(_ => _.text())
    const origin = 'https://edumags.com'
    const document = await jsdom.JSDOM.fromURL(origin, {virtualConsole}).then(_ => _.window.document)
    for (const _ of lodash.sampleSize(globalThis.Array.from(new globalThis.Set(globalThis.Array.from(document.querySelectorAll(`p > a[href^='${origin}'][href*='-']`), _ => _.href))), 6))
    {
        await globalThis.fetch(_).then(_ => _.text())
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
    }
    const client = document.querySelector('script[src^="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-"]').src.split(/[=&]/).at(1)
    let adhref = null
    while (!(adhref = await jsdom.JSDOM.fromURL(`https://googleads.g.doubleclick.net/pagead/ads?client=${client}&format=1045x280&url=${globalThis.encodeURIComponent(origin)}`, {resources}).then(_ => _.window.document.querySelector('a')?.href)));
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tmp')) 
    const context = await playwright.chromium.launchPersistentContext(tmp, {channel:'chrome', args:['--disable-blink-features=AutomationControlled', '--start-maximized'], headless:false, viewport:null})//default_args https://github.com/microsoft/playwright/blob/5faf6f9e69c2148e94c81675fb636eb31a02b5e7/src%2Fserver%2Fchromium%2Fchromium.ts#L78
    context.setDefaultTimeout(0)
    const page = await context.newPage()
    await page.goto(adhref)
    campaign.screenshot = new globalThis.Blob([await page.screenshot()], {type:'image/png'})
    const addocument = new jsdom.JSDOM(await page.content(), {url:page.url(), virtualConsole}).window.document
    await context.close()
    await fs.rm(tmp, {recursive:true})
    for (const _ of lodash.sampleSize(globalThis.Array.from(new globalThis.Set(globalThis.Array.from(addocument.querySelectorAll('a:where([href^=http], [href^="/"])'), _ => _.href))), 2))
    {
        await globalThis.fetch((function (href){switch (true){
                                    case href.startsWith('http'): return href
                                    case href.startsWith('/'): return addocument.location.origin + href
                                }})(_)).then(_ => _.text())
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 30))
    }
},*/

async 223358343(campaign, buckwall)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions)
        }
        destinationLast(document)
        {
            return globalThis.Object.is(document.location.href, 'https://idealmedhealth.blogspot.com/2023/11/innovative-technologies-in.html') ? document.querySelector(`a[href^='${document.location.origin.split(".").toSpliced(1, 1).join(".")}'][href*='-']:not([href$=html])`).href : document.location.href
        }
    }, buckwall)
},

async 223378575(campaign, buckwall)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions).then(_ => {
            _.periDuration = 60
            _.repeat = 3})
        }
    }, buckwall)
},

async 223402294(campaign, buckwall)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions)
            this.advertisement = /DO NOT CLICK ON AD/.test(this.Instructions)
        }
    }, buckwall)
},

async 223467039(campaign, buckwall)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions).then(_ => _.history = false)
        }
        destination(db)
        {
            return 'https://' + this.Instructions.split(/\r?\n/).find(_ => _.startsWith('1.')).split(' ').at(-1)
        }
    }, buckwall)
},

//if (url.includes('bit.ly'))
//    {
//        await page.goto(url)
//        await page.goto('https://' + new globalThis.URL(page.url()).searchParams.get('q').split(':').at(-1))
//        for (const _ of lodash.sampleSize(globalThis.Array.from(new globalThis.Set(await globalThis.Promise.all(await page.locator(`h2 > a[href^='${new globalThis.URL(page.url()).origin}'][href*='-']`).all().then(_ => _.map(_ => _.getAttribute('href')))))), 10))
//        {
//            await page.goto(_)
//            await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 20))
//        }
//   }

async 223439993(campaign, buckwall)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions).then(_ => {
            _.preDuration = 1
            _.periDuration = 0
            _.repeat = 0})
        }
    }, buckwall)
},

async 223442471(campaign, buckwall)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions).then(_ => _.history = false)
        }
    }, buckwall)
},

/*async 223494841(campaign)
{
    //await screenshots[223378575](campaign)
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit)
            this.selector = 'li > a[href*="-"]'
            this.preDuration = 0
            this.periDuration = 20
            this.repeat = 5
            return (async() =>
            {
                this.preurl = [await globalThis.fetch(campaign.Instructions.split('\r\n').find(_ => _.startsWith('1.')).split(' ').at(-1)).then(_ => _.url)]
            this.url = new globalThis.URL(this.preurl.at(-1)).origin
            return this
            })()
        }
    })
},

async 223497890(campaign)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit)
            this.selector = 'h2 > a[href*="-"]'
            this.preDuration = 1 
            this.periDuration = 45
            this.repeat = 6
            return (async() =>
            {
                this.preurl = [campaign.Instructions.split('\r\n').find(_ => _.startsWith('1.')).split(' ').at(-1)]
                this.preurl.push('https://' + campaign.Instructions.split('\r\n').find(_ => _.startsWith('3.')).split(' ').at(-1))
        this.url = new globalThis.URL(this.preurl.at(-1)).origin
        return this
            })()
        }
        client(document, post)
        {
            const searchParams = new globalThis.URL(document.querySelector('iframe').src).searchParams
            return [searchParams.get('client'), searchParams.get('url')]
        }
    })
},

async 223507684(campaign)
{
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tmp'))
    await fs.mkdir(path.join(tmp, 'Default'))
    const db = await sqlite.open({filename:path.join(tmp, 'Default/History'), driver:sqlite3.Database})
    await db.exec(`CREATE TABLE urls(id INTEGER PRIMARY KEY AUTOINCREMENT,url LONGVARCHAR,title LONGVARCHAR,visit_count INTEGER DEFAULT 0 NOT NULL,typed_count INTEGER DEFAULT 0 NOT NULL,last_visit_time INTEGER NOT NULL,hidden INTEGER DEFAULT 0 NOT NULL);
               CREATE TABLE visits(id INTEGER PRIMARY KEY AUTOINCREMENT,url INTEGER NOT NULL,visit_time INTEGER NOT NULL,from_visit INTEGER,external_referrer_url TEXT,transition INTEGER DEFAULT 0 NOT NULL,segment_id INTEGER,visit_duration INTEGER DEFAULT 0 NOT NULL,incremented_omnibox_typed_score BOOLEAN DEFAULT FALSE NOT NULL,opener_visit INTEGER,originator_cache_guid TEXT,originator_visit_id INTEGER,originator_from_visit INTEGER,originator_opener_visit INTEGER,is_known_to_sync BOOLEAN DEFAULT FALSE NOT NULL,consider_for_ntp_most_visited BOOLEAN DEFAULT FALSE NOT NULL,visited_link_id INTEGER DEFAULT 0 NOT NULL)`)
    const query = campaign.Instructions.split('\r\n').find(_ => _.startsWith('1.')).split('Find the title').at(-1)
    let document = await jsdom.JSDOM.fromURL('https://www.google.com/search?q=' + globalThis.encodeURIComponent(query), {virtualConsole}).then(_ => _.window.document)
    await db.exec(`insert into urls values(null,'${document.location.href}','${document.title.replaceAll("'", "''")}',0,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0);
                   insert into visits values(null,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0,'',805306376,0,0,0,0,'',0,0,0,0,0,0);
                   update visits set url = id where id = (select count(*) from visits)`)
    const url = ['https:/', query.split('-').at(-1).trim(), query.split('-').at(0).slice(0, -1).trim().replaceAll(' ', '-')].join('/')
    document = await jsdom.JSDOM.fromURL(url, {virtualConsole}).then(_ => _.window.document)
    await db.exec(`insert into urls values(null,'${document.location.href}','${document.title.replaceAll("'", "''")}',0,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0);
                   insert into visits values(null,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0,'',805306376,0,0,0,0,'',0,0,0,0,0,0);
                   update visits set url = id where id = (select count(*) from visits)`)
    let next = null
    while (globalThis.Object.is((next = document.querySelector('a.button')).textContent, 'Next Article'))
    {
        document = await jsdom.JSDOM.fromURL(next.href, {virtualConsole}).then(_ => _.window.document)
        await db.exec(`insert into urls values(null,'${document.location.href}','${document.title.replaceAll("'", "''")}',0,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0);
                       insert into visits values(null,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0,'',805306376,0,0,0,0,'',0,0,0,0,0,0);
                       update visits set url = id where id = (select count(*) from visits)`)

        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * document.querySelector('span#countdown').textContent.match(/\b[0-9]+\b/g).at(0)))
    }    
    campaign.text = next.textContent
    const context = await playwright.chromium.launchPersistentContext(tmp, {channel:'chrome', args:['--disable-blink-features=AutomationControlled', '--start-maximized'], headless:false, viewport:null})//default_args https://github.com/microsoft/playwright/blob/5faf6f9e69c2148e94c81675fb636eb31a02b5e7/src%2Fserver%2Fchromium%2Fchromium.ts#L78
    context.setDefaultTimeout(0)
    const page = await context.newPage()
    await page.goto(next.href)
    await page.mouse.move(0, 0)
    await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 10))
    const adframe = page.frameLocator('iframe[id^=google_ads_iframe_]').first()
    const adlocator = adframe.locator('a:where([href^="https://www.googleadservices.com/pagead/aclk"], [href^="https://ad.doubleclick.net/pcs/click"], [href^="https://www.bing.com/api/v1/mediation/tracking"])')
    while (!await adlocator.count())
    {
        await page.evaluateHandle(_ => googletag.pubads().refresh())
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 5))
    }
    await page.goto(await adlocator.first().getAttribute('href'))
    await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
    const addocument = new jsdom.JSDOM(await page.content(), {url:page.url(), virtualConsole}).window.document
    for (const _ of lodash.sampleSize(globalThis.Array.from(new globalThis.Set(globalThis.Array.from(addocument.querySelectorAll('a:where([href^=http], [href^="/"])'), _ => _.href))), 2))
    {
        await page.goto((function (href){switch (true){
                            case href.startsWith('http'): return href
                            case href.startsWith('/'): return addocument.location.origin + href
                        }})(_))
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 30))
    }
    await page.goto('chrome://history')
    campaign.screenshot = new globalThis.Blob([await page.screenshot()], {type:'image/png'})
    await context.close()
    await fs.rm(tmp, {recursive:true})
},

async 223552439(campaign)
{
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tmp')) 
    const context = await playwright.chromium.launchPersistentContext(tmp, {channel:'chrome', args:['--disable-blink-features=AutomationControlled', '--start-maximized'], headless:false, viewport:null})//default_args https://github.com/microsoft/playwright/blob/5faf6f9e69c2148e94c81675fb636eb31a02b5e7/src%2Fserver%2Fchromium%2Fchromium.ts#L78
    context.setDefaultTimeout(0)
    const page = await context.newPage()
    await page.goto(campaign.Instructions.split('\r\n').find(_ => _.startsWith('1.')).split(' ').at(-1))
    const clickHere = await page.locator('a:has(img[src^="https://blogger.googleusercontent.com/img/b/R29vZ2xl"][data-original-height])').getAttribute('href')
    await page.goto(clickHere.startsWith('http') ? clickHere : 'http:' + clickHere)
    await page.goto('chrome://history')
    campaign.screenshot = new globalThis.Blob([await page.screenshot()])
    await context.close()
    await fs.rm(tmp, {recursive:true})
},*/

/*async 223553262(campaign)
{
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tmp')) 
    const context = await playwright.chromium.launchPersistentContext(tmp, {channel:'chrome', args:['--disable-blink-features=AutomationControlled', '--start-maximized'], headless:false, viewport:null})//default_args https://github.com/microsoft/playwright/blob/5faf6f9e69c2148e94c81675fb636eb31a02b5e7/src%2Fserver%2Fchromium%2Fchromium.ts#L78
    context.setDefaultTimeout(0)
    const page = await context.newPage()
    let origin = null
    if (globalThis.Object.is(campaign.Id, '150894'))
    {
        const two = campaign.Instructions.split('\r\n').find(_ => _.startsWith('2.'))
        const query = two.split(',').at(1).trim()
        const image = await jsdom.JSDOM.fromURL(two.split(' ').at(-1), {virtualConsole}).then(_ => _.window.document.querySelector('meta[property="og:image"]').content.split('?').at(0))
        await page.goto('https://www.google.com/search?q=' + globalThis.encodeURIComponent(query))
        const worker = await tesseract.createWorker()
        const bbox = await worker.recognize(image).then(_ => _.data.lines.at(1).words.at(0).bbox)
        origin = 'https://' + await worker.recognize(image, {rectangle:{top:bbox.y0, left:bbox.x0, height:(bbox.y1 - bbox.y0), width:(bbox.x1 - bbox.x0)}}).then(_ => _.data.text.match(/(?<=:\/\/)[.\w]+(?= )/g).at(0))
        await worker.terminate()
        await page.goto(await page.locator(`a[href^='${origin}']`, {hasText:query}).getAttribute('href'))
    }
    else if (globalThis.Object.is(campaign.Id, '143554'))
    {
        await page.goto(campaign.Instructions.split('\r\n').find(_ => _.startsWith('1.')).match(/\bhttps:\/\/[/.\w]+\b/g).at(0))
        origin = new globalThis.URL(await page.goto(await page.locator('shreddit-aspect-ratio > a').getAttribute('href')).then(_ => _.url())).origin
    }
    const document = await jsdom.JSDOM.fromURL(origin, {virtualConsole}).then(_ => _.window.document)
    for (const _ of lodash.sampleSize(globalThis.Array.from(new globalThis.Set(globalThis.Array.from(document.querySelectorAll(`h3 > a[href^='${origin}'][href*='-']`), _ => _.href))), 3))
    {
        await page.goto(_)
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
    }
    campaign.text = await page.content()
    const client = await page.locator('script[src^="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-"]').first().getAttribute('src').then(_ => _.split(/[=&]/).at(1))
    let adhref = null
    while (!(adhref = await jsdom.JSDOM.fromURL(`https://googleads.g.doubleclick.net/pagead/ads?client=${client}&format=1045x280&url=${globalThis.encodeURIComponent(origin)}`, {resources}).then(_ => _.window.document.querySelector('a')?.href)));
    await page.goto(adhref)
    await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60 * 2))
    const addocument = new jsdom.JSDOM(await page.content(), {url:page.url(), virtualConsole}).window.document
    for (const _ of lodash.sampleSize(globalThis.Array.from(new globalThis.Set(globalThis.Array.from(addocument.querySelectorAll('a:where([href^=http], [href^="/"])'), _ => _.href))), 2))
    {
        await page.goto((function (href){switch (true){
                            case href.startsWith('http'): return href
                            case href.startsWith('/'): return addocument.location.origin + href
                        }})(_))
        campaign.text += ' ' + await page.content()
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
    }
    await page.goto('chrome://history')
    campaign.screenshot = new globalThis.Blob([await page.screenshot()], {type:'image/png'})
    await context.close()
    await fs.rm(tmp, {recursive:true})
},*/

/*async 223570830(campaign)
{
    if (campaign.Instructions.split('\r\n').find(_ => _.startsWith('1:')).match(/1: Go to Google and search (\w+) Then Open \1 com site./)) await screenshots[223626563](campaign)
    else
    {
        const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tmp')) 
        const context = await playwright.chromium.launchPersistentContext(tmp, {channel:'chrome', args:['--disable-blink-features=AutomationControlled', '--start-maximized'], headless:false, viewport:null})//default_args https://github.com/microsoft/playwright/blob/5faf6f9e69c2148e94c81675fb636eb31a02b5e7/src%2Fserver%2Fchromium%2Fchromium.ts#L78
        context.setDefaultTimeout(0)
        const page = await context.newPage()
        const url = 'https://' + campaign.Instructions.split('\r\n').find(_ => _.startsWith('1:')).split(' ').slice(-3, -1).join('.') 
        await page.goto('https://www.google.com/search?q=' + globalThis.encodeURIComponent(url))
        const origin = new globalThis.URL(await page.goto(url).then(_ => _.url())).origin
        const document = new jsdom.JSDOM(await page.content(), {virtualConsole}).window.document
        for (const _ of lodash.sampleSize(globalThis.Array.from(new globalThis.Set(globalThis.Array.from(document.querySelectorAll(`:where(h2, h3) > a[href^='${origin}'][href*='-']`), _ => _.href))), 6))
        {
            await page.goto(_)
            await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 30))
        }
        await page.mouse.move(0, 0)
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 10))
        const adframe = page.frameLocator('iframe[id^=google_ads_iframe_]').first()
        const adlocator = adframe.locator('a:where([href^="https://www.googleadservices.com/pagead/aclk"], [href^="https://ad.doubleclick.net/pcs/click"], [href^="https://www.bing.com/api/v1/mediation/tracking"])')
        while (!await adlocator.count())
        {
            await page.evaluateHandle(_ => googletag.pubads().refresh())
            await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 5))
        }
        await page.goto(await adlocator.first().getAttribute('href'))
        const addocument = new jsdom.JSDOM(await page.content(), {url:page.url(), virtualConsole}).window.document
        for (const _ of lodash.sampleSize(globalThis.Array.from(new globalThis.Set(globalThis.Array.from(addocument.querySelectorAll('a:where([href^=http], [href^="/"])'), _ => _.href))), 2))
        {
            await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 30))
            await page.goto((function (href){switch (true){
                                case href.startsWith('http'): return href
                                case href.startsWith('/'): return addocument.location.origin + href
                            }})(_))
        }
        await page.goto('chrome://history')
        campaign.screenshot = new globalThis.Blob([await page.screenshot()], {type:'image/png'})
        await context.close()
        await fs.rm(tmp, {recursive:true})
    }
},*/

async 223618968(campaign, buckwall)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions).then(_ => _.adRepeat = 4)
        }
    }, buckwall)
},

/*async 223626563(campaign)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit)
            this.selector = ':where(h2, h3) > a[href*="-"]'
            this.preDuration = 0
            this.periDuration = 60
            this.repeat = 2
            return (async() =>
            {
                const url = campaign.Instructions.split('\r\n').find(_ => _.startsWith('1:')).matchAll(/1: Go to Google and search (\w+) Then Open \1 com site./g).next().value.at(1)
                this.preurl = ['https://www.google.com/search?q=' + globalThis.encodeURIComponent(url)]
                this.preurl.push(`https://${url}.com`)
            this.url = this.preurl.at(-1)
            return this
            })()
        }
    })
},

async 223627205(campaign)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit)
            this.selector = 'h3 > a[href*="-"]'
            this.preDuration = campaign.TimeLimit
            this.periDuration = 0
            this.repeat = 0
            return (async() =>
            {
                this.preurl =['https://www.google.com/search?q=' + globalThis.encodeURIComponent(campaign.Instructions.split('\r\n').find(_ => _.startsWith('2.')).split('Search for the keyword as ').at(-1).slice(0, -1))]
                let google = null
        while (!(google = await jsdom.JSDOM.fromURL(this.preurl.at(-1), { virtualConsole, resources }).then(_ => _.window.document.querySelector(`a[href^='${campaign.Instructions.split('\r\n').find(_ => _.startsWith('3.')).split(/,| /).find(_ => _.includes('http'))}']`)?.href)));
        this.preurl.push(google)
            this.url = new globalThis.URL(this.preurl.at(-1)).origin
            return this
            })()
        }
        client(document, post)
        {
            return [document.querySelector('script[src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]').dataset.adClient, document.location.href]
        }
    })
},*/

/*async 223667704(campaign)
{
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tmp'))
    await fs.mkdir(path.join(tmp, 'Default'))
    const db = await sqlite.open({filename:path.join(tmp, 'Default/History'), driver:sqlite3.Database})
    await db.exec(`CREATE TABLE urls(id INTEGER PRIMARY KEY AUTOINCREMENT,url LONGVARCHAR,title LONGVARCHAR,visit_count INTEGER DEFAULT 0 NOT NULL,typed_count INTEGER DEFAULT 0 NOT NULL,last_visit_time INTEGER NOT NULL,hidden INTEGER DEFAULT 0 NOT NULL);
           CREATE TABLE visits(id INTEGER PRIMARY KEY AUTOINCREMENT,url INTEGER NOT NULL,visit_time INTEGER NOT NULL,from_visit INTEGER,external_referrer_url TEXT,transition INTEGER DEFAULT 0 NOT NULL,segment_id INTEGER,visit_duration INTEGER DEFAULT 0 NOT NULL,incremented_omnibox_typed_score BOOLEAN DEFAULT FALSE NOT NULL,opener_visit INTEGER,originator_cache_guid TEXT,originator_visit_id INTEGER,originator_from_visit INTEGER,originator_opener_visit INTEGER,is_known_to_sync BOOLEAN DEFAULT FALSE NOT NULL,consider_for_ntp_most_visited BOOLEAN DEFAULT FALSE NOT NULL,visited_link_id INTEGER DEFAULT 0 NOT NULL)`)
    const query = await globalThis.fetch(campaign.Instructions.split('\r\n').find(_ => _.startsWith('1.')).split(' ').at(-1)).then(_ => _.url)
    let document = await jsdom.JSDOM.fromURL(query, {virtualConsole}).then(_ => _.window.document)
    await db.exec(`insert into urls values(null,'${document.location.href}','${document.title.replaceAll("'", "''")}',0,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0);
                   insert into visits values(null,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0,'',805306376,0,0,0,0,'',0,0,0,0,0,0);
                   update visits set url = id where id = (select count(*) from visits)`)
    const url = 'https://' + new globalThis.URL(query).searchParams.get('q')
    document = await jsdom.JSDOM.fromURL(url, {virtualConsole}).then(_ => _.window.document)
    await db.exec(`insert into urls values(null,'${document.location.href}','${document.title.replaceAll("'", "''")}',0,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0);
                   insert into visits values(null,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0,'',805306376,0,0,0,0,'',0,0,0,0,0,0);
                   update visits set url = id where id = (select count(*) from visits)`)
    const origin = new globalThis.URL(url).origin
    document = await jsdom.JSDOM.fromURL(globalThis.Array.from([...document.querySelectorAll(`a[href^='${origin}']`)].filter(_ => globalThis.Object.is(_.textContent, campaign.Instructions.split(/[23]\./).at(1).split('\r\n').findLast(_ => !globalThis.Object.is(_, '')))), _ => _.href).at(0), {virtualConsole}).then(_ => _.window.document)
    await db.exec(`insert into urls values(null,'${document.location.href}','${document.title.replaceAll("'", "''")}',0,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0);
                   insert into visits values(null,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0,'',805306376,0,0,0,0,'',0,0,0,0,0,0);
                   update visits set url = id where id = (select count(*) from visits)`)
    let next = null
    while (next = document.querySelector('a#download')?.href)
    {
        document = await jsdom.JSDOM.fromURL(next, {virtualConsole}).then(_ => _.window.document)
        await db.exec(`insert into urls values(null,'${document.location.href}','${document.title.replaceAll("'", "''")}',0,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0);
                       insert into visits values(null,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0,'',805306376,0,0,0,0,'',0,0,0,0,0,0);
                       update visits set url = id where id = (select count(*) from visits)`)
    const wait = 'wait for next post in '
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * globalThis.Array.from(document.querySelectorAll('script'), _ => _.textContent).find(_ => _.includes(wait)).match(new globalThis.RegExp(globalThis.String.raw`(?<=${wait})[0-9]+\b`, 'g')).at(0)))
    }    
    campaign.text = document.querySelector('h3 > strong').textContent
    const context = await playwright.chromium.launchPersistentContext(tmp, {channel:'chrome', args:['--disable-blink-features=AutomationControlled', '--start-maximized'], headless:false, viewport:null})//default_args https://github.com/microsoft/playwright/blob/5faf6f9e69c2148e94c81675fb636eb31a02b5e7/src%2Fserver%2Fchromium%2Fchromium.ts#L78
    context.setDefaultTimeout(0)
    const page = await context.newPage()
    await page.goto(document.location.href)
    await page.mouse.move(0, 0)
    await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 10))
    const adframe = page.frameLocator('iframe[id^=google_ads_iframe_]').first()
    const adlocator = adframe.locator('a:where([href^="https://www.googleadservices.com/pagead/aclk"], [href^="https://ad.doubleclick.net/pcs/click"], [href^="https://www.bing.com/api/v1/mediation/tracking"])')
    while (!await adlocator.count())
    {
        await page.evaluateHandle(_ => googletag.pubads().refresh())
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 5))
    }
    await page.goto(await adlocator.first().getAttribute('href'))
    await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
    const addocument = new jsdom.JSDOM(await page.content(), {url:page.url(), virtualConsole}).window.document
    for (const _ of lodash.sampleSize(globalThis.Array.from(new globalThis.Set(globalThis.Array.from(addocument.querySelectorAll('a:where([href^=http], [href^="/"])'), _ => _.href))), 2))
    {
        await page.goto((function (href){switch (true){
                            case href.startsWith('http'): return href
                            case href.startsWith('/'): return addocument.location.origin + href
                        }})(_))
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 30))
    }
    await page.goto('chrome://history')
    campaign.screenshot = new globalThis.Blob([await page.screenshot()], {type:'image/png'})
    await context.close()
    await fs.rm(tmp, {recursive:true})
},

async 223672499(campaign)
{
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tmp'))
    const context = await playwright.chromium.launchPersistentContext(tmp, {channel:'chrome', args:['--disable-blink-features=AutomationControlled', '--start-maximized'], headless:false, viewport:null})//default_args https://github.com/microsoft/playwright/blob/5faf6f9e69c2148e94c81675fb636eb31a02b5e7/src%2Fserver%2Fchromium%2Fchromium.ts#L78
    await context.addCookies(cookie)
    context.setDefaultTimeout(0)
    const page = await context.newPage()
    await page.goto(await globalThis.fetch(campaign.Instructions.split('\r\n').find(_ => _.startsWith('1.')).split(' ').at(-1)).then(_ => _.text()).then(_ => _.match(/https:\/\/www\.quora\.com\/[-\w]+?(?=\\")/g).at(0)))
    await page.mouse.wheel(0, globalThis.Math.random() * await page.evaluateHandle(() => globalThis.document.documentElement.clientHeight).then(_ => _.jsonValue()))
    campaign.screenshot = new globalThis.Blob([await page.screenshot()], {type:'image/png'})
    await context.close()
    await fs.rm(tmp, {recursive:true})
    await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60 * campaign.TimeLimit))
},

async 223692718(campaign)
{
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tmp')) 
    const context = await playwright.chromium.launchPersistentContext(tmp, {channel:'chrome', args:['--disable-blink-features=AutomationControlled', '--start-maximized'], headless:false, viewport:null})//default_args https://github.com/microsoft/playwright/blob/5faf6f9e69c2148e94c81675fb636eb31a02b5e7/src%2Fserver%2Fchromium%2Fchromium.ts#L78
    context.setDefaultTimeout(0)
    const page = await context.newPage()
    const origin = new globalThis.URL(await page.goto(new globalThis.URL(await globalThis.fetch(campaign.Instructions.split('\r\n').find(_ => _.startsWith('1.')).split(' ').at(-1)).then(_ => _.url)).searchParams.get('url')).then(_ => _.url())).origin
    const document = await jsdom.JSDOM.fromURL(origin, {virtualConsole}).then(_ => _.window.document)
    for (const _ of lodash.sampleSize(globalThis.Array.from(new globalThis.Set(globalThis.Array.from(document.querySelectorAll(`h2 > a[href^='${origin}'][href*='-']`), _ => _.href))), 2))
    {
        await globalThis.fetch(_).then(_ => _.text())
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
    }
    const ad = page.locator('ins[data-ad-client][data-ad-slot]:has(iframe)').first()
    await ad.evaluateHandle(_ => {_.style.borderWidth = '5px'; _.style.borderColor = 'red'; _.style.borderStyle = 'solid'})
    await ad.scrollIntoViewIfNeeded()
    const adframe = ad.locator('iframe')
    const adlocator = adframe.frameLocator(':scope').locator('a[href]')
    while (!await adlocator.count())
    {
        await adframe.evaluateHandle(_ => _.src += '')
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 5))
    }
    await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
    const adhref = await adlocator.first().getAttribute('href')
    campaign.screenshot = new globalThis.Blob([await page.screenshot()], {type:'image/png'})
    await context.close()
    await fs.rm(tmp, {recursive:true})
    const addocument = await jsdom.JSDOM.fromURL(adhref, {virtualConsole}).then(_ => _.window.document)
    campaign.text = addocument.body.textContent
    for (const _ of lodash.sampleSize(globalThis.Array.from(new globalThis.Set(globalThis.Array.from(addocument.querySelectorAll('a:where([href^=http], [href^="/"])'), _ => _.href))), 2))
    {
        await globalThis.fetch((function (href){switch (true){
                                    case href.startsWith('http'): return href
                                    case href.startsWith('/'): return addocument.location.origin + href
                                }})(_)).then(_ => _.text())
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
    }
},

async 223699361(campaign)
{
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tmp')) 
    const context = await playwright.chromium.launchPersistentContext(tmp, {channel:'chrome', args:['--disable-blink-features=AutomationControlled', '--start-maximized'], headless:false, viewport:null})//default_args https://github.com/microsoft/playwright/blob/5faf6f9e69c2148e94c81675fb636eb31a02b5e7/src%2Fserver%2Fchromium%2Fchromium.ts#L78
    context.setDefaultTimeout(0)
    const page = await context.newPage() 
    await page.goto(campaign.Instructions.split('\r\n').find(_ => _.startsWith('1.')).split(' ').at(-1))
    const q = new globalThis.URL(await page.goto(await page.locator('a[aria-label][href*=google]').getAttribute('href')).then(_ => _.url())).searchParams.get('q')
    const origin = new globalThis.URL(await (async function(q){switch (true){
    case q.startsWith('site:'): return q.split('site:').at(-1)
    case q.startsWith('http'): return new globalThis.URL(await globalThis.fetch(q).then(_ => _.url)).searchParams.get('q').split('site:').at(-1)
    default: return 'https://' + q.split(' ').at(-1)
}})(q)).origin
    const document = await jsdom.JSDOM.fromURL(origin, {virtualConsole}).then(_ => _.window.document)
    for (const _ of lodash.sampleSize(globalThis.Array.from(new globalThis.Set(globalThis.Array.from(document.querySelectorAll(`h3 > a[href^='${origin}'][href*='-']`), _ => _.href))), 2))
    {
        await page.goto(_)
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
    }
    await page.mouse.move(0, 0)
    await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 10))
    const adframe = page.frameLocator('iframe[id^=google_ads_iframe_]').first()
    const adlocator = adframe.locator('a:where([href^="https://www.googleadservices.com/pagead/aclk"], [href^="https://ad.doubleclick.net/pcs/click"], [href^="https://www.bing.com/api/v1/mediation/tracking"])')
    while (!await adlocator.count())
    {
        await page.evaluateHandle(_ => googletag.pubads().refresh())
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 5))
    }
    await page.goto(await adlocator.first().getAttribute('href'))
    await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
    await page.goto('chrome://history')
    campaign.screenshot = new globalThis.Blob([await page.screenshot()], {type:'image/png'})
    await context.close()
    await fs.rm(tmp, {recursive:true})
},

async 223701320(campaign)
{
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tmp')) 
    const context = await playwright.chromium.launchPersistentContext(tmp, {channel:'chrome', args:['--disable-blink-features=AutomationControlled', '--start-maximized'], headless:false, viewport:null})//default_args https://github.com/microsoft/playwright/blob/5faf6f9e69c2148e94c81675fb636eb31a02b5e7/src%2Fserver%2Fchromium%2Fchromium.ts#L78
    context.setDefaultTimeout(0)
    const page = await context.newPage() 
    await page.goto('https://www.google.com/search?q=' + globalThis.encodeURIComponent(campaign.Instructions.split(/[12]\./).at(1).split('\r\n').filter(_ => !globalThis.Object.is(_, '')).at(-1)))
    await page.goto('https://' + campaign.Instructions.split('\r\n').find(_ => _.startsWith('2.')).split(' ').at(-1))
    await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
    await page.mouse.move(0, 0)
    for await (const _ of await page.locator('iframe:where([id^=google_ads_iframe_], [src^="https://googleads.g.doubleclick.net"])').all().then(_ => _.map(_ => _.frameLocator(':scope').locator('a[href*=adurl]'))))
    {
        if (await _.count())
        {
            await page.goto(new globalThis.URL(await _.first().getAttribute('href')).searchParams.get('adurl'))
            break
        }
    }
    await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 30))
    await page.goto('chrome://history')
    campaign.screenshot = new globalThis.Blob([await page.screenshot()])
    await context.close()
    await fs.rm(tmp, {recursive:true})
},

async 223728854(campaign)
{
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tmp')) 
    const context = await playwright.chromium.launchPersistentContext(tmp, {channel:'chrome', args:['--disable-blink-features=AutomationControlled', '--start-maximized'], headless:false, viewport:null})//default_args https://github.com/microsoft/playwright/blob/5faf6f9e69c2148e94c81675fb636eb31a02b5e7/src%2Fserver%2Fchromium%2Fchromium.ts#L78
    context.setDefaultTimeout(0)
    const page = await context.newPage() 
    const origin = new globalThis.URL(await page.goto(await globalThis.fetch(campaign.Instructions.split('\r\n').find(_ => _.startsWith('2.')).split(' ').at(-1)).then(_ => _.url)).then(_ => _.url())).origin
    const document = new jsdom.JSDOM(await globalThis.fetch(origin).then(_ => _.text()), {virtualConsole}).window.document
    for (const _ of lodash.sampleSize(globalThis.Array.from(new globalThis.Set(globalThis.Array.from(document.querySelectorAll(`h2 > a[href^='${origin}'][href*='-']`), _ => _.href))), 2))
    {
        await page.goto(_)
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
    }
    campaign.text = await page.locator('p:not([style]):not([class]:not(:empty):not(:has(*)))').last().textContent()
    const client = document.querySelector('script[src^="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-"]').src.split(/[=&]/).at(1)
    let adhref = null
    while (!(adhref = await jsdom.JSDOM.fromURL(`https://googleads.g.doubleclick.net/pagead/ads?client=${client}&format=1045x280&url=${globalThis.encodeURIComponent(origin)}`, {resources}).then(_ => _.window.document.querySelector('a')?.href)));
    await page.goto(adhref)
    await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
    const addocument = new jsdom.JSDOM(await page.content(), {url:page.url(), virtualConsole}).window.document
    for (const _ of lodash.sampleSize(globalThis.Array.from(new globalThis.Set(globalThis.Array.from(addocument.querySelectorAll('a:where([href^=http], [href^="/"])'), _ => _.href))), 2))
    {
        await page.goto((function (href){switch (true){
                            case href.startsWith('http'): return href
                            case href.startsWith('/'): return addocument.location.origin + href
                        }})(_))
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60 * 2))
    }
    await page.goto('chrome://history')
    campaign.screenshot = new globalThis.Blob([await page.screenshot()], {type:'image/png'})
    await context.close()
    await fs.rm(tmp, {recursive:true})
},

async 223751652(campaign)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit)
            this.selector = 'h2 > a[href*="-"]'
            this.preDuration = 1
            this.periDuration = 30
            this.repeat = 10
            return (async() =>
            {
        const query = campaign.Instructions.split('\r\n').find(_ => _.startsWith('Step 2.')).split(': - ').at(-1)
            this.preurl = ['https://www.google.com/search?q=' + globalThis.encodeURIComponent(query)]
                let google = null
        while (!(google = await jsdom.JSDOM.fromURL(this.preurl.at(-1), {virtualConsole, resources}).then(_ => _.window.document.querySelector(`a[href^='https://${query.split(' ').find(_ => _.includes('.'))}']`)?.href)));
        this.preurl.push(google)
                this.url = new globalThis.URL(this.preurl.at(-1)).origin
            return this
            })()
        }
        async text(addocument, db)
        {
            return await db.all('select * from urls limit -1 offset 2').then(_ => _.map(_ => _.url).join('\n'))
        }
    })
},*/

/*async 223779814(campaign)
{
    const url = campaign.Instructions.split('\r\n').find(_ => _.startsWith('1.')).split(' ').at(-1)
    const origin = new globalThis.URL(new globalThis.URL(await globalThis.fetch(url.startsWith('http') ? url : 'https://' + url).then(_ => _.url)).searchParams.get('url')).origin
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tmp'))
    const context = await playwright.chromium.launchPersistentContext(tmp, {channel:'chrome', args:['--disable-blink-features=AutomationControlled', '--start-maximized'], headless:false, viewport:null})//default_args https://github.com/microsoft/playwright/blob/5faf6f9e69c2148e94c81675fb636eb31a02b5e7/src%2Fserver%2Fchromium%2Fchromium.ts#L78
    context.setDefaultTimeout(0)
    const page = await context.newPage()
    await page.goto(origin)
    const document = new jsdom.JSDOM(await page.content(), {virtualConsole}).window.document
    for (const _ of lodash.sampleSize(globalThis.Array.from(new globalThis.Set(globalThis.Array.from(document.querySelectorAll(`h2 > a[href^='${origin}'][href*='-']`), _ => _.href))), 2))
    {
        await globalThis.fetch(_).then(_ => _.text())
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
    }
    await page.mouse.move(0, 0)
    await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
    const ad = page.locator('ins[data-ad-client]').first()
    await ad.evaluateHandle(_ => {_.style.borderWidth = '5px'; _.style.borderColor = 'red'; _.style.borderStyle = 'solid'})
    await ad.scrollIntoViewIfNeeded()
    const adframe = ad.locator('iframe[src^="https://googleads.g.doubleclick.net"]')
    const adlocator = adframe.frameLocator(':scope').locator('a[href]')
    while (!await adlocator.count())
    {
        await adframe.evaluateHandle(_ => _.src += '')
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 5))
    }
    const adhref = await adlocator.first().getAttribute('href')
    campaign.screenshot = new globalThis.Blob([await page.screenshot()], {type:'image/png'})
    await context.close()
    await fs.rm(tmp, {recursive:true})
    const addocument = await jsdom.JSDOM.fromURL(adhref, {virtualConsole}).then(_ => _.window.document)
    campaign.text = addocument.body.textContent
    for (const _ of lodash.sampleSize(globalThis.Array.from(new globalThis.Set(globalThis.Array.from(addocument.querySelectorAll('a:where([href^=http], [href^="/"])'), _ => _.href))), 2))
    {
        await globalThis.fetch((function (href){switch (true){
                                    case href.startsWith('http'): return href
                                    case href.startsWith('/'): return addocument.location.origin + href
                                }})(_)).then(_ => _.text())
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
    }
},

async 223785664(campaign)
{
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tmp')) 
    const context = await playwright.chromium.launchPersistentContext(tmp, {channel:'chrome', args:['--disable-blink-features=AutomationControlled', '--start-maximized'], headless:false, viewport:null})//default_args https://github.com/microsoft/playwright/blob/5faf6f9e69c2148e94c81675fb636eb31a02b5e7/src%2Fserver%2Fchromium%2Fchromium.ts#L78
    context.setDefaultTimeout(0)
    const page = await context.newPage() 
    await page.goto('https://www.google.com/search?q=' + globalThis.encodeURIComponent(campaign.Instructions.split(/[12]\./).at(1).split('\r\n').filter(_ => !globalThis.Object.is(_, '')).at(-1)))
    await page.goto('https://' + campaign.Instructions.split('\r\n').filter(_ => _.startsWith('2.')).at(0).split(' ').at(-1))
    for (const _ of lodash.sampleSize(globalThis.Array.from(new globalThis.Set(await globalThis.Promise.all(await page.locator(`a[href^='${new globalThis.URL(page.url()).origin}'][href*='-']`).all().then(_ => _.map(_ => _.getAttribute('href')))).then(_ => _.filter(_ => /(\w+-){3,}/.test(_))))), 3))
    {
        await page.goto(_)
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
    }
    await page.mouse.move(0, 0)
    for await (const _ of await page.locator('iframe:where([id^=google_ads_iframe_], [src^="https://googleads.g.doubleclick.net"])').all().then(_ => _.map(_ => _.frameLocator(':scope').locator('a[href*=adurl]'))))
    {
        if (await _.count())
        {
            await page.goto(new globalThis.URL(await _.first().getAttribute('href')).searchParams.get('adurl'))
            break
        }
    }
    await page.goto('chrome://history')
    campaign.screenshot = new globalThis.Blob([await page.screenshot()])
    await context.close()
    await fs.rm(tmp, {recursive:true})
},

async 223792524(campaign)
{
    if (globalThis.Object.is(campaign.Id, '148850'))
    {
        const query = campaign.Instructions.split(/[12]:/).at(1).match(/(?<=: )[: \w]+\.\w+\b/g).at(0)
        const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tmp')) 
        const context = await playwright.chromium.launchPersistentContext(tmp, {channel:'chrome', args:['--disable-blink-features=AutomationControlled', '--start-maximized'], headless:false, viewport:null})//default_args https://github.com/microsoft/playwright/blob/5faf6f9e69c2148e94c81675fb636eb31a02b5e7/src%2Fserver%2Fchromium%2Fchromium.ts#L78
        context.setDefaultTimeout(0)
        const page = await context.newPage() 
        await page.goto('https://www.google.com/search?q=' + globalThis.encodeURIComponent(query))
        await page.goto(await page.locator(`a[href^='https://${query.match(/\w+\.\w+/g).at(0)}']`).getAttribute('href'))
        for (const _ of globalThis.Array(7).keys()) await page.goto(await page.locator('p#random-content > a').getAttribute('href'))
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 10))
        await page.mouse.move(0, 0)
        for await (const _ of await page.locator('iframe:where([id^=google_ads_iframe_], [src^="https://googleads.g.doubleclick.net"])').all().then(_ => _.map(_ => _.frameLocator(':scope').locator('a[href*=adurl]'))))
        {
            if (await _.count())
            {
                await page.goto(new globalThis.URL(await _.first().getAttribute('href')).searchParams.get('adurl'))
                break
            }
        }
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
        for (const _ of lodash.sampleSize(globalThis.Array.from(new globalThis.Set(await globalThis.Promise.all(await page.locator('a[href^=http]').all().then(_ => _.map(_ => _.getAttribute('href')))))), 2))
        {
            await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 30))
            await page.goto(_)
        }
        await page.goto('chrome://history')
        campaign.screenshot = new globalThis.Blob([await page.screenshot()])
        await context.close()
        await fs.rm(tmp, {recursive:true})
    }
    else
    {
        const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tmp')) 
        const context = await playwright.chromium.launchPersistentContext(tmp, {channel:'chrome', args:['--disable-blink-features=AutomationControlled', '--start-maximized'], headless:false, viewport:null})//default_args https://github.com/microsoft/playwright/blob/5faf6f9e69c2148e94c81675fb636eb31a02b5e7/src%2Fserver%2Fchromium%2Fchromium.ts#L78
        context.setDefaultTimeout(0)
        const page = await context.newPage() 
        await page.goto(campaign.Instructions.split('\r\n').find(_ => _.startsWith('1.')).match(/\bhttps:\/\/[/.\w]+\b/g).at(0))
        const origin = new globalThis.URL(await page.goto(new globalThis.URL(await page.locator('a[aria-label][href*=google]').getAttribute('href')).searchParams.get('q')).then(_ => _.url())).origin
        const document = await jsdom.JSDOM.fromURL(origin, {virtualConsole}).then(_ => _.window.document)
        for (const _ of lodash.sampleSize(globalThis.Array.from(new globalThis.Set(globalThis.Array.from(document.querySelectorAll(`h2 > a[href^='${origin}'][href*='-']`), _ => _.href))), campaign.TimeLimit))
        {
            await page.goto(_)
            await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
        }
        await page.mouse.move(0, 0)
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 10))
        const adframe = page.frameLocator('iframe[id^=google_ads_iframe_]').first()
        const adlocator = adframe.locator('a:where([href^="https://www.googleadservices.com/pagead/aclk"], [href^="https://ad.doubleclick.net/pcs/click"], [href^="https://www.bing.com/api/v1/mediation/tracking"])')
        while (!await adlocator.count())
        {
            await page.evaluateHandle(_ => googletag.pubads().refresh())
            await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 5))
        }
        await page.goto(await adlocator.first().getAttribute('href'))
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
        const addocument = new jsdom.JSDOM(await page.content(), {virtualConsole}).window.document
        for (const _ of lodash.sampleSize(globalThis.Array.from(new globalThis.Set(globalThis.Array.from(addocument.querySelectorAll('a[href^=http]'), _ => _.href))), 2))
        {
            await page.goto(_)
            await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 30))
        }
        await page.goto('chrome://history')
        campaign.screenshot = new globalThis.Blob([await page.screenshot()], {type:'image/png'})
        await context.close()
        await fs.rm(tmp, {recursive:true})
    }
},

async 223801993(campaign)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit)
            this.selector = 'h2 > a[href*="-"]'
            this.preDuration = 0
            this.periDuration = 60
            this.repeat = 3
            return (async() =>
            {
                this.preurl = [await globalThis.fetch(campaign.Instructions.split(/\r?\n/).find(_ => _.includes('Go to:')).split(' ').at(-1)).then(_ => _.url)]
        this.preurl.push(await globalThis.fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=AIzaSyDE0pb3P8eGAlUmj3S1N3te8GnlvXJawns', {method:'post', headers:{'content-type':'application/json'}, body:globalThis.JSON.stringify({contents:[{parts:[{text:'what is the url in red loop format https://'}, {inline_data:{mime_type:'image/png', data:await jsdom.JSDOM.fromURL(campaign.Instructions.split(/\r?\n/).find(_ => _.includes('Go to see this:')).split(' ').at(-1), {virtualConsole}).then(_ => _.window.document.querySelector('meta[property="og:image"]').content).then(globalThis.fetch).then(_ => _.arrayBuffer().then(_ => globalThis.Buffer.from(_).toString('base64')))}}]}]})}).then(_ => _.json().then(_ => _.candidates.at(0).content.parts.at(0).text.split(' ').at(-1) + '/blog')))
        this.url = this.preurl.at(-1)
        return this
            })()
        }
    })
},*/

async 223823976(campaign, buckwall)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions)
        }
        async text(addocument, db)
        {
            return ['5th Link:', await db.all(`select * from urls limit 1 offset 5`).then(_ => _.at(-1).url), 'ad Link:', addocument.location.href].join('_____') 
        }
    }, buckwall)
},

/*async 223853104(campaign)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit)
            this.selector = 'h2 > a[href*="-"]'
            this.preDuration = 0
            this.periDuration = 12
            this.repeat = 5
            return (async() =>
            {
                this.preurl = [await globalThis.fetch(campaign.Instructions.split('\r\n').find(_ => _.startsWith('1.')).split(' ').at(-1)).then(_ => _.url)]
        if (campaign.Instructions.split('\r\n').find(_ => _.startsWith('2.')).startsWith('2. Scroll Down, Open ANY of the JOB LINKS YOU LIKE to READ')) this.preurl.push(await globalThis.fetch(await jsdom.JSDOM.fromURL(this.preurl.at(-1), {virtualConsole}).then(_ => _.window.document.querySelector('a.registerbtn:last-of-type').href)).then(_ => _.url))
            else
            {
                const href = new globalThis.URL(this.preurl.at(-1))
                if (globalThis.Object.is(href.origin, 'https://l.facebook.com')) this.preurl.push(new globalThis.URL(this.preurl.at(-1)).searchParams.get('u'))
            else this.preurl.push(href.toString())
        }
            this.url = new globalThis.URL(this.preurl.at(-1)).origin
            return this
            })()
        }
    screenshot(adhref)
    {
        if (campaign.Instructions.split('\r\n').find(_ => _.startsWith('2.')).startsWith('2. Scroll Down, Open ANY of the JOB LINKS YOU LIKE to READ')) return 'chrome://history'
            else return adhref
    }
    })
},*/

async 223855992(campaign, buckwall)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions).then(_ => _.periDuration = 12)
        }
    }, buckwall)
},

/*async 223859484(campaign)
{
    if (globalThis.Object.is(campaign.Instructions.split('\r\n').find(_ => _.startsWith('1.')), '1. GO To The Google/bing/yahoo Search'))
        [campaign.text, campaign.screenshot] = await history(await new class extends Template
        {
            constructor()
            {
                super(campaign.TimeLimit)
                this.selector = 'h2 > a[href*="-"]'
                this.preDuration = 1
                this.periDuration = 30
                this.repeat = 5
                return (async() =>
                {
                const url = campaign.Instructions.split('\r\n').find(_ => _.startsWith('2.')).split(' ').find(_ => /\w+\.\w+/.test(_))
                    this.query = 'https://www.google.com/search?q=' + globalThis.encodeURIComponent(url)
            this.url = 'https://' + url
                return this
                })()
            }
            text(addocument, db)
            {
                return [...urls].join(' ')
            }
        })
    else
    {
        const url = campaign.Instructions.split('\r\n').find(_ => _.startsWith('1.')).split(' ').at(-1)
        if (url.includes('google'))
            [campaign.text, campaign.screenshot] = await history(await new class extends Template
            {
                constructor()
                {
                    super(campaign.TimeLimit)
                    this.selector = 'h2 > a[href*="-"]'
                    this.preDuration = 1
                    this.periDuration = 30
                    this.repeat = 5
                    return (async() =>
                    {
                        this.query = await jsdom.JSDOM.fromURL(url, {virtualConsole}).then(_ => _.window.document.querySelector('a[aria-label][href*=google]').href)
                        this.url = new globalThis.URL(this.query).searchParams.get('q')
                    return this
                    })()
                }
                text(addocument, db)
                {
                    return [...urls].join(' ')
                }
            })
        else
            [campaign.text, campaign.screenshot] = await history(await new class extends Template
            {
                constructor()
                {
                    super(campaign.TimeLimit)
                    this.selector = 'h6 > a[href*="-"]'
                    this.preDuration = 1
                    this.periDuration = 30
                    this.repeat = 5
                    return (async() =>
                    {
                        this.query = await globalThis.fetch(url).then(_ => _.url)
                        this.url = new globalThis.URL(this.query).searchParams.get('q')
                    return this
                    })()
                }
                text(addocument, db)
                {
                    return [...urls].join(' ')
                }
            })
    }
},

async 223861327(campaign)
{
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tmp')) 
    const context = await playwright.chromium.launchPersistentContext(tmp, {channel:'chrome', args:['--disable-blink-features=AutomationControlled', '--start-maximized'], headless:false, viewport:null})//default_args https://github.com/microsoft/playwright/blob/5faf6f9e69c2148e94c81675fb636eb31a02b5e7/src%2Fserver%2Fchromium%2Fchromium.ts#L78
    context.setDefaultTimeout(0)
    const page = await context.newPage()
    const url = await globalThis.fetch(campaign.Instructions.split('\r\n').find(_ => _.startsWith('1')).split(' ').at(-1)).then(_ => _.url)
    await page.goto(url)
    await page.goto(['https://', new globalThis.URL(url).searchParams.get('q').split(' ').at(0), '.com'].join(''))
    await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
    const origin = new globalThis.URL(page.url()).origin
    const document = new jsdom.JSDOM(await page.content(), {url:page.url(), virtualConsole}).window.document
    for (const _ of lodash.sampleSize(globalThis.Array.from(new globalThis.Set(globalThis.Array.from(document.querySelectorAll(`h2 > a[href^='${origin}'][href*='-']`), _ => _.href))), 5))
    {
        await page.goto(_)
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
    }
    await page.mouse.move(0, 0)
    await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 10))
    const adframe = page.frameLocator('iframe[id^=google_ads_iframe_]').first()
    const adlocator = adframe.locator('a:where([href^="https://www.googleadservices.com/pagead/aclk"], [href^="https://ad.doubleclick.net/pcs/click"], [href^="https://www.bing.com/api/v1/mediation/tracking"])')
    while (!await adlocator.count())
    {
        await page.evaluateHandle(_ => googletag.pubads().refresh())
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 5))
    }
    await page.goto(await adlocator.first().getAttribute('href'))
    await page.goto('chrome://history')
    campaign.screenshot = new globalThis.Blob([await page.screenshot()], {type:'image/png'})
    await context.close()
    await fs.rm(tmp, {recursive:true})
},*/

async 223864613(campaign, buckwall)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions)
        }
        destinationLast(document)
        {
            return document.querySelector('a[rel="nofollow noopener"][target=_blank]').href
        }
    }, buckwall)
},

/*async 223882981(campaign)
{
    let next = await jsdom.JSDOM.fromURL(campaign.Instructions.split('\r\n').find(_ => _.startsWith('1.')).split(' ').at(-1), {virtualConsole}).then(_ => _.window.document.querySelector(`div > a[href^='${_.window.location.origin}'][href*="-"]`).href)
    campaign.text = next
    let document = null
    while (!(document = await jsdom.JSDOM.fromURL(next, {virtualConsole}).then(_ => _.window.document)).querySelector('div#message'))
    {
        next = document.evaluate('//script[contains(text(), "window.location.href")]', document, null, 2, null).stringValue.match(/(?<=window\.location\.href = ')[-:/.\w]+?(?=')/g).at(0)
    campaign.text += ' ' + next
    }
    campaign.text += ' ' + document.querySelector('div#message').textContent
    campaign.screenshot = new globalThis.Blob()
    await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60 * campaign.TimeLimit))
},

async 223883764(campaign)
{
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tmp')) 
    const context = await playwright.chromium.launchPersistentContext(tmp, {channel:'chrome', args:['--disable-blink-features=AutomationControlled', '--start-maximized'], headless:false, viewport:null})//default_args https://github.com/microsoft/playwright/blob/5faf6f9e69c2148e94c81675fb636eb31a02b5e7/src%2Fserver%2Fchromium%2Fchromium.ts#L78
    context.setDefaultTimeout(0)
    const page = await context.newPage()
    if (globalThis.Object.is(campaign.Id, '154344'))
    {
        await page.goto(campaign.Instructions.split('\r\n').find(_ => _.startsWith('1.')).match(/\bhttps:\/\/[/.\w]+\b/g).at(0))
        const origin = new globalThis.URL(await page.goto(new globalThis.URL(await page.locator('a[aria-label][href*=google]').getAttribute('href')).searchParams.get('q')).then(_ => _.url())).origin
        const document = await jsdom.JSDOM.fromURL(origin, {virtualConsole}).then(_ => _.window.document)
        for (const _ of lodash.sampleSize(globalThis.Array.from(new globalThis.Set(globalThis.Array.from(document.querySelectorAll(`h2 > a[href^='${origin}'][href*='-']`), _ => _.href))), 6))
        {
            await page.goto(_)
            await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
        }
    }
    else if (globalThis.Object.is(campaign.Id, '158052') || globalThis.Object.is(campaign.Id, '158534'))
    {
    const query = campaign.Instructions.split('\r\n').find(_ => _.startsWith('1.')).split(/:|and/).at(1).trim()
    await page.goto('https://www.google.com/search?q=' + globalThis.encodeURIComponent(query))
    const origin = new globalThis.URL(await page.goto('https://' + query.split(' ').at(-1)).then(_ => _.url())).origin
        const document = await jsdom.JSDOM.fromURL(origin, {virtualConsole}).then(_ => _.window.document)
        for (const _ of lodash.sampleSize(globalThis.Array.from(new globalThis.Set(globalThis.Array.from(document.querySelectorAll(`h2 > a[href^='${origin}'][href*='-']`), _ => _.href))), 8))
        {
            await page.goto(_)
            await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
        }
    }
    await page.mouse.move(0, 0)
    await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 10))
    const adframe = page.frameLocator('iframe[id^=google_ads_iframe_]').first()
    const adlocator = adframe.locator('a:where([href^="https://www.googleadservices.com/pagead/aclk"], [href^="https://ad.doubleclick.net/pcs/click"], [href^="https://www.bing.com/api/v1/mediation/tracking"])')
    while (!await adlocator.count())
    {
        await page.evaluateHandle(_ => googletag.pubads().refresh())
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 5))
    }
    await page.goto(await adlocator.first().getAttribute('href'))
    await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 60))
    const addocument = new jsdom.JSDOM(await page.content(), {url:page.url(), virtualConsole}).window.document
    for (const _ of lodash.sampleSize(globalThis.Array.from(new globalThis.Set(globalThis.Array.from(addocument.querySelectorAll('a:where([href^=http], [href^="/"])'), _ => _.href))), 2))
    {
        await page.goto((function (href){switch (true){
                            case href.startsWith('http'): return href
                            case href.startsWith('/'): return addocument.location.origin + href
                        }})(_))
        await new globalThis.Promise(_ => globalThis.setTimeout(_, 1000 * 30))
    }
    await page.goto('chrome://history')
    campaign.screenshot = new globalThis.Blob([await page.screenshot()], {type:'image/png'})
    await context.close()
    await fs.rm(tmp, {recursive:true})
},

async 223936247(campaign)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit)
            this.selector = 'h3 > a[href*="-"]'
            this.preDuration = 0
            this.periDuration = 60
            this.repeat = 5
            return (async() =>
            {
        const [query, url] = campaign.Instructions.split('\r\n').find(_ => _.startsWith('Step 1:')).match(/(?<={)[-:/.\w ]+?(?=})/g)
        this.preurl = ['https://www.google.com/search?q=' + globalThis.encodeURIComponent(query), url]
        this.url = new globalThis.URL(this.preurl.at(-1)).origin
            return this
            })()
        }
        client(document, post)
    {
        return [null, document.location.href] //<script type="rocketlazyloadscript" data-minify="1" async data-rocket-src="https://riskandcoverage.com/wp-content/cache/min/1/tag/js/gpt.js?ver=1701606720"></script>
    }
    })
},*/

async 223941881(campaign, buckwall)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions).then(_ => _.history = false)
        }
    }, buckwall)
},

/*async 223963369(campaign)
{
[campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit)
            this.selector = 'h2 > a[href*="-"]'
            this.preDuration = 1
            this.periDuration = 60
            this.repeat = 1
            return (async() =>
            {
                const origin = 'https://' + campaign.Instructions.split('\r\n').at(0).split(' ').at(-1)
            this.preurl = ['https://www.google.com/search?q=' + globalThis.encodeURIComponent(origin)]
            this.preurl.push(origin)
            this.url = new globalThis.URL(this.preurl.at(-1)).origin
            return this
            })()
    }
    })
},

async 223968857(campaign)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit)
            const url = campaign.Instructions.split(/[12]\./).at(1).split('\r\n').findLast(_ => !globalThis.Object.is(_, ''))
            if (url.includes('cdrelements')) this.selector = 'div > a[href*="-"]'
            else if (url.includes('picturedensity')) this.selector = 'h3 > a[href*="-"]'
            else if (url.includes('onlinecashtips')) this.selector = 'h2 > a[href*="-"]'
            this.preDuration = 0
            this.periDuration = 60
            this.repeat = 5
            return (async() =>
            {
                this.preurl = [url]
                this.preurl.push(await jsdom.JSDOM.fromURL(this.preurl.at(-1), {virtualConsole, resources}).then(_ => _.window.document.querySelector('a').href))
            this.url = new globalThis.URL(this.preurl.at(-1)).origin
            return this
            })()
    }
    })
},

async 223989844(campaign)/////////////////////////////////////////////////////////////////
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.Timelimit, campaign.Instructions)
            this.advertisement = true
        }
    })
},*/

async 224020713(campaign, buckwall)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions)
        }
        async text(addocument, db)
        {
            return ['5th Link:', await db.all(`select * from urls limit 1 offset 5`).then(_ => _.at(-1).url), 'ad Link:', addocument.location.href].join('_____') 
        }
    }, buckwall)
},

async 224039779(campaign, buckwall)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions).then(_ => _.periDuration = 12)
        }
    }, buckwall)
},

async 224079791(campaign, buckwall)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions)
            /*return (async() =>
            {
                this.preurl = ['https://www.google.com/search?q=' + globalThis.encodeURIComponent(campaign.Instructions.split('\r\n').find(_ => _.startsWith('1.')).match(/(?<=\[ )[ \w]+(?= \])/g).at(0))]
                const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tmp')) 
                const context = await playwright.chromium.launchPersistentContext(tmp, {channel:'chrome', args:['--disable-blink-features=AutomationControlled', '--start-maximized'], headless:false, viewport:null})//default_args https://github.com/microsoft/playwright/blob/5faf6f9e69c2148e94c81675fb636eb31a02b5e7/src%2Fserver%2Fchromium%2Fchromium.ts#L78
                context.setDefaultTimeout(0)
                const page = await context.newPage()
                await page.goto(this.preurl.at(-1))
                this.preurl.push(await page.locator(`a[href*=${campaign.Instructions.split('\r\n').find(_ => _.startsWith('2.')).match(/(?<=\[ )\w+(?= \])/g).at(0).toLowerCase()}]`).first().getAttribute('href'))
                await context.close()
                await fs.rm(tmp, {recursive:true})
                this.url = new globalThis.URL(this.preurl.at(-1)).origin
        return this
            })()*/
        }
    }, buckwall)
},

async 24090482(campaign, buckwall)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions).then(_ => _.history = true)
        }
    }, buckwall)
},

async 224103568(campaign, buckwall)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions).then(_ => _.ProofInstructions.history = true)
        }
    }, buckwall)
},

/*async 224106622(campaign)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit, campaign.Instructions)
            this.periDuration = 60
            this.repeat = 5
            return (async() =>
            {
                this.preurl = [await globalThis.fetch(campaign.Instructions.split('\r\n').find(_ => _.startsWith('1.')).split(' ').at(-1)).then(_ => _.url)]
        this.preurl.push('https://' + new globalThis.URL(this.preurl.at(-1)).searchParams.get('q').split('site:').at(-1).split(' ').at(-1))
                this.url = new globalThis.URL(this.preurl.at(-1)).origin
        return this
            })()
        }
    })
},*/

async 224122877(campaign, buckwall)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions).then(_ => _.history = true)
        }
    }, buckwall)
},

async 224139156(campaign, buckwall)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions).then(_ => {
            _.preDuration = _.TimeLimit 
            _.periDuration = 0
            _.repeat = 0})
        }
    }, buckwall)
},

async 224214770(campaign, buckwall)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions).then(_ => _.periDuration = 18)
        }
    }, buckwall)
},

async 224236477(campaign, buckwall)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions)
        }
    }, buckwall)
},

async 224307656(campaign, buckwall)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions)
        }
    }, buckwall)
},

async 224310613(campaign, buckwall)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions)
        }
    }, buckwall)
},

async 224315510(campaign)
{
    [campaign.text, campaign.screenshot] = await history(await new class extends Template
    {
        constructor()
        {
            super(campaign.TimeLimit, campaign.Instructions, campaign.ProofInstructions)
        }
        async destination(db)
        {
            const select = super.destination(db)
            let response = await axios.get(select)
            if (globalThis.Object.is(response.status, 0)) response = await axios.get(select, {forceHttp1:true})
            const document = new jsdom.JSDOM(response.data, {url:response.request.responseURL, virtualConsole}).window.document
            await db.exec(`insert into urls values(null,'${document.location.href.replaceAll("'", "''")}','${document.title.replaceAll("'", "''")}',0,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0);
                           insert into visits values(null,0,${(globalThis.Date.now() - globalThis.Date.UTC(1601, 0, 1)) * 1000},0,'',805306376,0,0,0,0,'',0,0,0,0,0,0,0);
                           update visits set url = id where id = (select count(*) from visits)`)
            return globalThis.Object.is(document.location.origin, 'https://t.co') ? new globalThis.URL(document.querySelector('meta[content^="0;url=" i]').content.split(/0;url=/i).at(-1)).origin : document.location.origin
        }
    })
}
}

function submit(campaign)
{
    const formData = new globalThis.FormData()
    formData.append('action', 'SubmitTask')
    formData.append('CampaignId', campaign.Id)
    formData.append('ProofType', campaign.Proof)
    formData.append('Username', campaign.text)
    formData.append('SupportFiles', campaign.screenshot, campaign.Id + '.png')
    return formData
}

const buckWall = await new buckwall[commander.program.opts().redis ? 'wall' : 'buck']
while (true) await buckWall.buckwall(advertisers)
//real link of https://bit.ly/3QdZ6PK can be checked by curl https://bit.ly/3QdZ6PK+

//curl 'https://graph.meta.ai/graphql?locale=user'    -H 'content-type: multipart/form-data; boundary=----WebKitFormBoundaryBnUTEVgn4UvGK3Ed'   -H 'cookie: abra_csrf=5egh_KW4-zZ76w2tF5Dhom; datr=hlSvZugrE9dzo90HvY1BeWH7'    -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'   --data-raw $'------WebKitFormBoundaryBnUTEVgn4UvGK3Ed\r\nContent-Disposition: form-data; name="av"\r\n\r\n0\r\n------WebKitFormBoundaryBnUTEVgn4UvGK3Ed\r\nContent-Disposition: form-data; name="access_token"\r\n\r\nABRAQWZAKeU9tSTJUS05iRW1UeUJrWWxLWTRqb0hsOWNKRXhRMVllTjlQa3R2YmpQenlfUFpJck1jcTNsUTBmUUI2THFBOHZAFY2x3QWJVWGhTcW9ERUI3TDNaRXZAILU1KdjViVmVlZAktBak5fbkFhOEZASQWRTOGtOTjhHVkgzZAlpEdkZAXcFRZAY29WTFBPZAmdRcVFUQVZAJcllYUUUxY0QxclpZANDNHWEtYMFFCSGVHZA2JR\r\n------WebKitFormBoundaryBnUTEVgn4UvGK3Ed\r\nContent-Disposition: form-data; name="__user"\r\n\r\n0\r\n------WebKitFormBoundaryBnUTEVgn4UvGK3Ed\r\nContent-Disposition: form-data; name="__a"\r\n\r\n1\r\n------WebKitFormBoundaryBnUTEVgn4UvGK3Ed\r\nContent-Disposition: form-data; name="__req"\r\n\r\nc\r\n------WebKitFormBoundaryBnUTEVgn4UvGK3Ed\r\nContent-Disposition: form-data; name="__hs"\r\n\r\n19941.HYP:abra_pkg.2.1..0.0\r\n------WebKitFormBoundaryBnUTEVgn4UvGK3Ed\r\nContent-Disposition: form-data; name="dpr"\r\n\r\n1\r\n------WebKitFormBoundaryBnUTEVgn4UvGK3Ed\r\nContent-Disposition: form-data; name="__ccg"\r\n\r\nUNKNOWN\r\n------WebKitFormBoundaryBnUTEVgn4UvGK3Ed\r\nContent-Disposition: form-data; name="__rev"\r\n\r\n1015424532\r\n------WebKitFormBoundaryBnUTEVgn4UvGK3Ed\r\nContent-Disposition: form-data; name="__s"\r\n\r\n63fvzb:7xkzgz:7hyo3r\r\n------WebKitFormBoundaryBnUTEVgn4UvGK3Ed\r\nContent-Disposition: form-data; name="__hsi"\r\n\r\n7399904189339196700\r\n------WebKitFormBoundaryBnUTEVgn4UvGK3Ed\r\nContent-Disposition: form-data; name="__dyn"\r\n\r\n7xeUmwlEnwn8K2Wmh0no6u5U4e1Fx-ewSwMwNw9G2S0im3y4o3Bw5VCwjE3awbG0MU2awpUO0n24o5-0Bo7O2l0Fwqo31w9O1lwlE-U2zxe2GewbS361qw8Xwn82Lx-0iS2S3qazo11E2ZwrUdUco9E3Lwr86C1nwro2PxW2W5-fx21aw\r\n------WebKitFormBoundaryBnUTEVgn4UvGK3Ed\r\nContent-Disposition: form-data; name="__csr"\r\n\r\nghiHlQX8m9KiWDAyXxi6VEKap9U0o3w0eCC00wLouw1921uG1JwZcV41rw46wC4PwIoco5wgEggjU4GlxU8a2d0OG2u4U0LW2i19o\r\n------WebKitFormBoundaryBnUTEVgn4UvGK3Ed\r\nContent-Disposition: form-data; name="__comet_req"\r\n\r\n46\r\n------WebKitFormBoundaryBnUTEVgn4UvGK3Ed\r\nContent-Disposition: form-data; name="lsd"\r\n\r\nAVqzuCahVO8\r\n------WebKitFormBoundaryBnUTEVgn4UvGK3Ed\r\nContent-Disposition: form-data; name="jazoest"\r\n\r\n2992\r\n------WebKitFormBoundaryBnUTEVgn4UvGK3Ed\r\nContent-Disposition: form-data; name="__spin_r"\r\n\r\n1015424532\r\n------WebKitFormBoundaryBnUTEVgn4UvGK3Ed\r\nContent-Disposition: form-data; name="__spin_b"\r\n\r\ntrunk\r\n------WebKitFormBoundaryBnUTEVgn4UvGK3Ed\r\nContent-Disposition: form-data; name="__spin_t"\r\n\r\n1722924455\r\n------WebKitFormBoundaryBnUTEVgn4UvGK3Ed\r\nContent-Disposition: form-data; name="__jssesw"\r\n\r\n1\r\n------WebKitFormBoundaryBnUTEVgn4UvGK3Ed\r\nContent-Disposition: form-data; name="fb_api_caller_class"\r\n\r\nRelayModern\r\n------WebKitFormBoundaryBnUTEVgn4UvGK3Ed\r\nContent-Disposition: form-data; name="fb_api_req_friendly_name"\r\n\r\nuseAbraSendMessageMutation\r\n------WebKitFormBoundaryBnUTEVgn4UvGK3Ed\r\nContent-Disposition: form-data; name="variables"\r\n\r\n{"message":{"sensitive_string_value":"1 + 2"},"externalConversationId":"db1f2d42-779e-478a-9365-a3404b3f3fc3","offlineThreadingId":"7226469001396154649","suggestedPromptIndex":null,"flashVideoRecapInput":{"images":[]},"flashPreviewInput":null,"promptPrefix":null,"entrypoint":"ABRA__CHAT__TEXT","icebreaker_type":"TEXT","attachments":[],"activeMediaSets":null,"activeCardVersions":[],"userUploadEditModeInput":null,"reelComposeInput":null,"__relay_internal__pv__WebPixelRatiorelayprovider":1,"__relay_internal__pv__AbraIcebreakerImagineFetchCountrelayprovider":20,"__relay_internal__pv__AbraDebugDevOnlyrelayprovider":false,"__relay_internal__pv__AbraCardNavigationCountrelayprovider":true,"__relay_internal__pv__AbraMessageListItemBubblerelayprovider":true}\r\n------WebKitFormBoundaryBnUTEVgn4UvGK3Ed\r\nContent-Disposition: form-data; name="server_timestamps"\r\n\r\ntrue\r\n------WebKitFormBoundaryBnUTEVgn4UvGK3Ed\r\nContent-Disposition: form-data; name="doc_id"\r\n\r\n7988729524576796\r\n------WebKitFormBoundaryBnUTEVgn4UvGK3Ed--\r\n'
