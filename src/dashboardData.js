// Colors
export const G = '#2E7D32', A = '#F9C200', R = '#C62828';
export const GF = 'rgba(46,125,50,.2)', AF = 'rgba(249,194,0,.25)', RF = 'rgba(198,40,40,.2)';
export const clusterColors = ['', '#378ADD', '#7F77DD', '#1D9E75', '#D85A30', '#993556'];
export const runLabels = ['Run A', 'Run B (TPR)', 'Run C (TPR)', 'Run D', 'Run E (TPR)', 'Run F (TPR)', 'Run G'];

// Screening panel data (50 candidates across 5 clusters)
export const screening = [
  {name:'a-hTfR1_iso_847',c:1,kd:122.5,block:54.8,mac:143.1},{name:'a-hTfR1_iso_23',c:1,kd:304.2,block:64.2,mac:324.8},
  {name:'a-hTfR1_iso_612',c:1,kd:0.819,block:82.6,mac:2.419},{name:'a-hTfR1_iso_489',c:1,kd:0.918,block:78.3,mac:2.518},
  {name:'a-hTfR1_iso_71',c:1,kd:284.1,block:56.4,mac:304.7},{name:'a-hTfR1_iso_938',c:1,kd:360.3,block:72.8,mac:380.9},
  {name:'a-hTfR1_iso_154',c:1,kd:353.1,block:53.1,mac:373.7},{name:'a-hTfR1_iso_763',c:1,kd:214.4,block:61.4,mac:235},
  {name:'a-hTfR1_iso_32',c:1,kd:229,block:93,mac:249.6},{name:'a-hTfR1_iso_501',c:1,kd:0.806,block:91.4,mac:3.406},
  {name:'a-hTfR1_iso_289',c:2,kd:0.966,block:90.9,mac:3.566},{name:'a-hTfR1_iso_674',c:2,kd:0.972,block:84.2,mac:3.572},
  {name:'a-hTfR1_iso_18',c:2,kd:292.1,block:61.1,mac:312.7},{name:'a-hTfR1_iso_445',c:2,kd:354.6,block:56.3,mac:375.2},
  {name:'a-hTfR1_iso_876',c:2,kd:8.5,block:89.5,mac:11.1},{name:'a-hTfR1_iso_137',c:2,kd:120.1,block:58,mac:122.7},
  {name:'a-hTfR1_iso_592',c:2,kd:15.4,block:81.5,mac:18},{name:'a-hTfR1_iso_964',c:2,kd:0.924,block:78,mac:3.524},
  {name:'a-hTfR1_iso_43',c:2,kd:47.3,block:69.4,mac:49.9},{name:'a-hTfR1_iso_718',c:2,kd:122.5,block:68.2,mac:125.1},
  {name:'a-hTfR1_iso_326',c:3,kd:0.879,block:83.9,mac:1.879},{name:'a-hTfR1_iso_855',c:3,kd:458,block:79.8,mac:478.6},
  {name:'a-hTfR1_iso_199',c:3,kd:0.931,block:86,mac:2.531},{name:'a-hTfR1_iso_467',c:3,kd:0.975,block:88.4,mac:3.575},
  {name:'a-hTfR1_iso_83',c:3,kd:0.842,block:65.2,mac:3.442},{name:'a-hTfR1_iso_741',c:3,kd:0.863,block:88.8,mac:1.463},
  {name:'a-hTfR1_iso_514',c:3,kd:233.8,block:52.7,mac:236.4},{name:'a-hTfR1_iso_628',c:3,kd:138.3,block:51.4,mac:158.9},
  {name:'a-hTfR1_iso_97',c:3,kd:0.989,block:83.3,mac:3.589},{name:'a-hTfR1_iso_383',c:3,kd:129.3,block:93.5,mac:131.9},
  {name:'a-hTfR1_iso_776',c:4,kd:362.6,block:57.9,mac:383.2},{name:'a-hTfR1_iso_251',c:4,kd:0.972,block:85,mac:3.572},
  {name:'a-hTfR1_iso_639',c:4,kd:343.4,block:55.3,mac:346},{name:'a-hTfR1_iso_412',c:4,kd:272.2,block:77.3,mac:292.8},
  {name:'a-hTfR1_iso_58',c:4,kd:139.3,block:93.1,mac:159.9},{name:'a-hTfR1_iso_893',c:4,kd:323.4,block:76,mac:326},
  {name:'a-hTfR1_iso_174',c:4,kd:2.1,block:86.8,mac:4.7},{name:'a-hTfR1_iso_527',c:4,kd:4.9,block:94.3,mac:7.5},
  {name:'a-hTfR1_iso_346',c:4,kd:221.9,block:58.9,mac:224.5},{name:'a-hTfR1_iso_689',c:4,kd:0.802,block:69.1,mac:3.402},
  {name:'a-hTfR1_iso_112',c:5,kd:0.976,block:89.8,mac:3.576},{name:'a-hTfR1_iso_798',c:5,kd:417.2,block:64.2,mac:419.8},
  {name:'a-hTfR1_iso_435',c:5,kd:0.986,block:86.4,mac:3.586},{name:'a-hTfR1_iso_961',c:5,kd:159.3,block:57.9,mac:161.9},
  {name:'a-hTfR1_iso_264',c:5,kd:36.5,block:76.1,mac:39.1},{name:'a-hTfR1_iso_573',c:5,kd:0.804,block:91.4,mac:3.404},
  {name:'a-hTfR1_iso_88',c:5,kd:440,block:62.7,mac:460.6},{name:'a-hTfR1_iso_731',c:5,kd:473.9,block:71.5,mac:494.5},
  {name:'a-hTfR1_iso_407',c:5,kd:50.1,block:56.3,mac:52.7},{name:'a-hTfR1_iso_549',c:5,kd:247.1,block:61,mac:249.7}
];

