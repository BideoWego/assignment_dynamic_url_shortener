

$(document).ready(function() {
  var baseUrl = $('body').eq(0).attr('data-base-url');
  var socket = io.connect(baseUrl);

  socket.on('click', function(urlId, numClicks) {
    var $clicks = $('*[data-url-id="' + urlId + '"]').eq(0);
    $clicks.text(numClicks);
  });
});




