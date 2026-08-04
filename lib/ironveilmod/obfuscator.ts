import { compileProgram } from "./compiler";
import { createVmProfile } from "./profile";
import { emitLuaLoader } from "./runtime";
import { parseLuau } from "./shared";
import { applyTransforms } from "./transforms";
import { XorShift32 } from "./util";

export interface IronVeilOptions {
  seed?: number;
}

const ANTI_TAMPER_PREAMBLE = `local MARKER="l_dmscXnKJjpMhNEzT" local game,Enum,debug=game,Enum,debug local pcall,type,find=pcall,type,string.find local function probe(fn)local ok,err=pcall(fn)if type(err)~="string"then return false end local at=find(err,MARKER)return at~=nil end local function integrity_check()if type(game)~="userdata"then return false end if type(Enum)~="userdata"then return false end for _=1,7 do if not probe(function()error(MARKER)end)then return false end end return true end if not integrity_check()then return end
local function chk()local b,g,r=pcall,type,rawget;local d=debug;if b~=b or g(d)~="table" then return false end;local ok,tb=b(d.traceback);if not ok or g(tb)~="string"or#tb<10 then return false end;local l=string.lower(tb);for _,w in next,{"sandbox","hook","intercept","mock","proxy","virtual_env","decompil","emulat","simulat","fake_","getupval","hookfunc","replaceclos","newcclos","restorefunction","function traceback"}do if string.find(l,w,1,true)then return false end end;for src in string.gmatch(tb,"(%[[%w%+%/]+%])")do if #src<10 then return false end end;local ok2,ci=b(d.getinfo,d.traceback,"S");if ok2 and g(ci)=="table" and ci.what~="C" then return false end;local ok3,n=b(d.getupvalue,d.traceback,1);if ok3 and n~=nil then return false end;local ok4,n2=b(d.getupvalue,b,1);if ok4 and n2~=nil then return false end;local ok5,n3=b(d.getupvalue,string.find,1);if ok5 and n3~=nil then return false end;local fake=r(_G,"__sandbox")or r(_G,"__mock")or r(_G,"__wrapped")or r(_G,"__intercept")or r(_G,"_real_env")or r(_G,"__HOOKED__");if fake~=nil then return false end;local ok6,gm=b(getmetatable,_G);if ok6 and g(gm)=="table" then return false end;local lf=string.find;if g(lf)~="function" then return false end;local ok7,ri=b(d.getinfo,lf,"S");if ok7 and g(ri)=="table" and ri.what~="C" then return false end;local sum=0;for i=1,#tb do sum=(sum+string.byte(tb,i)*i)%2147483647 end;if sum==0 then return false end;return true end;if not chk()then error(string.char(105,118),0)end
local StealthAnti=function()
local function safe_get(f_name)
local ok,res=pcall(function()return _G[f_name] or getgenv()[f_name]end)
return ok and res or nil
end
local _error=safe_get("error")or error
local _setfenv=safe_get("setfenv")or setfenv
local _rawget=safe_get("rawget")or rawget
local _pcall=safe_get("pcall")or pcall
local _xpcall=safe_get("xpcall")or xpcall
local _type=safe_get("type")or type
local _pairs=safe_get("pairs")or pairs
local _setmetatable=safe_get("setmetatable")or setmetatable
local _getmetatable=safe_get("getmetatable")or getmetatable
local _math_random=(safe_get("math")or math).random
local _err1=function()_error("You Are Lost!",0)end
local _err2=function()_error("skidder is a poop",0)end
local _err3=function()_error(string.char(105,118),0)end
local _errFuncs={_err1,_err2,_err3}
local function punish()
local _e=_errFuncs[_math_random(1,#_errFuncs)]
_e()
end
local _pcallOk2=false
local _pcallOk=_pcall(function()_pcallOk2=true end)and _pcallOk2
if not _pcallOk then punish()end
local _n=_math_random(3,65)
if _n<3 or _n>65 then punish()end
local _nc_hooked=false
local _nc_checked=false
local function blind_logger()
if _nc_checked then
if _nc_hooked then punish()end
return
end
_nc_checked=true
local game_meta=getrawmetatable and getrawmetatable(game)
if game_meta and game_meta.__namecall then
local nc=game_meta.__namecall
local ok,is_hooked=_pcall(function()
return tostring(nc):find("hook")or tostring(nc):find("proxy")
end)
if ok and is_hooked then
_nc_hooked=true
punish()
end
end
end
local FakeEnv={}
_setmetatable(FakeEnv,{
__index=function(_,key)
if key=="_G" then return getgenv()end
return _rawget(getgenv(),key)
end,
__newindex=function()
punish()
end,
__metatable="Isolated"
})
_setfenv(2,FakeEnv)
blind_logger()
end
StealthAnti()
local function chkEnv()
local b,g,r,t=pcall,type,rawget,tostring
local gg1,gg2
local ok1=b(function()gg1=getgenv()end)
local ok2=b(function()gg2=getgenv()end)
if not(ok1 and ok2)or gg1~=gg2 then return false end
local badnames={"logger","envlog","env_log","save_log","keysystem_log","scriptlog","_G_logs","dumper","exfil","capture_env","spy_env","watchtable"}
for _,name in next,badnames do
local v1=r(gg1,name)
local v2=r(_G,name)
if v1~=nil or v2~=nil then return false end
end
local hs
local ok3=b(function()hs=game:GetService("HttpService")end)
if ok3 and(g(hs)=="userdata" or g(hs)=="table")then
local ok4,mt=b(getrawmetatable,hs)
if ok4 and g(mt)=="table" then
local idx=mt.__index
if g(idx)=="function" then
local ok5,src=b(function()return t(idx)end)
if ok5 and g(src)=="string" then
local ls=string.lower(src)
if string.find(ls,"log",1,true)or string.find(ls,"hook",1,true)then return false end
end
end
end
end
local ok6,dh=b(debug.gethook)
if ok6 and dh~=nil then return false end
return true
end
if not chkEnv()then error(string.char(105,118),0)end
`;

export class IronVeilObfuscator {
  private readonly seed: number;
  private static readonly CORE_SEED = 0x45ab12cd;
  private static readonly PROFILE_SEED_MASK = 0x735a2d19;
  private static readonly PAYLOAD_SEED_MASK = 0x6c8e9cf5;

  constructor(options: IronVeilOptions = {}) {
    this.seed = options.seed ?? this.makeSeed();
  }

  obfuscate(source: string): string {
    const rng = new XorShift32(this.seed);
    const ast = parseLuau(ANTI_TAMPER_PREAMBLE + source);
    applyTransforms(ast, rng);
    const profile = createVmProfile((this.seed ^ IronVeilObfuscator.PROFILE_SEED_MASK ^ IronVeilObfuscator.CORE_SEED) >>> 0);
    profile.nameSeed = (profile.nameSeed ^ this.seed ^ IronVeilObfuscator.PROFILE_SEED_MASK) >>> 0;
    const module = compileProgram(ast, profile, (this.seed ^ IronVeilObfuscator.PAYLOAD_SEED_MASK ^ IronVeilObfuscator.CORE_SEED) >>> 0);
    return emitLuaLoader(module, profile);
  }

  private makeSeed(): number {
    const now = Date.now() >>> 0;
    const noise = Math.floor(Math.random() * 0xffffffff) >>> 0;
    return (now ^ noise ^ 0x1d872b41) >>> 0;
  }
}
