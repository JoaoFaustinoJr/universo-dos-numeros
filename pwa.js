(() => {
  const install = document.getElementById('install-app');
  const share = document.getElementById('share-app');
  const status = document.getElementById('app-status');
  const link = new URL('./', location.href).href;
  let prompt;
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(error => console.warn('Modo offline indisponível:', error));
  }
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    prompt = event;
  });
  window.addEventListener('appinstalled', () => { install.hidden = true; });
  if (matchMedia('(display-mode: standalone)').matches || navigator.standalone) install.hidden = true;
  install.onclick = async () => {
    if (!prompt) {
      status.textContent = 'No menu do navegador, escolha Instalar aplicativo ou Adicionar à tela inicial. No iPhone, use Compartilhar no Safari.';
      return;
    }
    try { await prompt.prompt(); }
    catch { status.textContent = 'Use a opção de instalação no menu do navegador.'; }
    finally { prompt = null; }
  };
  share.onclick = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url: link });
      } else {
        await navigator.clipboard.writeText(link);
        status.textContent = 'Link copiado.';
      }
    } catch (error) {
      if (error.name !== 'AbortError') status.textContent = link;
    }
  };
})();
