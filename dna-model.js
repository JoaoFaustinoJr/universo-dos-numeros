function model(raw){const ds=(raw.match(/\d/g)||[]).map(Number);if(!ds.length)throw Error('Digite pelo menos um algarismo.');let h=2166136261>>>0;for(let i=0;i<ds.length;i++)h=Math.imul(h^(ds[i]+i*17),16777619)>>>0;const sum=ds.reduce((a,b)=>a+b,0),weighted=ds.reduce((a,b,i)=>a+b*(i+1),0),trans=ds.reduce((a,b,i)=>a+(i&&b!==ds[i-1]?1:0),0);return{raw,ds,sum,weighted,trans,h,freq:3+(weighted+ds[0]*3)%10,layers:5+(sum+trans)%10,phase:(h%628)/100,twist:.08+((h>>>8)%90)/240,wave:1+(ds.at(-1)+trans)%8,height:.14+((h>>>23)%10)*.035,ellipse:.7+((h>>>12)%35)/100}}function classicPoint(m,s,u){const layer=s*(m.layers-1),base=.43+.57*Math.pow(Math.abs(Math.cos(m.freq*u/2+m.phase+layer*m.twist)),1.2),r=(.65+.035*layer)*base*(1+.17*Math.sin(m.wave*u+layer*.28+m.phase));return{x:r*Math.cos(u),y:r*Math.sin(u)*m.ellipse,z:(s-.5)*m.layers*.115+m.height*Math.sin(m.wave*u+layer*.24)}}

const dnaFamilies = ['Rosácea', 'Nó toroidal', 'Fita torcida', 'Hélice'];
function dnaFamily(m) { return m.ds.join('') === '314159265' ? 0 : (m.h >>> 16) % dnaFamilies.length; }
function point(m,s,u) {
  const v = u + m.phase;
  const band = 2*s - 1;
  const ripple = .08 * Math.cos(m.freq*u + m.phase);
  switch (dnaFamily(m)) {
    case 1: {
      const radius = .57 + (.24 + .09*band)*Math.cos(3*v);
      return {x:radius*Math.cos(2*v),y:radius*Math.sin(2*v)*m.ellipse,z:(.26+.09*band)*Math.sin(3*v)+ripple};
    }
    case 2: {
      const twist = (1 + m.wave%3)*v/2;
      const radius = .68 + .29*band*Math.cos(twist) + ripple;
      return {x:radius*Math.cos(v),y:radius*Math.sin(v)*m.ellipse,z:.32*band*Math.sin(twist)};
    }
    case 3: {
      const turns = 2 + m.wave%3;
      const radius = .3 + .24*s + ripple;
      return {x:radius*Math.cos(turns*v),y:radius*Math.sin(turns*v)*m.ellipse,z:1.45*(u/(2*Math.PI)-.5)+.22*band};
    }
    default: return classicPoint(m,s,u);
  }
}
