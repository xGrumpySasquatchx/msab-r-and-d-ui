import { useState } from "react";

const BLUE="#1677ff", GREEN="#2E7D32", AMBER="#D46B08", RED="#C62828";
const GBG="#C8E6C9", ABG="#FFE7BA", RBG="#FFCDD2";
const GFG="#1B5E20", AFG="#612500", RFG="#7F0000";
const CC=["","#1677ff","#9254de","#13c2c2","#fa8c16","#eb2f96"];
const RL=["Run A","Run B","Run C","Run D","Run E","Run F","Run G"];

const tlS=c=>c==="g"?{bg:GBG,fg:GFG,bd:GREEN}:c==="a"?{bg:ABG,fg:AFG,bd:AMBER}:c==="r"?{bg:RBG,fg:RFG,bd:RED}:{bg:"#f5f5f5",fg:"#999",bd:"#d9d9d9"};
const fmt=(v,d=2)=>v==null?"NA":parseFloat(Number(v).toFixed(d)).toString();
const avgT=r=>{const v=[r.t1,r.t2,r.t3].filter(x=>x!=null&&x>0);return v.length?v.reduce((a,b)=>a+b)/v.length:null;};
const kdC=v=>v==null?"na":v<2?"g":v<10?"a":"r";
const secC=v=>v==null?"na":v>=90?"g":v>=80?"a":"r";
const aggC=v=>v==null?"na":v<10?"g":v<20?"a":"r";
const hlC=v=>v==null?"na":v>30?"g":v>10?"a":"r";

const SCR=[
  {name:"a-hTfR1_iso_847",c:1,kd:122.5,block:54.8,mac:143.1},{name:"a-hTfR1_iso_23",c:1,kd:304.2,block:64.2,mac:324.8},
  {name:"a-hTfR1_iso_612",c:1,kd:0.819,block:82.6,mac:2.419},{name:"a-hTfR1_iso_489",c:1,kd:0.918,block:78.3,mac:2.518},
  {name:"a-hTfR1_iso_71",c:1,kd:284.1,block:56.4,mac:304.7},{name:"a-hTfR1_iso_938",c:1,kd:360.3,block:72.8,mac:380.9},
  {name:"a-hTfR1_iso_32",c:1,kd:229,block:93,mac:249.6},{name:"a-hTfR1_iso_501",c:1,kd:0.806,block:91.4,mac:3.406},
  {name:"a-hTfR1_iso_289",c:2,kd:0.966,block:90.9,mac:3.566},{name:"a-hTfR1_iso_674",c:2,kd:0.972,block:84.2,mac:3.572},
  {name:"a-hTfR1_iso_876",c:2,kd:8.5,block:89.5,mac:11.1},{name:"a-hTfR1_iso_964",c:2,kd:0.924,block:78,mac:3.524},
  {name:"a-hTfR1_iso_43",c:2,kd:47.3,block:69.4,mac:49.9},{name:"a-hTfR1_iso_718",c:2,kd:122.5,block:68.2,mac:125.1},
  {name:"a-hTfR1_iso_326",c:3,kd:0.879,block:83.9,mac:1.879},{name:"a-hTfR1_iso_199",c:3,kd:0.931,block:86,mac:2.531},
  {name:"a-hTfR1_iso_467",c:3,kd:0.975,block:88.4,mac:3.575},{name:"a-hTfR1_iso_741",c:3,kd:0.863,block:88.8,mac:1.463},
  {name:"a-hTfR1_iso_97",c:3,kd:0.989,block:83.3,mac:3.589},{name:"a-hTfR1_iso_383",c:3,kd:129.3,block:93.5,mac:131.9},
  {name:"a-hTfR1_iso_251",c:4,kd:0.972,block:85,mac:3.572},{name:"a-hTfR1_iso_174",c:4,kd:2.1,block:86.8,mac:4.7},
  {name:"a-hTfR1_iso_527",c:4,kd:4.9,block:94.3,mac:7.5},{name:"a-hTfR1_iso_689",c:4,kd:0.802,block:69.1,mac:3.402},
  {name:"a-hTfR1_iso_412",c:4,kd:272.2,block:77.3,mac:292.8},{name:"a-hTfR1_iso_893",c:4,kd:323.4,block:76,mac:326},
  {name:"a-hTfR1_iso_112",c:5,kd:0.976,block:89.8,mac:3.576},{name:"a-hTfR1_iso_435",c:5,kd:0.986,block:86.4,mac:3.586},
  {name:"a-hTfR1_iso_573",c:5,kd:0.804,block:91.4,mac:3.404},{name:"a-hTfR1_iso_264",c:5,kd:36.5,block:76.1,mac:39.1},
];