// Lead panel data (15 leads carried forward, with per-run production/biophysics/potency data)
export const leads = [
  {name:'a-hTfR1_iso_612',clone:'14_2',runs:[{tpr:null,t1:.8,t2:.82,t3:.815,sec:88,agg:12,kd:1.119,hl:13.3,mac:2.719},{tpr:'TPR00000019',t1:.79,t2:.775,t3:.807,sec:93,agg:3,kd:.919,hl:14.3,mac:2.519},{tpr:'TPR00000067',t1:.3,t2:.324,t3:null,sec:92,agg:4,kd:1.819,hl:10.3,mac:3.419},{tpr:null,t1:.1,t2:.089,t3:.13,sec:68,agg:30,kd:10.819,hl:2.3,mac:12.419},{tpr:'TPR00000043',t1:.25,t2:.266,t3:.247,sec:84,agg:17,kd:.869,hl:11.3,mac:2.469},{tpr:'TPR00000091',t1:.15,t2:.174,t3:null,sec:68,agg:30,kd:.919,hl:3.3,mac:2.519},{tpr:null,t1:0,t2:0,t3:0,sec:15,agg:90,kd:null,hl:null,mac:null}]},
  {name:'a-hTfR1_iso_489',clone:'14_3',runs:[{tpr:null,t1:.75,t2:.77,t3:.765,sec:91,agg:9,kd:1.218,hl:15.1,mac:2.818},{tpr:'TPR00000020',t1:.74,t2:.725,t3:.757,sec:93,agg:4,kd:1.018,hl:16.1,mac:2.618},{tpr:'TPR00000068',t1:.25,t2:.274,t3:null,sec:94,agg:3,kd:1.918,hl:12.1,mac:3.518},{tpr:null,t1:.1,t2:.09,t3:.12,sec:70,agg:35,kd:10.918,hl:4.1,mac:12.518},{tpr:'TPR00000044',t1:.2,t2:.216,t3:.197,sec:87,agg:14,kd:.968,hl:13.1,mac:2.568},{tpr:'TPR00000092',t1:.1,t2:.124,t3:null,sec:70,agg:35,kd:1.018,hl:5.1,mac:2.618},{tpr:null,t1:0,t2:.08,t3:0,sec:15,agg:90,kd:null,hl:null,mac:null}]},
  {name:'a-hTfR1_iso_501',clone:'14_4',runs:[{tpr:null,t1:.88,t2:.9,t3:.895,sec:89,agg:15,kd:1.106,hl:12.8,mac:3.706},{tpr:'TPR00000021',t1:.87,t2:.855,t3:.887,sec:95,agg:2,kd:.906,hl:13.8,mac:3.506},{tpr:'TPR00000069',t1:.38,t2:.404,t3:null,sec:91,agg:2,kd:1.806,hl:9.8,mac:4.406},{tpr:null,t1:.1,t2:.91,t3:.1,sec:70,agg:24,kd:10.806,hl:1.8,mac:13.406},{tpr:'TPR00000045',t1:.33,t2:.346,t3:.327,sec:85,agg:20,kd:.856,hl:10.8,mac:3.456},{tpr:'TPR00000093',t1:.23,t2:.254,t3:null,sec:70,agg:24,kd:.906,hl:2.8,mac:3.506},{tpr:null,t1:.08,t2:.09,t3:.1,sec:15,agg:90,kd:null,hl:null,mac:null}]},
  {name:'a-hTfR1_iso_289',clone:'14_5',runs:[{tpr:null,t1:.5,t2:.52,t3:.515,sec:90,agg:11,kd:1.266,hl:26.4,mac:3.866},{tpr:'TPR00000022',t1:.49,t2:.475,t3:.507,sec:94,agg:5,kd:1.066,hl:27.4,mac:3.666},{tpr:'TPR00000070',t1:.47,t2:.494,t3:null,sec:95,agg:5,kd:1.466,hl:23.4,mac:4.066},{tpr:null,t1:.43,t2:.419,t3:.46,sec:80,agg:20,kd:1.486,hl:21.4,mac:4.086},{tpr:'TPR00000046',t1:.47,t2:.486,t3:.467,sec:86,agg:16,kd:1.016,hl:24.4,mac:3.616},{tpr:'TPR00000094',t1:.37,t2:.394,t3:.368,sec:80,agg:20,kd:1.066,hl:23.4,mac:3.666},{tpr:null,t1:.23,t2:.246,t3:.249,sec:90,agg:30,kd:1.036,hl:15.4,mac:3.636}]},
  {name:'a-hTfR1_iso_674',clone:'18_5',runs:[{tpr:null,t1:.54,t2:.56,t3:.555,sec:87,agg:14,kd:1.272,hl:27.6,mac:3.872},{tpr:'TPR00000023',t1:.53,t2:.515,t3:.547,sec:93,agg:3,kd:1.072,hl:28.6,mac:3.672},{tpr:'TPR00000071',t1:.51,t2:.534,t3:null,sec:93,agg:3,kd:1.472,hl:24.6,mac:4.072},{tpr:null,t1:.47,t2:.459,t3:.5,sec:84,agg:20,kd:1.492,hl:22.6,mac:4.092},{tpr:'TPR00000047',t1:.51,t2:.526,t3:.507,sec:83,agg:19,kd:1.022,hl:25.6,mac:3.622},{tpr:'TPR00000095',t1:.41,t2:.434,t3:.408,sec:84,agg:20,kd:1.072,hl:24.6,mac:3.672},{tpr:null,t1:.27,t2:.286,t3:.289,sec:74,agg:30,kd:1.042,hl:16.6,mac:3.642}]},
  {name:'a-hTfR1_iso_964',clone:'16_3',runs:[{tpr:null,t1:.57,t2:.59,t3:.585,sec:92,agg:13,kd:1.224,hl:28.8,mac:3.824},{tpr:'TPR00000024',t1:.56,t2:.545,t3:.577,sec:92,agg:4,kd:1.024,hl:29.8,mac:3.624},{tpr:'TPR00000072',t1:.54,t2:.564,t3:null,sec:90,agg:4,kd:1.424,hl:25.8,mac:4.024},{tpr:null,t1:.5,t2:.489,t3:.53,sec:82,agg:20,kd:1.444,hl:23.8,mac:4.044},{tpr:'TPR00000048',t1:.54,t2:.556,t3:.537,sec:88,agg:18,kd:.974,hl:26.8,mac:3.574},{tpr:'TPR00000096',t1:.44,t2:.464,t3:.438,sec:82,agg:20,kd:1.024,hl:25.8,mac:3.624},{tpr:null,t1:.3,t2:.316,t3:.319,sec:72,agg:30,kd:.994,hl:17.8,mac:3.594}]},
  {name:'a-hTfR1_iso_326',clone:'16_4',runs:[{tpr:null,t1:.9,t2:.92,t3:.915,sec:91,agg:8,kd:1.179,hl:46.9,mac:2.179},{tpr:'TPR00000016',t1:.89,t2:.875,t3:.907,sec:94,agg:2,kd:.979,hl:47.9,mac:1.979},{tpr:'TPR00000064',t1:.88,t2:.904,t3:null,sec:94,agg:3,kd:1.379,hl:43.9,mac:2.379},{tpr:null,t1:.87,t2:.859,t3:.9,sec:91,agg:12,kd:1.399,hl:41.9,mac:2.399},{tpr:'TPR00000040',t1:.78,t2:.796,t3:.777,sec:87,agg:13,kd:.929,hl:44.9,mac:1.929},{tpr:'TPR00000088',t1:.68,t2:.704,t3:.678,sec:91,agg:12,kd:.979,hl:43.9,mac:1.979},{tpr:null,t1:.47,t2:.486,t3:.489,sec:81,agg:22,kd:.949,hl:35.9,mac:1.949}]},
  {name:'a-hTfR1_iso_199',clone:'20_2',runs:[{tpr:null,t1:1.1,t2:1.12,t3:1.115,sec:88,agg:6,kd:1.231,hl:48.3,mac:2.831},{tpr:'TPR00000017',t1:1.09,t2:1.075,t3:1.107,sec:95,agg:2,kd:1.031,hl:49.3,mac:2.631},{tpr:'TPR00000065',t1:1.08,t2:1.104,t3:null,sec:92,agg:3,kd:1.431,hl:45.3,mac:3.031},{tpr:null,t1:1.07,t2:1.059,t3:1.1,sec:89,agg:15,kd:1.451,hl:43.3,mac:3.051},{tpr:'TPR00000041',t1:.98,t2:.996,t3:.977,sec:84,agg:11,kd:.981,hl:46.3,mac:2.581},{tpr:'TPR00000089',t1:.88,t2:.904,t3:.878,sec:89,agg:15,kd:1.031,hl:45.3,mac:2.631},{tpr:null,t1:.67,t2:.686,t3:.689,sec:79,agg:25,kd:1.001,hl:37.3,mac:2.601}]},
  {name:'a-hTfR1_iso_741',clone:'29_3',runs:[{tpr:null,t1:.97,t2:.99,t3:.985,sec:90,agg:10,kd:1.163,hl:47.2,mac:1.763},{tpr:'TPR00000018',t1:.96,t2:.945,t3:.977,sec:95,agg:3,kd:.963,hl:48.2,mac:1.563},{tpr:'TPR00000066',t1:.95,t2:.974,t3:null,sec:95,agg:3,kd:1.363,hl:44.2,mac:1.963},{tpr:null,t1:.94,t2:.929,t3:.97,sec:90,agg:13,kd:1.383,hl:42.2,mac:1.983},{tpr:'TPR00000042',t1:.85,t2:.866,t3:.847,sec:86,agg:15,kd:.913,hl:45.2,mac:1.513},{tpr:'TPR00000090',t1:.75,t2:.774,t3:.748,sec:90,agg:13,kd:.963,hl:44.2,mac:1.563},{tpr:null,t1:.54,t2:null,t3:.559,sec:80,agg:23,kd:.933,hl:36.2,mac:1.533}]},
  {name:'a-hTfR1_iso_251',clone:'42_2',runs:[{tpr:null,t1:.9,t2:.92,t3:.915,sec:89,agg:12,kd:1.272,hl:6.2,mac:3.872},{tpr:'TPR00000025',t1:.89,t2:.875,t3:.907,sec:94,agg:3,kd:1.072,hl:7.2,mac:3.672},{tpr:'TPR00000073',t1:.85,t2:.874,t3:null,sec:91,agg:3,kd:1.472,hl:3.2,mac:4.072},{tpr:null,t1:.78,t2:.769,t3:.81,sec:82,agg:18,kd:1.492,hl:1.2,mac:4.092},{tpr:'TPR00000049',t1:.68,t2:.696,t3:.677,sec:85,agg:17,kd:1.022,hl:4.2,mac:3.622},{tpr:'TPR00000096',t1:.58,t2:.604,t3:.578,sec:82,agg:18,kd:1.072,hl:3.2,mac:3.672},{tpr:null,t1:.48,t2:.496,t3:.499,sec:72,agg:28,kd:1.042,hl:.8,mac:3.642}]},
  {name:'a-hTfR1_iso_174',clone:'42_4',runs:[{tpr:null,t1:.6,t2:.62,t3:.615,sec:92,agg:9,kd:2.4,hl:7.4,mac:5},{tpr:'TPR00000026',t1:.59,t2:.575,t3:.607,sec:95,agg:5,kd:2.2,hl:8.4,mac:4.8},{tpr:'TPR00000074',t1:.55,t2:.574,t3:null,sec:93,agg:5,kd:2.6,hl:4.4,mac:5.2},{tpr:null,t1:.48,t2:.469,t3:.51,sec:80,agg:22,kd:2.62,hl:2.4,mac:5.22},{tpr:'TPR00000050',t1:.38,t2:.396,t3:.377,sec:88,agg:14,kd:2.15,hl:5.4,mac:4.75},{tpr:'TPR00000097',t1:.28,t2:.304,t3:.278,sec:80,agg:22,kd:2.2,hl:4.4,mac:4.8},{tpr:null,t1:.18,t2:.196,t3:.199,sec:70,agg:32,kd:2.17,hl:1.4,mac:4.77}]},
  {name:'a-hTfR1_iso_527',clone:'44_3',runs:[{tpr:null,t1:.74,t2:.76,t3:.755,sec:87,agg:14,kd:5.2,hl:5.9,mac:7.8},{tpr:'TPR00000027',t1:.73,t2:.715,t3:.747,sec:93,agg:2,kd:5.0,hl:6.9,mac:7.6},{tpr:'TPR00000075',t1:.69,t2:.714,t3:null,sec:94,agg:2,kd:5.4,hl:2.9,mac:8},{tpr:null,t1:.62,t2:.609,t3:.65,sec:84,agg:20,kd:15.4,hl:.9,mac:18},{tpr:'TPR00000051',t1:.52,t2:.536,t3:.517,sec:83,agg:19,kd:4.95,hl:3.9,mac:7.55},{tpr:'TPR00000098',t1:.42,t2:.444,t3:.418,sec:84,agg:20,kd:5.0,hl:2.9,mac:7.6},{tpr:null,t1:.32,t2:.336,t3:.339,sec:74,agg:30,kd:4.97,hl:.9,mac:7.57}]},
  {name:'a-hTfR1_iso_112',clone:'44_5',runs:[{tpr:null,t1:.8,t2:.82,t3:.815,sec:91,agg:11,kd:1.276,hl:7.6,mac:3.876},{tpr:'TPR00000028',t1:.79,t2:.775,t3:.807,sec:92,agg:4,kd:1.076,hl:8.6,mac:3.676},{tpr:'TPR00000076',t1:.2,t2:.224,t3:null,sec:90,agg:4,kd:1.976,hl:4.6,mac:4.576},{tpr:null,t1:.09,t2:.09,t3:.12,sec:70,agg:45,kd:null,hl:null,mac:null},{tpr:'TPR00000052',t1:.2,t2:.216,t3:.197,sec:87,agg:16,kd:1.026,hl:5.6,mac:3.626},{tpr:'TPR00000099',t1:.1,t2:null,t3:.098,sec:70,agg:45,kd:null,hl:null,mac:null},{tpr:null,t1:0,t2:0,t3:0,sec:null,agg:null,kd:null,hl:null,mac:null}]},
  {name:'a-hTfR1_iso_435',clone:'54_5',runs:[{tpr:null,t1:.81,t2:.83,t3:.825,sec:90,agg:15,kd:1.286,hl:8.3,mac:3.886},{tpr:'TPR00000029',t1:.8,t2:.785,t3:.817,sec:93,agg:3,kd:1.086,hl:9.3,mac:3.686},{tpr:'TPR00000077',t1:.21,t2:.234,t3:null,sec:92,agg:3,kd:1.986,hl:5.3,mac:4.586},{tpr:null,t1:.08,t2:.08,t3:.09,sec:74,agg:40,kd:null,hl:null,mac:null},{tpr:'TPR00000053',t1:.21,t2:.226,t3:.207,sec:86,agg:20,kd:1.036,hl:6.3,mac:3.636},{tpr:'TPR00000100',t1:.11,t2:null,t3:.108,sec:74,agg:40,kd:null,hl:null,mac:null},{tpr:null,t1:0,t2:0,t3:0,sec:null,agg:null,kd:null,hl:null,mac:null}]},
  {name:'a-hTfR1_iso_573',clone:'71_4',runs:[{tpr:null,t1:.85,t2:.87,t3:.865,sec:88,agg:13,kd:1.104,hl:9.4,mac:3.704},{tpr:'TPR00000030',t1:.84,t2:.825,t3:.857,sec:95,agg:5,kd:.904,hl:10.4,mac:3.504},{tpr:'TPR00000078',t1:.25,t2:.274,t3:null,sec:95,agg:5,kd:1.804,hl:6.4,mac:4.404},{tpr:null,t1:.1,t2:.089,t3:.13,sec:75,agg:41,kd:null,hl:null,mac:null},{tpr:'TPR00000054',t1:.25,t2:.266,t3:.247,sec:84,agg:18,kd:.854,hl:7.4,mac:3.454},{tpr:'TPR00000101',t1:.15,t2:null,t3:.148,sec:75,agg:41,kd:null,hl:null,mac:null},{tpr:null,t1:0,t2:0,t3:0,sec:null,agg:null,kd:null,hl:null,mac:null}]}
];

