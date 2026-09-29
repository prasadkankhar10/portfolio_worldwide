const { spawn } = require('child_process');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9555',
  '--disable-gpu',
  '--no-sandbox',
  'http://localhost:5173/portfolio_worldwide/'
]);

setTimeout(async () => {
  try {
    const listRes = await fetch('http://127.0.0.1:9555/json');
    const tabs = await listRes.json();
    const pageTab = tabs.find(t => t.type === 'page');

    if (pageTab) {
      const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
      let msgId = 1;
      const send = (method, params = {}) => {
        return new Promise((resolve) => {
          const id = msgId++;
          const handler = (evt) => {
            const data = JSON.parse(evt.data);
            if (data.id === id) {
              ws.removeEventListener('message', handler);
              resolve(data.result);
            }
          };
          ws.addEventListener('message', handler);
          ws.send(JSON.stringify({ id, method, params }));
        });
      };

      ws.onopen = async () => {
        await send('Runtime.enable');
        await new Promise(r => setTimeout(r, 4000));

        // Click Start
        await send('Runtime.evaluate', {
          expression: `(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const b = btns.find(x => /start|enter|play|explore/i.test(x.textContent));
            if (b) b.click();
          })()`
        });

        // Wait 3s
        await new Promise(r => setTimeout(r, 3000));

        // Sample 1
        const s1 = await send('Runtime.evaluate', {
          expression: `window.__ANIM_DEBUG__`,
          returnByValue: true
        });
        console.log('Sample 1 (T=3s):', s1?.result?.value);

        // Wait another 2s
        await new Promise(r => setTimeout(r, 2000));

        // Sample 2
        const s2 = await send('Runtime.evaluate', {
          expression: `window.__ANIM_DEBUG__`,
          returnByValue: true
        });
        console.log('Sample 2 (T=5s):', s2?.result?.value);

        ws.close();
        chrome.kill();
      };
    } else {
      chrome.kill();
    }
  } catch (err) {
    console.error(err);
    chrome.kill();
  }
}, 2000);