const LEADS=[
  {name:"iso_326",clone:"16_4",runs:[
    {tpr:null,t1:.9,t2:.92,t3:.915,sec:91,agg:8,kd:1.179,hl:46.9,mac:2.179},
    {tpr:"TPR16",t1:.89,t2:.875,t3:.907,sec:94,agg:2,kd:.979,hl:47.9,mac:1.979},
    {tpr:"TPR64",t1:.88,t2:.904,t3:null,sec:94,agg:3,kd:1.379,hl:43.9,mac:2.379},
    {tpr:null,t1:.87,t2:.859,t3:.9,sec:91,agg:12,kd:1.399,hl:41.9,mac:2.399},
    {tpr:"TPR40",t1:.78,t2:.796,t3:.777,sec:87,agg:13,kd:.929,hl:44.9,mac:1.929},
    {tpr:"TPR88",t1:.68,t2:.704,t3:.678,sec:91,agg:12,kd:.979,hl:43.9,mac:1.979},
    {tpr:null,t1:.47,t2:.486,t3:.489,sec:81,agg:22,kd:.949,hl:35.9,mac:1.949},
  ]},
  {name:"iso_199",clone:"20_2",runs:[
    {tpr:null,t1:1.1,t2:1.12,t3:1.115,sec:88,agg:6,kd:1.231,hl:48.3,mac:2.831},
    {tpr:"TPR17",t1:1.09,t2:1.075,t3:1.107,sec:95,agg:2,kd:1.031,hl:49.3,mac:2.631},
    {tpr:"TPR65",t1:1.08,t2:1.104,t3:null,sec:92,agg:3,kd:1.431,hl:45.3,mac:3.031},
    {tpr:null,t1:1.07,t2:1.059,t3:1.1,sec:89,agg:15,kd:1.451,hl:43.3,mac:3.051},
    {tpr:"TPR41",t1:.98,t2:.996,t3:.977,sec:84,agg:11,kd:.981,hl:46.3,mac:2.581},
    {tpr:"TPR89",t1:.88,t2:.904,t3:.878,sec:89,agg:15,kd:1.031,hl:45.3,mac:2.631},
    {tpr:null,t1:.67,t2:.686,t3:.689,sec:79,agg:25,kd:1.001,hl:37.3,mac:2.601},
  ]},
  {name:"iso_741",clone:"29_3",runs:[
    {tpr:null,t1:.97,t2:.99,t3:.985,sec:90,agg:10,kd:1.163,hl:47.2,mac:1.763},
    {tpr:"TPR18",t1:.96,t2:.945,t3:.977,sec:95,agg:3,kd:.963,hl:48.2,mac:1.563},
    {tpr:"TPR66",t1:.95,t2:.974,t3:null,sec:95,agg:3,kd:1.363,hl:44.2,mac:1.963},
    {tpr:null,t1:.94,t2:.929,t3:.97,sec:90,agg:13,kd:1.383,hl:42.2,mac:1.983},
    {tpr:"TPR42",t1:.85,t2:.866,t3:.847,sec:86,agg:15,kd:.913,hl:45.2,mac:1.513},
    {tpr:"TPR90",t1:.75,t2:.774,t3:.748,sec:90,agg:13,kd:.963,hl:44.2,mac:1.563},
    {tpr:null,t1:.54,t2:null,t3:.559,sec:80,agg:23,kd:.933,hl:36.2,mac:1.533},
  ]},
  {name:"iso_289",clone:"14_5",runs:[
    {tpr:null,t1:.5,t2:.52,t3:.515,sec:90,agg:11,kd:1.266,hl:26.4,mac:3.866},
    {tpr:"TPR22",t1:.49,t2:.475,t3:.507,sec:94,agg:5,kd:1.066,hl:27.4,mac:3.666},
    {tpr:"TPR70",t1:.47,t2:.494,t3:null,sec:95,agg:5,kd:1.466,hl:23.4,mac:4.066},
    {tpr:null,t1:.43,t2:.419,t3:.46,sec:80,agg:20,kd:1.486,hl:21.4,mac:4.086},
    {tpr:"TPR46",t1:.47,t2:.486,t3:.467,sec:86,agg:16,kd:1.016,hl:24.4,mac:3.616},
    {tpr:"TPR94",t1:.37,t2:.394,t3:.368,sec:80,agg:20,kd:1.066,hl:23.4,mac:3.666},
    {tpr:null,t1:.23,t2:.246,t3:.249,sec:90,agg:30,kd:1.036,hl:15.4,mac:3.636},
  ]},
  {name:"iso_501",clone:"14_4",runs:[
    {tpr:null,t1:.88,t2:.9,t3:.895,sec:89,agg:15,kd:1.106,hl:12.8,mac:3.706},
    {tpr:"TPR21",t1:.87,t2:.855,t3:.887,sec:95,agg:2,kd:.906,hl:13.8,mac:3.506},
    {tpr:"TPR69",t1:.38,t2:.404,t3:null,sec:91,agg:2,kd:1.806,hl:9.8,mac:4.406},
    {tpr:null,t1:.1,t2:.91,t3:.1,sec:70,agg:24,kd:10.806,hl:1.8,mac:13.406},
    {tpr:"TPR45",t1:.33,t2:.346,t3:.327,sec:85,agg:20,kd:.856,hl:10.8,mac:3.456},
    {tpr:"TPR93",t1:.23,t2:.254,t3:null,sec:70,agg:24,kd:.906,hl:2.8,mac:3.506},
    {tpr:null,t1:.08,t2:.09,t3:.1,sec:15,agg:90,kd:null,hl:null,mac:null},
  ]},
];