// ---- Helper / classification functions ----
export function kdClass(v) { return v == null ? 'na' : v < 2 ? 'g' : v < 10 ? 'a' : 'r'; }
export function secClass(v) { return v == null ? 'na' : v >= 90 ? 'g' : v >= 80 ? 'a' : 'r'; }
export function aggClass(v) { return v == null ? 'na' : v < 10 ? 'g' : v < 20 ? 'a' : 'r'; }
export function hlClass(v) { return v == null ? 'na' : v > 30 ? 'g' : v > 10 ? 'a' : 'r'; }
export function fmt(v, d) { return v == null ? 'NA' : parseFloat(v.toFixed(d != null ? d : 2)).toString(); }
export function avgT(r) {
  const v = [r.t1, r.t2, r.t3].filter((x) => x != null && x > 0);
  return v.length ? v.reduce((a, b) => a + b) / v.length : null;
}
export function getBestRun(lead) {
  let best = null, bestKd = Infinity;
  lead.runs.forEach((r, i) => {
    if (r.kd != null && r.sec >= 85 && r.kd < bestKd) { bestKd = r.kd; best = { run: i, r }; }
  });
  if (!best) {
    bestKd = Infinity;
    lead.runs.forEach((r, i) => {
      if (r.kd != null && r.kd < bestKd) { bestKd = r.kd; best = { run: i, r }; }
    });
  }
  return best;
}
