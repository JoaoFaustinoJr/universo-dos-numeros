(() => {
  const format = n => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 6 }).format(n);
  const sheets = [
    { title: '1º grau', text: 'Em y = bx + c, b define a inclinação. Para achar a raiz, resolva bx + c = 0.', fields: ['b','c'], values: [2,-4], target: 'grafico', solve: ([b,c]) => ({
      data: [0,b,c], result: b ? 'x = −c/b = '+format(-c/b) : c ? 'Reta horizontal sem raiz.' : 'Todo x real é raiz.'
    }) },
    { title: '2º grau e Bhaskara', text: 'Calcule Δ = b² − 4ac. Para Δ ≥ 0, use x = (−b ± √Δ)/(2a).', fields: ['a','b','c'], values: [1,-5,6], target: 'grafico', solve: ([a,b,c]) => {
      if (!a) throw Error('Use a diferente de zero para uma equação do 2º grau.');
      const d=b*b-4*a*c;
      return { data:[a,b,c], result:'Δ = '+format(d)+' · '+(d<0?'Sem raízes reais.':d===0?'Raiz dupla: '+format(-b/(2*a)):'Raízes: '+[(-b-Math.sqrt(d))/(2*a),(-b+Math.sqrt(d))/(2*a)].sort((x,y)=>x-y).map(format).join(' e ')) };
    } },
    { title: 'Superfície de sela', text: 'Em z = k(x² − y²), uma direção sobe e a outra desce. Mude k e gire a malha.', fields: ['k'], values:[1], target:'formas', solve: ([k]) => ({ data:k+'*(x^2-y^2)', result:'No ponto (1, 0), z = '+format(k)+'. No ponto (0, 1), z = '+format(-k)+'.' }) },
    { title: 'Fibonacci', text: 'Comece com 1, 1 e some os dois últimos termos para obter o próximo. O DNA usa os algarismos concatenados.', fields:['Termos (2 a 12)'], values:[7], target:'dna', solve: ([n]) => {
      if(!Number.isInteger(n)||n<2||n>12) throw Error('Escolha entre 2 e 12 termos inteiros.');
      const terms=[1,1];
      while(terms.length<n) terms.push(terms.at(-2)+terms.at(-1));
      return { data:terms.join(''),result:terms.join(', ') };
    } }
  ];
  sheets.push(
    {title:'Ondas circulares', text:'Em z = A cos(k√(x²+y²)), A é a amplitude e k determina o espaçamento entre cristas.', fields:['A (0 a 6)','k (> 0)'], values:[1,4], target:'formas', solve:([amplitude,k])=>{
      if(amplitude<0||amplitude>6||k<=0) throw Error('Use A entre 0 e 6 e k maior que zero.');
      return {data:amplitude+'*cos('+k+'*sqrt(x^2+y^2))',result:'Amplitude = '+format(amplitude)+' · Distância entre cristas = '+format(2*Math.PI/k)};
    }},
    {title:'Parábola com vértice móvel',text:'Em y = a(x−h)²+k, o vértice é (h, k). Ao desenvolver o quadrado, obtemos b = −2ah e c = ah²+k.',fields:['a','h','k'],values:[1,2,-1],target:'grafico',solve:([a,h,k])=>{
      if(!a) throw Error('Use a diferente de zero.');
      const b=-2*a*h,c=a*h*h+k;
      return {data:[a,b,c],result:'Vértice ('+format(h)+'; '+format(k)+') · b = '+format(b)+' · c = '+format(c)};
    }},
    {title:'Sequências com a mesma soma',text:'A soma comum reúne os dígitos. Na soma ponderada, multiplique cada dígito pela posição, começando em 1.',fields:['Sequência'],values:['1234'],target:'dna',sequence:true,solve:([sequence])=>{
      if(!/^[0-9]{2,32}$/.test(sequence)) throw Error('Digite de 2 a 32 algarismos.');
      const reversed=[...sequence].reverse().join('');
      const weighted=value=>[...value].reduce((sum,digit,i)=>sum+Number(digit)*(i+1),0);
      const sum=[...sequence].reduce((total,digit)=>total+Number(digit),0);
      return {data:sequence,reversed,result:'Inversa: '+reversed+' · Soma comum: '+sum+' · Somas ponderadas: '+weighted(sequence)+' e '+weighted(reversed)};
    }}
  );
  function applyGraph(data) {
    if (data.length!==3 || data.some((n,i)=>!Number.isFinite(n)||n<+coefficients[i].min||n>+coefficients[i].max||Math.abs(n*2-Math.round(n*2))>1e-9)) {
      throw Error('O gráfico aceita a de −3 a 3, b de −8 a 8 e c de −12 a 12, em passos de 0,5.');
    }
    coefficients.forEach((input,i)=>{input.value=data[i]});
    save(); render();
  }
  byId('apply-coefficients').onclick=()=>{
    const parts=byId('paste-coefficients').value.split(';').map(s=>s.trim().replace(',','.'));
    try {
      if(parts.some(s=>!s)) throw Error('Separe os três coeficientes com ponto e vírgula.');
      applyGraph(parts.map(Number));
      byId('paste-status').textContent='Coeficientes aplicados.';
    } catch(e) { byId('paste-status').textContent=e.message; }
  };
  const notes = [
  [
    "Estimar um custo com tarifa fixa e preço por unidade, como uma corrida com bandeirada.",
    "Troque b de 2 para −2. A reta passa a descer e continua cruzando o eixo y em c."
  ],
  [
    "Modelar a altura de um objeto lançado, desprezando a resistência do ar. Uma raiz pode indicar quando ele chega ao chão.",
    "Com a = 1 e b = −5, compare c = 6 e c = 7. O discriminante passa de 1 para −3 e a parábola deixa de cruzar o eixo x."
  ],
  [
    "Estudar superfícies com curvaturas opostas em duas direções, como em modelos de coberturas.",
    "Troque k de 1 para −1 e observe como as direções de subida e descida se invertem."
  ],
  [
    "Estudar padrões de crescimento definidos pela soma de termos anteriores.",
    "Divida 13 por 8 e depois 21 por 13. Ao avançar na sequência, a razão entre termos consecutivos se aproxima do número de ouro, cerca de 1,618."
  ]
];
  notes.push(
    ['Modelar ondulações que se espalham em anéis a partir de um ponto.','Desafio: faça aparecer mais anéis sem aumentar a altura. Mantenha A e aumente k.'],
    ['Localizar a altura mínima ou máxima de uma parábola.','Desafio: posicione o vértice em (1; 2) e confirme no gráfico. Use valores que gerem coeficientes aceitos pelo gráfico.'],
    ['Investigar como a posição de um algarismo influencia o resultado do DNA Matemático.','Desafio: compare 1234 e 4321. Ambas somam 10. As somas ponderadas são 30 e 20.']
  );
  for (const [index, sheet] of sheets.entries()) {
    const [use, curiosity] = notes[index];
    const card=document.createElement('details');
    card.style.margin='1rem 0';
    card.innerHTML='<summary>'+sheet.title+'</summary><p><strong>O que é</strong> · '+sheet.text+'</p><p><strong>Para que serve</strong> · '+use+'</p><p><strong>Curiosidade</strong> · '+curiosity+'</p><div class="tools"></div><p role="status"></p><label>Entrada para o gerador <input readonly></label><div class="tools"><button type="button">Copiar</button><button type="button">Abrir no gerador</button></div>';
    const fields=sheet.fields.map((name,i)=>{
      const label=document.createElement('label');
      const input=document.createElement('input');
      input.type=sheet.sequence?'text':'number'; input.step='any';
      if(sheet.sequence){input.inputMode='numeric';input.maxLength=32;} input.value=sheet.values[i];
      input.style.width='6em';
      label.append(name+' ',input);
      card.querySelector('.tools').append(label);
      return input;
    });
    const status=card.querySelector('[role=status]');
    const output=card.querySelector('[readonly]');
    const [copy,open]=card.querySelectorAll('button');
    let solution;
    function update() {
      try {
        const values=fields.map(input=>sheet.sequence?input.value.trim():input.valueAsNumber);
        if(!sheet.sequence&&!values.every(Number.isFinite)) throw Error('Preencha todos os valores.');
        solution=sheet.solve(values);
        status.textContent=solution.result;
        output.value=Array.isArray(solution.data)?solution.data.join('; '):solution.data;
      } catch(e) { solution=null; status.textContent=e.message; output.value=''; }
      copy.disabled=open.disabled=!solution;
    }
    fields.forEach(input=>input.oninput=update);
    copy.onclick=async()=>{
      try { await navigator.clipboard.writeText(output.value); status.textContent=solution.result+' · Copiado.'; }
      catch { output.select(); status.textContent='Selecione e copie a entrada exibida.'; }
    };
    open.onclick=()=>{
      try {
        if(sheet.target==='grafico') applyGraph(solution.data);
        selectView(sheet.target);
        if(sheet.target==='dna') passToLab('dna','rai:seed',solution.data);
        if(sheet.target==='formas') passToLab('formas','rai:formula',solution.data);
        document.querySelector('[data-view="'+sheet.target+'"]').focus();
      } catch(e) { status.textContent=e.message; }
    };
    if(sheet.sequence){
      const reverse=document.createElement('button');
      reverse.type='button';
      reverse.textContent='Usar sequência invertida';
      reverse.onclick=()=>{if(solution){fields[0].value=solution.reversed;update();}};
      open.after(reverse);
    }
    update();
    byId('formula-sheets').append(card);
  }
})();
