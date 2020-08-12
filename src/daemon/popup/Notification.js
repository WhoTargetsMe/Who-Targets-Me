import $ from "jquery";

const RESULTS_URL = process.env.RESULTS_URL;

export const initPopup = function() {
  $(function() {
    if (RESULTS_URL.indexOf(window.location.href) > -1) {
      return;
    }
    $('body').append(`<div id="popup_container" style="position:absolute; display:flex; flex-flow: row nowrap; align-items:flex-start;right:0; top:0; width:250px; font-size: 12px; background-color:#f2f2f2;z-index:2000; border:1px solid grey;box-shadow: 2px 2px 2px grey;padding:10px 10px 10px 15px;" onclick="$("#popup_container").hide();">
    <div style="flex:1;min-width:210px;text-align:justify;margin-right:5px;">
      <div style="display:flex;align-items:center;">
        <img src="https://whotargets.me/wp-content/uploads/2020/06/wtm_logo_2020.png" width="25" height="25" style="max-width: 25px; max-height: 25px;"/>
        <h6 style="padding-left:10px;">Who Targets Me</h6>
      </div>
      <p>
        You’ve been updated to the latest version of Who Targets Me.
      </p>
      <p>Click <a href="${RESULTS_URL}" target="_blank"><em>here</em></a> to complete set up.</p>
      <p>When you're set, a click on the extension icon in your toolbar above (next to the address bar) will bring you to personalised results page.</p>
      <p>
        Thanks!
      </p>
    </div>
    <div id="popup_close" style="flex:1;min-width:10px;max-width:10px;font-weight:bold;cursor:pointer;margin-top:3px;">X</div>
    </div>`)
    $('#popup_container').on('click', function(){
      $(this).hide();
      chrome.storage.promise.local.set({userData: {'isNotifiedRegister': 'yes'}});
    });
    $('#popup_close').on('click', function(){
      $('#popup_container').hide();
      chrome.storage.promise.local.set({userData: {'isNotifiedRegister': 'yes'}});
    });
  });
};