const getBest=lead=>{
  let best=null,bk=Infinity;
  lead.runs.forEach((r,i)=>{if(r.kd!=null&&(r.sec||0)>=85&&r.kd<bk){bk=r.kd;best={i,r};}});
  if(!best)lead.runs.forEach((r,i)=>{if(r.kd!=null&&r.kd<bk){bk=r.kd;best={i,r};}});
  return best;
};

function Pill({c,children}){
  const s=tlS(c);
  return <span style={{display:"inline-block",padding:"1px 8px",borderRadius:4,border:`1px solid ${s.bd}`,background:s.bg,color:s.fg,fontSize:11,fontWeight:600}}>{children}</span>;
}
function Card({title,extra,children}){
  return(
    <div style={{background:"#fff",border:"1px solid #e8e8e8",borderRadius:8,boxShadow:"0 1px 3px rgba(0,0,0,.05)",marginBottom:12}}>
      {(title||extra)&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",borderBottom:"1px solid #f0f0f0"}}>
        <b style={{fontSize:13}}>{title}</b>{extra}
      </div>}
      <div style={{padding:"12px 14px"}}>{children}</div>
    </div>
  );
}
function KpiRow({items}){
  return(
    <div style={{display:"grid",gridTemplateColumns:`repeat(${items.length},1fr)`,gap:10,marginBottom:12}}>
      {items.map(([l,v,c],i)=>(
        <div key={i} style={{background:"#fff",border:"1px solid #e8e8e8",borderRadius:8,padding:"10px 12px",textAlign:"center",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
          <div style={{fontSize:11,color:"#888",marginBottom:4}}>{l}</div>
          <div style={{fontSize:22,fontWeight:700,color:c}}>{v}</div>
        </div>
      ))}
    </div>
  );
}
function Sel({value,onChange,options}){
  return(
    <select value={value} onChange={e=>onChange(e.target.value)} style={{height:28,padding:"0 8px",borderRadius:6,border:"1px solid #d9d9d9",fontSize:12,background:"#fff"}}>
      {options.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  );
}
function SortTable({cols,rows,pageSize=8,onRowClick}){
  const [sk,setSk]=useState(null);
  const [asc,setAsc]=useState(true);
  const [pg,setPg]=useState(1);
  const sort=col=>{if(!col.sort)return;sk===col.k?(setAsc(a=>!a)):((setSk(col.k),setAsc(true)));setPg(1);};
  let data=[...rows];
  if(sk){const col=cols.find(c=>c.k===sk);if(col?.sort)data.sort((a,b)=>asc?col.sort(a,b):-col.sort(a,b));}
  const pages=Math.ceil(data.length/pageSize);
  const slice=data.slice((pg-1)*pageSize,pg*pageSize);
  const th={padding:"7px 10px",fontSize:11,fontWeight:600,color:"#555",background:"#fafafa",borderBottom:"1px solid #e8e8e8",textAlign:"left",whiteSpace:"nowrap",userSelect:"none"};
  const td={padding:"6px 10px",fontSize:11,borderBottom:"1px solid #f5f5f5",verticalAlign:"middle"};
  return(
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr>{cols.map(c=>(
          <th key={c.k} style={{...th,cursor:c.sort?"pointer":"default",minWidth:c.w}} onClick={()=>sort(c)}>
            {c.t}{c.sort&&<span style={{marginLeft:3,color:sk===c.k?BLUE:"#ccc"}}>{sk===c.k?(asc?"↑":"↓"):"↕"}</span>}
          </th>
        ))}</tr></thead>
        <tbody>{slice.map((row,i)=>(
          <tr key={row._k??i} onClick={()=>onRowClick&&onRowClick(row)}
            onMouseEnter={e=>e.currentTarget.style.background="#fafafa"}
            onMouseLeave={e=>e.currentTarget.style.background=""}
            style={{cursor:onRowClick?"pointer":"default"}}>
            {cols.map(c=><td key={c.k} style={{...td,minWidth:c.w}}>{c.r?c.r(row):row[c.k]}</td>)}
          </tr>
        ))}</tbody>
      </table>
      {pages>1&&<div style={{display:"flex",justifyContent:"flex-end",gap:4,paddingTop:8}}>
        {Array.from({length:pages},(_,i)=>i+1).map(p=>(
          <button key={p} onClick={()=>setPg(p)} style={{width:28,height:28,border:`1px solid ${p===pg?BLUE:"#d9d9d9"}`,borderRadius:6,background:p===pg?BLUE:"#fff",color:p===pg?"#fff":"#333",cursor:"pointer",fontSize:11}}>{p}</button>
        ))}
      </div>}
    </div>
  );
}

function ScatterPlot({data,xLabel,yLabel,xLog,yLog,width=380,height=240}){
  const pad={t:10,r:10,b:40,l:50};
  const W=width-pad.l-pad.r,H=height-pad.t-pad.b;
  const allX=data.flatMap(ds=>ds.pts.map(p=>p.x)).filter(v=>v>0);
  const allY=data.flatMap(ds=>ds.pts.map(p=>p.y)).filter(v=>v>0);
  const xMin=Math.min(...allX),xMax=Math.max(...allX);
  const yMin=Math.min(...allY),yMax=Math.max(...allY);
  const toX=v=>{if(xLog)return (Math.log10(v)-Math.log10(xMin))/(Math.log10(xMax)-Math.log10(xMin))*W;return (v-xMin)/(xMax-xMin)*W;};
  const toY=v=>{if(yLog)return H-(Math.log10(v)-Math.log10(yMin))/(Math.log10(yMax)-Math.log10(yMin))*H;return H-(v-yMin)/(yMax-yMin)*H;};
  return(
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{display:"block"}}>
      <g transform={`translate(${pad.l},${pad.t})`}>
        <rect width={W} height={H} fill="#fafafa" stroke="#e8e8e8"/>
        {data.map((ds,di)=>ds.pts.map((p,pi)=>(
          <circle key={`${di}-${pi}`} cx={toX(p.x)} cy={toY(p.y)} r={4.5} fill={ds.color+"88"} stroke={ds.color} strokeWidth={1.5}/>
        )))}
        <text x={W/2} y={H+32} textAnchor="middle" fontSize={10} fill="#666">{xLabel}</text>
        <text x={-H/2} y={-38} textAnchor="middle" fontSize={10} fill="#666" transform="rotate(-90)">{yLabel}</text>
        {data.map((ds,i)=>(
          <g key={i} transform={`translate(${W-120+i*0},${i*14})`}>
            <circle cx={6} cy={6} r={4} fill={ds.color+"88"} stroke={ds.color} strokeWidth={1.5}/>
            <text x={14} y={10} fontSize={9} fill="#555">{ds.label}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

function BarChart({labels,values,colors,xLabel,yLabel,width=420,height=200}){
  const pad={t:10,r:10,b:50,l:45};
  const W=width-pad.l-pad.r,H=height-pad.t-pad.b;
  const maxV=Math.max(...values.filter(Boolean),0.01);
  const bw=Math.max(8,W/values.length-4);
  return(
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{display:"block"}}>
      <g transform={`translate(${pad.l},${pad.t})`}>
        <rect width={W} height={H} fill="#fafafa" stroke="#e8e8e8"/>
        {values.map((v,i)=>{
          if(v==null)return null;
          const bH=(v/maxV)*H;
          const x=i*(W/values.length)+(W/values.length-bw)/2;
          return(
            <g key={i}>
              <rect x={x} y={H-bH} width={bw} height={bH} fill={colors[i]+"88"} stroke={colors[i]} strokeWidth={1}/>
              <text x={x+bw/2} y={H+12} textAnchor="middle" fontSize={7} fill="#555" transform={`rotate(-35,${x+bw/2},${H+12})`}>{labels[i]}</text>
            </g>
          );
        })}
        <text x={-H/2} y={-36} textAnchor="middle" fontSize={10} fill="#666" transform="rotate(-90)">{yLabel}</text>
      </g>
    </svg>
  );
}

function Tabs({tabs,active,onChange}){
  return(
    <div style={{display:"flex",borderBottom:"1px solid #e8e8e8",background:"#fff",overflowX:"auto",flexShrink:0}}>
      {tabs.map(t=>(
        <div key={t.id} onClick={()=>onChange(t.id)}
          style={{padding:"11px 16px",fontSize:13,fontWeight:active===t.id?600:400,cursor:"pointer",
            borderBottom:active===t.id?`2px solid ${BLUE}`:"2px solid transparent",
            color:active===t.id?BLUE:"#666",whiteSpace:"nowrap",userSelect:"none"}}>
          {t.label}
        </div>
      ))}
    </div>
  );
}

function ScreeningTab({onProfile}){
  const [cf,setCf]=useState("all");
  const [kf,setKf]=useState("all");
  const filtered=SCR.filter(d=>(cf==="all"||d.c===+cf)&&(kf==="all"||(kf==="g"&&d.kd<5)||(kf==="a"&&d.kd>=5&&d.kd<50)||(kf==="r"&&d.kd>=50)));
  const scatterDs=[1,2,3,4,5].map(c=>({label:`C${c}`,color:CC[c],pts:SCR.filter(d=>d.c===c).map(d=>({x:d.kd,y:d.block}))}));
  const speciesDs=[
    {label:"ΔKD<2",color:GREEN,pts:SCR.filter(d=>d.mac-d.kd<2).map(d=>({x:d.kd,y:d.mac}))},
    {label:"ΔKD 2–5",color:AMBER,pts:SCR.filter(d=>d.mac-d.kd>=2&&d.mac-d.kd<5).map(d=>({x:d.kd,y:d.mac}))},
    {label:"ΔKD>5",color:RED,pts:SCR.filter(d=>d.mac-d.kd>=5).map(d=>({x:d.kd,y:d.mac}))},
  ];
  const cols=[
    {k:"name",t:"Name",w:130,r:row=><a style={{color:BLUE,cursor:"pointer"}} onClick={()=>onProfile(row.name)}>{row.name.replace("a-hTfR1_iso_","iso_")}</a>},
    {k:"c",t:"Clust",w:55,r:row=><span style={{display:"inline-block",width:20,height:20,borderRadius:"50%",background:CC[row.c],color:"#fff",fontSize:10,fontWeight:700,textAlign:"center",lineHeight:"20px"}}>{row.c}</span>},
    {k:"kd",t:"KD (nM)",w:90,sort:(a,b)=>a.kd-b.kd,r:row=><Pill c={row.kd<5?"g":row.kd<50?"a":"r"}>{fmt(row.kd)}</Pill>},
    {k:"block",t:"Blockade%",w:95,sort:(a,b)=>a.block-b.block,r:row=><Pill c={row.block>=80?"g":row.block>=65?"a":"r"}>{fmt(row.block,1)}%</Pill>},
    {k:"mac",t:"Mac KD",w:80,r:row=>fmt(row.mac)},
    {k:"d",t:"ΔKD",w:65,sort:(a,b)=>(a.mac-a.kd)-(b.mac-b.kd),r:row=>{const d=row.mac-row.kd;return <Pill c={d<2?"g":d<5?"a":"r"}>{fmt(d,2)}</Pill>;}},
  ];
  return(
    <>
      <KpiRow items={[["Total screened",SCR.length,BLUE],["KD <5 nM",SCR.filter(d=>d.kd<5).length,GREEN],["KD 5–50 nM",SCR.filter(d=>d.kd>=5&&d.kd<50).length,AMBER],["KD >50 nM",SCR.filter(d=>d.kd>=50).length,RED],["Blockade >80%",SCR.filter(d=>d.block>=80).length,GREEN]]}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <Card title="KD vs % Blockade (log scale, by cluster)">
          <ScatterPlot data={scatterDs} xLabel="hTfR1 KD (nM, log)" yLabel="% Blockade" xLog width={380} height={230}/>
        </Card>
        <Card title="hTfR1 vs Macaque KD — cross-species">
          <ScatterPlot data={speciesDs} xLabel="hTfR1 KD (nM, log)" yLabel="Mac KD (nM, log)" xLog yLog width={380} height={230}/>
        </Card>
      </div>
      <Card title="Screening panel"
        extra={<div style={{display:"flex",gap:8}}>
          <Sel value={cf} onChange={setCf} options={[{v:"all",l:"All clusters"},...[1,2,3,4,5].map(c=>({v:String(c),l:`Cluster ${c}`}))]}/>
          <Sel value={kf} onChange={setKf} options={[{v:"all",l:"All KD"},{v:"g",l:"KD <5"},{v:"a",l:"KD 5–50"},{v:"r",l:"KD >50"}]}/>
        </div>}>
        <SortTable cols={cols} rows={filtered.map((d,i)=>({...d,_k:i}))} pageSize={8} onRowClick={r=>onProfile(r.name)}/>
      </Card>
    </>
  );
}

function LeadsTab({onProfile}){
  const rows=LEADS.map(l=>{
    const b=getBest(l);const r=b?.r;
    const ov=r&&r.kd<2&&(r.sec||0)>=90&&(r.agg||99)<10?"g":r&&r.kd<5&&(r.sec||0)>=85?"a":"r";
    return{_k:l.name,name:l.name,clone:l.clone,kd:r?.kd,mac:r?.mac,hl:r?.hl,sec:r?.sec,agg:r?.agg,titer:r?avgT(r):null,ov};
  });
  const hlLabels=LEADS.map(l=>l.name);
  const hlVals=LEADS.map(l=>getBest(l)?.r.hl??null);
  const hlColors=hlVals.map(v=>v==null?"#eee":v>30?GREEN:v>10?AMBER:RED);
  const cols=[
    {k:"name",t:"Name",w:90,r:row=><a style={{color:BLUE,cursor:"pointer"}} onClick={()=>onProfile(row.name)}>{row.name}</a>},
    {k:"clone",t:"Clone",w:70},
    {k:"kd",t:"Best KD",w:80,sort:(a,b)=>(a.kd??99)-(b.kd??99),r:row=><Pill c={kdC(row.kd)}>{fmt(row.kd)}</Pill>},
    {k:"mac",t:"Mac KD",w:75,r:row=>fmt(row.mac)},
    {k:"hl",t:"t½ (min)",w:80,sort:(a,b)=>(b.hl??0)-(a.hl??0),r:row=><Pill c={hlC(row.hl)}>{fmt(row.hl,1)}</Pill>},
    {k:"sec",t:"SEC%",w:70,r:row=><Pill c={secC(row.sec)}>{fmt(row.sec,0)}%</Pill>},
    {k:"agg",t:"Agg%",w:70,r:row=><Pill c={aggC(row.agg)}>{fmt(row.agg,0)}%</Pill>},
    {k:"titer",t:"Titer g/L",w:80,r:row=>fmt(row.titer,3)},
    {k:"ov",t:"Overall",w:80,r:row=><Pill c={row.ov}>{row.ov==="g"?"Lead":row.ov==="a"?"Backup":"Monitor"}</Pill>},
  ];
  return(
    <>
      <Card title="Lead scorecard — best run per antibody">
        <SortTable cols={cols} rows={rows} pageSize={10} onRowClick={r=>onProfile(r.name)}/>
      </Card>
      <Card title="Best t½ per lead">
        <BarChart labels={hlLabels} values={hlVals} colors={hlColors} yLabel="t½ (min)" height={180}/>
        <div style={{display:"flex",gap:8,marginTop:6}}>
          <Pill c="g">t½ &gt;30 min</Pill><Pill c="a">10–30 min</Pill><Pill c="r">&lt;10 min</Pill>
        </div>
      </Card>
    </>
  );
}

function ProfileTab({name}){
  const lead=LEADS.find(l=>l.name===name);
  const b=lead?getBest(lead):null;const r=b?.r;
  if(!lead)return <div style={{padding:20,color:"#888",textAlign:"center"}}>Click any row in Screening or Leads to open a profile.</div>;
  const flags=r?[
    {t:r.kd<2?"g":"a",m:`KD ${fmt(r.kd)} nM — ${r.kd<2?"preferred range":"marginal, monitor"}`},
    {t:r.sec>=90?"g":"a",m:`SEC purity ${fmt(r.sec,0)}% — ${r.sec>=90?"within green threshold":"below 90% target"}`},
    {t:r.hl>30?"g":r.hl>10?"a":"r",m:`t½ ${fmt(r.hl,1)} min — ${r.hl>30?"strong receptor engagement":r.hl>10?"moderate, consider format engineering":"short, flag for optimization"}`},
    ...(r.mac?[{t:r.mac/r.kd<2?"g":"a",m:`Mac/Hu ratio ${(r.mac/r.kd).toFixed(2)}× — ${r.mac/r.kd<2?"excellent cross-species profile":"moderate drift"}`}]:[]),
    {t:"a",m:"Lys ADC coupling site unconfirmed — resolve before advancing."},
  ]:[];
  const kdPts=lead.runs.map((r2,i)=>r2.kd!=null?{x:i,y:r2.kd}:null).filter(Boolean);
  const hlPts=lead.runs.map((r2,i)=>r2.hl!=null?{x:i,y:r2.hl}:null).filter(Boolean);
  const runCols=[
    {k:"tpr",t:"TPR ID",r:row=>row.tpr||"—"},{k:"run",t:"Run"},{k:"tit",t:"Titer",r:row=>row.titer?fmt(row.titer,3):"NA"},
    {k:"sec",t:"SEC%",r:row=><Pill c={secC(row.sec)}>{fmt(row.sec,0)}%</Pill>},
    {k:"agg",t:"Agg%",r:row=><Pill c={aggC(row.agg)}>{fmt(row.agg,0)}%</Pill>},
    {k:"kd",t:"KD (nM)",r:row=><Pill c={kdC(row.kd)}>{fmt(row.kd)}</Pill>},
    {k:"hl",t:"t½ (min)",r:row=><Pill c={hlC(row.hl)}>{fmt(row.hl,1)}</Pill>},
    {k:"mac",t:"Mac KD",r:row=>fmt(row.mac)},
  ];
  const runData=lead.runs.map((r2,i)=>({_k:i,tpr:r2.tpr,run:RL[i],titer:avgT(r2),sec:r2.sec,agg:r2.agg,kd:r2.kd,hl:r2.hl,mac:r2.mac}));
  return(
    <>
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
          <div>
            <div style={{fontSize:18,fontWeight:700}}>{lead.name}</div>
            <div style={{fontSize:12,color:"#888",marginTop:2}}>Clone: {lead.clone} · Target: hTfR1</div>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {r&&<><Pill c={kdC(r.kd)}>KD: {fmt(r.kd)} nM</Pill><Pill c={secC(r.sec)}>SEC: {fmt(r.sec,0)}%</Pill><Pill c={hlC(r.hl)}>t½: {fmt(r.hl,1)} min</Pill></>}
          </div>
        </div>
      </Card>
      {r&&<KpiRow items={[["Best KD (nM)",fmt(r.kd),tlS(kdC(r.kd)).fg],["Mac KD (nM)",fmt(r.mac),"#333"],["Best t½ (min)",fmt(r.hl,1),tlS(hlC(r.hl)).fg],["Best SEC %",fmt(r.sec,0)+"%",tlS(secC(r.sec)).fg],["Best Agg %",fmt(r.agg,0)+"%",tlS(aggC(r.agg)).fg],["Titer (g/L)",fmt(avgT(r),3),"#333"]]}/>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <Card title="KD across runs">
          <ScatterPlot data={[{label:"KD (nM)",color:GREEN,pts:kdPts}]} xLabel="Run index" yLabel="KD (nM)" width={340} height={180}/>
        </Card>
        <Card title="t½ across runs">
          <ScatterPlot data={[{label:"t½ (min)",color:BLUE,pts:hlPts}]} xLabel="Run index" yLabel="t½ (min)" width={340} height={180}/>
        </Card>
      </div>
      <Card title="Crosslinks registered">
        {[{type:"Disulfide",clr:"#9254de",left:"A:23:R3",right:"A:96:R3",layer:"L2 — off by default"},
          {type:"N-Glyco",clr:"#13c2c2",left:"GlcNAc:R1",right:"A:317:R3",layer:"L4"},
          {type:"Lys coupling",clr:"#fa8c16",left:"Linker:R1",right:"Lys:[unspec]",layer:"L5",warn:"Site unconfirmed"},
        ].map((xl,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 8px",background:"#fafafa",border:"1px solid #f0f0f0",borderRadius:4,marginBottom:5,flexWrap:"wrap"}}>
            <span style={{background:xl.clr+"22",color:xl.clr,border:`1px solid ${xl.clr}88`,borderRadius:4,padding:"0 6px",fontSize:10,fontWeight:600}}>{xl.type}</span>
            <code style={{fontSize:10,background:"#e6f4ff",color:"#0958d9",padding:"1px 5px",borderRadius:4}}>{xl.left}</code>
            <span style={{color:"#ccc"}}>↔</span>
            <code style={{fontSize:10,background:"#e6f4ff",color:"#0958d9",padding:"1px 5px",borderRadius:4}}>{xl.right}</code>
            <span style={{background:"#f5f5f5",color:"#555",border:"1px solid #d9d9d9",borderRadius:4,padding:"0 6px",fontSize:9}}>{xl.layer}</span>
            {xl.warn&&<span style={{background:ABG,color:AFG,border:`1px solid ${AMBER}`,borderRadius:4,padding:"0 6px",fontSize:9,fontWeight:600}}>{xl.warn}</span>}
          </div>
        ))}
      </Card>
      <Card title="Run-by-run detail">
        <SortTable cols={runCols} rows={runData} pageSize={7}/>
      </Card>
      <Card title="Flags">
        {flags.map((f,i)=>(
          <div key={i} style={{display:"flex",gap:8,padding:"7px 10px",background:tlS(f.t).bg,border:`1px solid ${tlS(f.t).bd}`,borderRadius:4,marginBottom:6,fontSize:11}}>
            <span style={{color:tlS(f.t).fg,fontWeight:700}}>{f.t==="g"?"✓":f.t==="r"?"✕":"⚠"}</span>
            <span>{f.m}</span>
          </div>
        ))}
      </Card>
    </>
  );
}

function CompareTab({onProfile}){
  const metrics=[
    {l:"Best KD (nM)",fn:l=>getBest(l)?.r.kd,cls:kdC},
    {l:"% Blockade",fn:l=>SCR.find(s=>"a-hTfR1_"+l.name===s.name||s.name.endsWith(l.name))?.block,cls:v=>v>=80?"g":v>=65?"a":"r",sf:"%"},
    {l:"Mac KD (nM)",fn:l=>getBest(l)?.r.mac,cls:v=>v<3?"g":v<6?"a":"r"},
    {l:"Best SEC %",fn:l=>getBest(l)?.r.sec,cls:secC,sf:"%"},
    {l:"Best Agg %",fn:l=>getBest(l)?.r.agg,cls:aggC,sf:"%"},
    {l:"Best t½ (min)",fn:l=>getBest(l)?.r.hl,cls:hlC},
    {l:"Best Titer (g/L)",fn:l=>{const b=getBest(l);return b?avgT(b.r):null;},cls:v=>v>=.7?"g":v>=.3?"a":"r",d:3},
  ];
  const th={padding:"8px 10px",fontSize:11,fontWeight:600,background:"#fafafa",border:"1px solid #e8e8e8",textAlign:"center"};
  const td={padding:"6px 10px",textAlign:"center",border:"1px solid #f5f5f5",fontSize:11};
  return(
    <Card title="Head-to-head comparison — top 5 leads">
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>
            <th style={{...th,textAlign:"left",minWidth:120}}>Metric</th>
            {LEADS.map((l,i)=>(
              <th key={l.name} onClick={()=>onProfile(l.name)}
                style={{...th,cursor:"pointer",background:i===0?"#e6f4ff":"#fafafa",borderBottom:i===0?`2px solid ${BLUE}`:undefined,minWidth:100}}>
                {l.name}{i===0?" ↗":""}
              </th>
            ))}
          </tr></thead>
          <tbody>
            {metrics.map(m=>(
              <tr key={m.l}>
                <td style={{...td,textAlign:"left",background:"#fafafa",color:"#666"}}>{m.l}</td>
                {LEADS.map(l=>{
                  const v=m.fn(l);const c=v!=null?m.cls(v):"na";const s=tlS(c);
                  return <td key={l.name} style={{...td,background:s.bg}}><span style={{fontWeight:600,color:s.fg}}>{v!=null?fmt(v,m.d??2)+(m.sf||""):"NA"}</span></td>;
                })}
              </tr>
            ))}
            <tr>
              <td style={{...td,textAlign:"left",background:"#fafafa",fontWeight:700}}>Overall</td>
              {LEADS.map(l=>{
                const b=getBest(l);const r=b?.r;
                const c=r&&r.kd<2&&(r.sec||0)>=90?"g":r&&r.kd<5?"a":"r";
                return <td key={l.name} style={{...td,background:tlS(c).bg}}><Pill c={c}>{c==="g"?"Lead":c==="a"?"Backup":"Monitor"}</Pill></td>;
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}

const TABS=[
  {id:"screening",label:"🔬 Screening & functional"},
  {id:"leads",label:"⭐ Lead characterization"},
  {id:"compare",label:"⚖ Comparison"},
  {id:"profile",label:"👤 Molecule profile"},
];

export default function App(){
  const [tab,setTab]=useState("screening");
  const [prof,setProf]=useState("iso_326");
  const openProfile=name=>{
    const short=name.replace("a-hTfR1_iso_","iso_");
    setProf(short);setTab("profile");
  };
  const panels={
    screening:<ScreeningTab onProfile={openProfile}/>,
    leads:<LeadsTab onProfile={openProfile}/>,
    compare:<CompareTab onProfile={openProfile}/>,
    profile:<ProfileTab name={prof}/>,
  };
  return(
    <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",background:"#f5f5f5",minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <div style={{background:"#fff",borderBottom:"1px solid #e8e8e8",padding:"0 16px",height:48,display:"flex",alignItems:"center",gap:14,boxShadow:"0 1px 4px rgba(0,0,0,.06)",flexShrink:0}}>
        <span style={{fontSize:15,fontWeight:700,color:BLUE,paddingRight:14,borderRight:"1px solid #e8e8e8"}}>Luma</span>
        <span style={{fontSize:11,color:"#888",flex:1}}>hTfR1 · 30 screened · 5 leads · TFR-001</span>
        <div style={{display:"flex",gap:10}}>
          {[[GREEN,"Preferred"],[AMBER,"Marginal"],[RED,"High risk"]].map(([c,l])=>(
            <span key={l} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"#666"}}>
              <span style={{width:8,height:8,borderRadius:"50%",background:c,display:"inline-block"}}/>{l}
            </span>
          ))}
        </div>
      </div>
      <Tabs tabs={TABS} active={tab} onChange={setTab}/>
      <div style={{padding:16,flex:1}}>{panels[tab]}</div>
    </div>
  );
}
