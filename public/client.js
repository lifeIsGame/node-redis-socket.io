$(document).ready(function () {
  var intervalID;
  var reconnectCount = 0;
  var ask = $('#ask');
  var askA = $('#ask a');
  var askInput = $('#ask input');
  var channel = $('#channel');
  var channelForm = $('#channel form');
  var container = $('div#msgs');
  var user = $('#user').text();
  var host = window.location.host//.split(':')[0];
  var socket = io.connect('http://' + host, {reconnect: false, 'try multiple transports': false});

  socket.on('connect', function () {
    console.log('connected');
  });
  socket.on('connecting', function () {
    console.log('connecting');
  });
  socket.on('disconnect', function () {
    console.log('disconnect');
  });
  socket.on('connect_failed', function () {
    console.log('connect_failed');
  });
  socket.on('error', function (err) {
    console.log('error: ' + err);
  });
  socket.on('reconnect_failed', function () {
    console.log('reconnect_failed');
  });
  socket.on('reconnect', function () {
    console.log('reconnected ');
  });
  socket.on('reconnecting', function () {
    console.log('reconnecting');
  });

  if (user === '') {
    ask.show();
    askInput.focus();
  } else {
    join(user);
  }

  askInput.keydown(function (event) {
    if (event.keyCode == 13) {
      askA.click();
    }
  });

  askA.click(function () {
    join(askInput.val());
    location.href = 'http://192.168.1.114:3000/';
  });

  function join(name) {
    ask.hide();
    channel.show();
    $('input#message').focus();

    $.post('/user', {"user": name})
      .success(function () {
        socket.emit('join', JSON.stringify({}));
      }).error(function () {
        console.log("error");
      });

    socket.on('chat', function (msg) {
      var message = JSON.parse(msg);

      var action = message.action;
      var struct = container.find('li.' + action + ':first');

      if (struct.length < 1) {
        console.log("Could not handle: " + message);
        return;
      }

      var messageView = struct.clone();

      messageView.find('.time').text((new Date()).toString("HH:mm:ss"));

      switch (action) {
        case 'message':
          var matches;
          if (matches = message.msg.match(/^\s*[\/\\]me\s(.*)/)) {
            messageView.find('.user').text(message.user + ' ' + matches[1]);
            messageView.find('.user').css('font-weight', 'bold');
          } else {
            messageView.find('.user').text(message.user);
            messageView.find('.message').text(': ' + message.msg);
          }
          break;
        case 'control':
          messageView.find('.user').text(message.user);
          messageView.find('.message').text(message.msg);
          messageView.addClass('control');
          break;
      }

      if (message.user == name) messageView.find('.user').addClass('self');

      container.find('ul').append(messageView.show());
      container.scrollTop(container.find('ul').innerHeight());
    });

    channelForm.submit(function (event) {
      event.preventDefault();
      var input = $(this).find(':input');
      var msg = input.val();
      socket.emit('chat', JSON.stringify({action: 'message', msg: msg}));
      input.val('');
    });
  }
});