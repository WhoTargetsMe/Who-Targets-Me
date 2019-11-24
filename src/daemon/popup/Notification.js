import $ from "jquery";

export const initPopup = function() {
  $(function() {
    $('body').append(`<div id="popup_container" style="position:absolute; display:flex; flex-flow: row nowrap; align-items:flex-start;right:0; top:0; width:250px; font-size: 12px; background-color:#f2f2f2;z-index:2000; border:1px solid grey;box-shadow: 2px 2px 2px grey;padding:10px 10px 10px 15px;" onclick="$("#popup_container").hide();">
    <div style="flex:1;min-width:210px;text-align:justify;margin-right:5px;">
      <div style="display:flex;align-items:center;">
        <img src="https://whotargets.me/wp-content/uploads/2017/10/wtm_logo_border.png" width="25" height="25"/>
        <h6 style="padding-left:10px;">Who Targets Me</h6>
      </div>
      <p>
        You're now updated to the latest version of Who Targets Me?
      </p>
      <p>Please click on the icon to complete installation.</p>
      <p>
        Thanks,<br>
        The Who Targets Me? Team
      </p>
    </div>
    <div id="popup_close" style="flex:1;min-width:10px;max-width:10px;font-weight:bold;cursor:pointer;margin-top:3px;">X</div>
    </div>`)
    $('#popup_container').on('click', function(){
      $(this).hide();
      chrome.storage.promise.local.set({'is_notified_GE': 'yes'});
    });
    $('#popup_close').on('click', function(){
      $('#popup_container').hide();
      chrome.storage.promise.local.set({'is_notified_GE': 'yes'});
    });
  });
};
