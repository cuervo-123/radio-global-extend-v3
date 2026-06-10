(function(){
  function ready(fn){
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function(){
    try {
      if (document.getElementById('tbAutoMiniPipExternalPanel')) return;

      var panel = document.createElement('div');
      panel.id = 'tbAutoMiniPipExternalPanel';
      panel.style.cssText = [
        'position:fixed',
        'left:18px',
        'bottom:18px',
        'z-index:999999',
        'display:flex',
        'gap:8px',
        'align-items:center',
        'flex-wrap:wrap',
        'padding:10px',
        'border-radius:18px',
        'background:rgba(8,12,24,.94)',
        'border:1px solid rgba(255,255,255,.14)',
        'box-shadow:0 20px 50px rgba(0,0,0,.45)',
        'backdrop-filter:blur(10px)'
      ].join(';');

      panel.innerHTML =
        '<button id="tbAutoMiniStart" type="button" style="border:0;border-radius:999px;padding:10px 14px;background:linear-gradient(135deg,#4a7bff,#6a96ff);color:#fff;font-weight:800;cursor:pointer">▶ Auto Mini PiP</button>' +
        '<button id="tbAutoMiniNext" type="button" style="border:0;border-radius:999px;padding:10px 14px;background:#253050;color:#fff;font-weight:800;cursor:pointer">⏭ Next</button>' +
        '<button id="tbAutoMiniStop" type="button" style="border:0;border-radius:999px;padding:10px 14px;background:#253050;color:#fff;font-weight:800;cursor:pointer">⏹ Stop</button>' +
        '<input id="tbAutoMiniSeconds" type="number" min="20" max="1800" value="180" title="segundos por emisora/media" style="width:86px;border-radius:999px;border:1px solid rgba(255,255,255,.14);padding:10px;background:#0c1327;color:#fff;font-weight:800;text-align:center">';

      document.body.appendChild(panel);

      var timer = null;
      var running = false;
      var index = 0;

      function showMsg(msg, type){
        if (typeof window.showStatus === 'function') {
          window.showStatus(msg, type || 'ok');
          return;
        }
        var st = document.getElementById('status');
        if (st) st.textContent = msg;
      }

      function getDelay(){
        var input = document.getElementById('tbAutoMiniSeconds');
        var n = parseInt(input && input.value ? input.value : '180', 10);
        if (!isFinite(n)) n = 180;
        return Math.max(20, Math.min(1800, n)) * 1000;
      }

      function getMiniButtons(){
        return Array.prototype.slice.call(document.querySelectorAll('.mini-pip-trigger'))
          .filter(function(btn){
            return btn && !btn.disabled && btn.offsetParent !== null;
          });
      }

      function unmuteMini(){
        setTimeout(function(){
          var root = document.querySelector('#miniPip') || document;
          var iframe = root.querySelector('iframe');
          if (iframe && iframe.src) {
            iframe.src = iframe.src
              .replace('mute=1', 'mute=0')
              .replace('&muted=1', '')
              .replace('?muted=1', '?');
          }

          var video = root.querySelector('video');
          if (video) {
            video.muted = false;
            video.volume = 1;
            video.play().catch(function(){});
          }

          var audio = root.querySelector('audio');
          if (audio) {
            audio.muted = false;
            audio.volume = 1;
            audio.play().catch(function(){});
          }
        }, 1200);
      }

      function stop(){
        running = false;
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        showMsg('⏹ Auto Mini PiP detenido.');
      }

      function play(){
        var buttons = getMiniButtons();

        if (!buttons.length) {
          stop();
          showMsg('No hay botones Mini PiP todavía.', 'err');
          return;
        }

        if (index >= buttons.length) index = 0;
        if (index < 0) index = buttons.length - 1;

        try {
          buttons[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch(e) {}

        buttons[index].click();
        unmuteMini();

        showMsg('▶ Auto Mini PiP: item ' + (index + 1) + ' de ' + buttons.length);

        index++;

        if (running) {
          timer = setTimeout(play, getDelay());
        }
      }

      document.getElementById('tbAutoMiniStart').onclick = function(){
        if (timer) clearTimeout(timer);
        running = true;
        index = 0;
        play();
      };

      document.getElementById('tbAutoMiniNext').onclick = function(){
        if (timer) clearTimeout(timer);
        running = true;
        play();
      };

      document.getElementById('tbAutoMiniStop').onclick = stop;

    } catch(err) {
      console.error(err);
    }
  });
})();
