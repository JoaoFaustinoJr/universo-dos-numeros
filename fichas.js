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
  for (const sheet of sheets) {
    const card=document.createElement('details');
    card.style.margin='1rem 0';
    card.innerHTML='<summary>'+sheet.title+'</summary><p>'+sheet.text+'</p><div class="tools"></div><p role="status"></p><label>Entrada para o gerador <input readonly></label><div class="tools"><button type="button">Copiar</button><button type="button">Abrir no gerador</button></div>';
    const fields=sheet.fields.map((name,i)=>{
      const label=document.createElement('label');
      const input=document.createElement('input');
      input.type='number'; input.step='any'; input.value=sheet.values[i];
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
        const values=fields.map(input=>input.valueAsNumber);
        if(!values.every(Number.isFinite)) throw Error('Preencha todos os valores.');
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
    update();
    byId('formula-sheets').append(card);
  }
})();
