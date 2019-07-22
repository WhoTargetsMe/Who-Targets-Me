import $ from "jquery";
// import strings from '../../frontend/helpers/localization.js';

export const optOutHelper = function() {
  $(function() {
    $('button[id ^= hideme_]').on('click', function(){
      console.log('Data on button', $(this).attr('data'))
      $(this).parent().hide('slow');
    });

  });
};
