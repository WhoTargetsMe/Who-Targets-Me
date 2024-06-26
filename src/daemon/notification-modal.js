(function injectOverlay() {
  const style = document.createElement("style");
  const currentScript = document.currentScript;
  const { logoUrl, resultUrl, fontWoffUrl, fontWoff2Url } = currentScript.dataset;

  style.innerHTML = `
    @font-face {
        font-family: 'Varela Round';
        src: url('${fontWoff2Url}') format('woff2'),
             url('${fontWoffUrl}') format('woff');
        font-weight: normal;
        font-style: normal;
    }
    #wtm-extension-overlay.wtm-overlay {
      position: fixed;
      top: 20px;
      right: 20px;
      width: auto;
      height: auto;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 99000;
      padding: 10px;
      border-radius: 8px;
      font-family: 'Varela Round', sans-serif !important;
      font-size: 14px;
      color: #333;
    }
    #wtm-extension-overlay.wtm-overlay .wtm-overlay-content {
      position: relative;
      background: white;
      padding: 20px;
      padding-right: 40px;
      border-radius: 12px;
      box-shadow: 0px 0px 2px 3px #999;
      font-family: 'Varela Round', sans-serif !important;
    }

    #wtm-extension-overlay.wtm-overlay .wtm-overlay-block-header {
      font-weight: bold;
      margin: 16px auto 16px auto;
      text-align: center;
      font-size: 20px;
      display: inline-block;
      padding-left: 10px;
    }

    #wtm-extension-overlay.wtm-overlay .wtm-overlay-icon {
      text-align: center;
      width: 50px;
      height: 50px;
    }

    #wtm-extension-overlay.wtm-overlay .wtm-overlay-btn {
      font-family: 'Varela Round', sans-serif !important;
      color: #fff;
      display: inline-block;
      font-weight: 400;
      color: #212529;
      text-align: center;
      vertical-align: middle;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      background-color: transparent;
      border: 1px solid transparent;
      padding: .375rem .75rem;
      line-height: 1.5;
      border-radius: .5rem;
      transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out;
      text-decoration: inherit;
    }

    #wtm-extension-overlay.wtm-overlay .wtm-overlay-message {
      margin-top: 10px;
      margin-bottom: 20px;
      text-align: center;
      font-weight: 500;
      margin-left: 12px;
    }

    #wtm-extension-overlay.wtm-overlay .wtm-overlay-btn-primary {
      color: #fff;
      background-color: #007bff;
      border-color: #007bff;
    }

    #wtm-extension-overlay.wtm-overlay .wtm-overlay-btn-outline {
      text-decoration: underline;
      cursor: pointer;
      padding: 0;
    }
    
  `;
  document.head.appendChild(style);

  // Create the overlay HTML
  const overlay = document.createElement("div");
  overlay.id = "wtm-extension-overlay";
  overlay.className = "wtm-overlay";
  overlay.innerHTML = `
    <div class="wtm-overlay-content">
      <div id="wtm-close-overlay" style="position: absolute; top: 10px; right: 10px; cursor: pointer;">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
        </svg>
      </div>
      <div style="display:flex; align-items:center">
        <img class="wtm-overlay-icon" src="${logoUrl}" alt="Who Targets Me Logo">
        <h3 class="wtm-overlay-block-header">Hey there, from Who Targets Me</h3>
      </div>
      <p class="wtm-overlay-message">We now support more platforms, please update your consent.</p>
      <p style="text-align:center">
        <a class="wtm-overlay-btn wtm-overlay-btn-primary" id="wtm_provide_consent-button" target="_blank" href="${resultUrl}/consent">Provide Consent</a>
      </p>
      <div style="text-align:center; margin-top:10px">
        <a class="wtm-overlay-btn wtm-overlay-btn-outline" id="wtm-ask-me-later-button">Ask me later</a>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById("wtm_provide_consent-button").addEventListener("click", () => {
    document.body.removeChild(overlay);
    document.head.removeChild(style);
    askMeLater(1);
  });

  document.getElementById("wtm-close-overlay").addEventListener("click", () => {
    setTimeout(() => {
      document.body.removeChild(overlay);
      document.head.removeChild(style);
      askMeLater(1);
    }, 500);
  });

  document.getElementById("wtm-ask-me-later-button").addEventListener("click", () => {
    setTimeout(() => {
      document.body.removeChild(overlay);
      document.head.removeChild(style);
      askMeLater(7);
    }, 500);
  });
})();

const askMeLater = (day) => {
  const now = new Date();
  const askMeLaterDate = new Date(now.setDate(now.getDate() + day));

  window.postMessage({
    action: "UPDATE_USER_CONSENT",
    payload: {
      askMeLaterDate,
    },
  });
};
