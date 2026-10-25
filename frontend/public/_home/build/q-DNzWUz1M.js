import{_ as t}from"./q-DJjmezVZ.js";import{b as a,L as o,a as n,I as i,A as e}from"./q-B92X-Pvc.js";const y=[{priority:2,confidence:"Firm",severity:"Critical",suggestion:"BABE epoch duration cannot change on a running chain",file:"Babe.constant.<b>EpochDuration<b/>"},{priority:2,confidence:"Firm",severity:"Critical",suggestion:"BABE slot duration cannot change on a running chain",file:"Babe.constant.<b>EpochDuration<b/>"},{priority:2,confidence:"Firm",severity:"Critical",suggestion:"BABE epoch duration cannot change on a running chain",file:"Babe.constant.<b>ExpectedBlockTime<b/>"},{priority:2,confidence:"Firm",severity:"Critical",suggestion:"BABE slot duration cannot change on a running chain",file:"Babe.constant.<b>EpochDuration<b/>"},{priority:1,confidence:"Linked",severity:"Critical",suggestion:"The timestamp period is tied to the BABE slot",file:"Babe.constant.<b>MinimumPeriod<b/>"}],d=a(o(()=>t(()=>import("./q-BIti-pnv.js"),[]),"s_AHA0QvYDFyQ")),F=[{label:"OS",wrapperStyles:{width:120,borderTopLeftRadius:8,borderBottomLeftRadius:8},childStyles:{borderRightWidth:1,borderColor:"black/8"}},{label:"Runtime",wrapperStyles:{width:180},childStyles:{borderRightWidth:1,borderColor:"black/8"}},{label:"spec",wrapperStyles:{width:200},childStyles:{borderRightWidth:1,borderColor:"black/8"}},{label:"Size",wrapperStyles:{width:188},childStyles:{borderRightWidth:1,borderColor:"black/8"}},{label:"Actions",wrapperStyles:{borderTopRightRadius:8,borderBottomRightRadius:8}}],k=[{os:"apple",artifact:"clean.wasm",architecture:"1003",size:"2.45 MB"},{os:"apple",artifact:"ZIP",architecture:"x64",size:"2.45 MB",sizeBadge:"+91 B"},{os:"apple",artifact:"ZIP",architecture:"1005",size:"2.45 MB",sizeBadge:"+2 B"},{os:"mainnet",artifact:"NSIS",architecture:"x64",size:"2.45 MB",sizeBadge:"+234 B"},{os:"dev",artifact:"clean.wasm",architecture:"x64",size:"2.45 MB",sizeBadge:"+234 B"},{os:"dev",artifact:"clean.wasm",architecture:"1005"}],l=a(o(()=>t(()=>import("./q-Drtx9VbA.js").then(s=>s.F),[]),"s_Kffaf4LDoWI")),v=`$ canary upgrade --ws ws://127.0.0.1:9945 --wasm runtimes/out/ed100x.compact.wasm
before     spec_version 1002
events     system.CodeUpdated, sudo.Sudid, system.ExtrinsicSuccess
after      spec_version 1004
liveness   ok (#9 -> #12 under the new runtime)

$ canary compare --baseline ws://127.0.0.1:9944 --candidate ws://127.0.0.1:9945
~ Balances.constant.ExistentialDeposit
    baseline:  T::Balance = 100000000000000
    candidate: T::Balance = 10000000000000000

$ canary test --baseline ws://127.0.0.1:9944 --candidate ws://127.0.0.1:9945 --injected "ed100x"
PASS          Info      balances.keep_alive
REGRESSION    High      balances.transfer.basic
    step 0 dispatch success  baseline: success  candidate: failed (balances.ExistentialDeposit)
    delta receiver.free      baseline: +100000000000000  candidate: +0
PASS          Info      balances.transfer.insufficient
PASS          Info      identity.deposit

$ canary upgrade --ws ws://127.0.0.1:9946 --wasm runtimes/out/source-60s.compact.wasm --timeout 40
after      spec_version 1003
liveness   HALTED: best block stuck at #85 for 40s after the upgrade (needed #88)
verdict    REGRESSION Critical: runtime accepted by setCode but block production stopped
node log:  panicked at 'Timestamp slot must match \`CurrentSlot\`'`,u=a(o(()=>t(()=>import("./q-DIbzRwkK.js"),[]),"s_3vbLmqaFSsQ")),r=a(o(()=>t(()=>import("./q-BkMftFrP.js"),[]),"s_CuYjOPl3XMw")),p=a(o(()=>t(()=>import("./q-yylWdwAb.js").then(s=>s.F),[]),"s_uW2b00mV0qs")),c=a(o(()=>t(()=>import("./q-DeCMTQxx.js").then(s=>s.F),[]),"s_YeuVX0LsZkE")),_=a(o(()=>t(()=>import("./q-Nr_8KgiV.js"),[]),"s_xSFEns4P0h8")),b=()=>(n(o(()=>t(()=>Promise.resolve().then(()=>h),void 0),"s_nS2G8DQUH1w")),i("div",null,{class:"features-dashboard-content"},[e(c,null,3,"Fw_0"),e(r,null,3,"Fw_1"),i("div",null,{class:"hidden md:contents"},[e(p,null,3,"Fw_2"),e(_,null,3,"Fw_3"),e(r,null,3,"Fw_4"),e(l,null,3,"Fw_5"),e(r,null,3,"Fw_6"),e(d,null,3,"Fw_7"),e(r,null,3,"Fw_8"),e(u,null,3,"Fw_9")],1,null)],1,"Fw_10")),D=Object.freeze(Object.defineProperty({__proto__:null,s_oGjZnW8FJD4:b},Symbol.toStringTag,{value:"Module"})),g='@keyframes rotate-1turn{to{rotate:360deg}}.features-dashbord-content-validation-label{font-variant-numeric:slashed-zero;font-feature-settings:"ss01" on,"cv01" on}',f=g,h=Object.freeze(Object.defineProperty({__proto__:null,s_nS2G8DQUH1w:f},Symbol.toStringTag,{value:"Module"}));export{D as F,v as J,F as O,y as a,k as b,f as s_nS2G8DQUH1w,b as s_oGjZnW8FJD4};
