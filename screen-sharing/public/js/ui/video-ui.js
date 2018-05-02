var _getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia || navigator.mozGetUserMedia;

function initialize()
{
  // 초대버튼 클릭시
  var btnInviteEl = new ZeroClipboard(document.getElementById("btnInvite"));
  var linkCopyTimer;
  btnInviteEl.on( "ready", function( readyEvent ) {

  $('#btnInvite').attr('data-clipboard-text', location.href);

  clearTimeout(linkCopyTimer);

  btnInviteEl.on("aftercopy", function(event) {
    $('#btnInvite').find('.button-label').text('복사되었습니다');
    $.notify({
        message: '클립보드에 복사하였습니다. Ctrl + V로 붙여넣으세요.'
    }, {
        type: 'danger'
    });

    linkCopyTimer  = setTimeout(function() {
      $('#btnInvite').find('.button-label').text('초대');
    }, 3000);

  } );

  $(window).on('resize', onResizeWindow);
  });

  $('#btnCloseScreenShare').on('click', function() {
    if (webrtc.getLocalScreen()) {
        webrtc.stopScreenShare();
    }
  });

  // mute / unmute audio
  $('#toggleAudio').on('click', function() {
    if ($(this).hasClass('mute'))
    {
      webrtc.unmute();
      $(this).removeClass('mute');
      $(this).find('img').attr('src', '/images/mic.png');
    }
    else
    {
      webrtc.mute();
      $(this).addClass('mute');
      $(this).find('img').attr('src', '/images/mic_off.png');
    }
  });

  $('#toggleVideo').on('click', function() {
    if ($(this).hasClass('blind'))
    {
      webrtc.resumeVideo();
      $(this).removeClass('blind');
      $(this).find('img').attr('src', '/images/video.png');
    }
    else
    {
      webrtc.pauseVideo();
      $(this).addClass('blind');
      $(this).find('img').attr('src', '/images/video_off.png');
    }
  });

  $('#btnScreenShare').on('click', function () {
      if (webrtc.getLocalScreen()) {
          webrtc.stopScreenShare();
      } else {
          webrtc.shareScreen(function (err) {
              if (err) {
              } else {
              }
          });

      }
  });
}

function initXirsys()
{
  // $.ajax({
  //     url: "https://service.xirsys.com/ice",
  //     data: {
  //         ident: "rudaks",
  //         secret: "3bff0ec0-ff6e-11e5-bd77-af395686a329",
  //         domain: "node.spectra.co.kr",
  //         application: "default",
  //         room: 'node',
  //         secure: 1
  //     },
  //     success: function (data, status) {
  //         log('ajax result : '+JSON.stringify(data));
  //         peerConnectionConfig = data.d;
  //
  //         initWebRTC(peerConnectionConfig);
  //     }
  // });
  $.ajax ({
       url: "https://global.xirsys.net/_turn/SpectraMobileApp/",
       type: "PUT",
       async: false,
       headers: {
         "Authorization": "Basic " + btoa("rudaks:c7377258-4de0-11e8-b725-ca606d5afd5c")
       },
       success: function (res){
         console.log("ICE List: "+res.v.iceServers);

         peerConnectionConfig = res.v.iceServers;

         initWebRTC(peerConnectionConfig);
       }
   });
}

function initWebRTC(peerConnectionConfig)
{
  webrtc = new SimpleWebRTC({
      localVideoEl: 'localVideo',
      remoteVideosEl: 'remoteVideo',
      autoRequestMedia: true,
      debug: false,
      detectSpeakingEvents: true,
      autoAdjustMic: false,
      peerConnectionConfig: peerConnectionConfig
  });

  /*
  if (!webrtc.capabilities.screenSharing) {
    console.error('screenSharing :'+ webrtc.capabilities.screenSharing);
      $('#btnScreenShare').prop('disabled', true);
  }
  */

  // when it's ready, join if we got a room from the URL
  webrtc.on('readyToCall', function () {
      // you can name it anything
      if (room) webrtc.joinRoom(room);
  });

  webrtc.on('channelMessage', function (peer, label, data) {
      log('channelMessage');
      if (data.type == 'volume') {
          showVolume(document.getElementById('volume_' + peer.id), data.volume);
      }
  });
  webrtc.on('videoAdded', function (video, peer) {
      console.log('video added', peer);

      setRemoteBackground(true); // 배경색 변경

      var id = 'container_' + webrtc.getDomId(peer);

      var videoLayer = $('<div />')
        .attr('class', 'video-stream')
        .attr('id', id)
        .append(video);

      $('#remotesPanel').append(videoLayer);

      var $video = videoLayer.find('video');
      $video.addClass('screenshare');
      $video.addClass('fit-width');
      $video.on('dblclick', resizeToFullScreen);
      resizeRemoteVideoScreen();


      //var ss = webrtc.handlePeerStreamAdded(peer);
      //console.error('ss : ' + ss);
      //console.error($('#remotesPanel').find('#' + id).find('video').attr('src'));
      /*
      var videoObject = $('#remotesPanel').find('#' + id).find('video');
      setTimeout(function() {
          var videoObject = $('#remotesPanel').find('#' + id).find('video');
          console.error('>>>> video.src  : ' + video.src);
          console.error('>>>> 1video  : ' + video);
          console.error('>>>> video  : ' + videoObject);
          console.error('>>>> video src : ' + $video.attr('src'));
          console.error('>>>> video src : ' + $video.prop('src'));

          var videoClone = $(video).clone();
          console.error('videoClone : ' + videoClone)
          console.error('videoClone src: ' + videoClone.attr('src'))
          console.error('videoClone src: ' + $(video).attr('src'))

          //var ss = webrtc.getRemoteVideoContainer();
          //console.error('ss : ' + ss);
      }, 3000);
      console.error('video src : ' + videoObject.attr('src'));
      console.error('video id : ' + id);
      */
      //videoObject.attr('src', videoObject.attr('src') + '?main');
    //  alert($('#' + id).attr('src'))





      var participantsVideo = $('<video class="video-paticipants"></video>');
      //var participantsVideo = $(video);
      //participantsVideo.attr('src', videoObject.attr('src'));


      var remotePaticipantsHtml = $('<div />')
        .attr('class', 'remote-paticipants')
        .attr('id', id + '_paticipants')
        .append(participantsVideo);

        //.append(videoClone);

        /*
        var remotePaticipantsHtml = $('<div />')
        .attr('class', 'remote-paticipants')
        .attr('id',  + '_paticipants')
        .append(video);
        */


          //window.URL.createObjectURL(video)
      $('#remotePaticipantsLayer').append(remotePaticipantsHtml);

      //console.error('>>> ' + $('#' + id + '_paticipants').find('video').length)
      //console.error('>>> ' + $(video).src)

      $('#' + id + '_paticipants').find('video').attr('src', URL.createObjectURL(peer.stream));

      //$('#' + id + '_paticipants').find('video').src = $(video).src;

      var ckHtml = '<div class="ck-layer">';
      ckHtml += '<input type="checkbox" id="' + id + '_ck" video-source="' + id + '" checked />';
      ckHtml += '</div>';
      $(ckHtml).appendTo('#' + id + '_paticipants');
      $('#' + id + '_ck').on('click', function() {
        var videoSource = $(this).attr('video-source');

        if ($(this).prop('checked'))
        {
          $('#' + videoSource).show();
        }
        else
        {
          $('#' + videoSource).hide();
        }

        resizeRemoteVideoScreen();
      });
      //$('#' + id + '_paticipants').append(ckHtml);

      //$('#' + id + '_paticipants').find('video').css({'width':'80px'});


  });
  webrtc.on('videoRemoved', function (video, peer) {
      log('videoRemoved');
      //console.log('video removed ', peer);

      if (peer)
      {
        var id = 'container_' + webrtc.getDomId(peer);
        $('#remotesPanel').find('#' + id).remove();

        $('#remotePaticipantsLayer').find('#' + id + '_paticipants').remove();
      }

      if ($('#remotesPanel').find('.video-stream').length == 0)
      {
        setRemoteBackground(false);
      }

      resizeRemoteVideoScreen();

      /*
      var remotes = document.getElementById('remotesPanel');
      var el = document.getElementById('container_' + webrtc.getDomId(peer));
      if (remotes && el) {
          remotes.removeChild(el);
      }
      */
  });
  webrtc.on('volumeChange', function (volume, treshold) {
      //console.log('own volume', volume);
      showVolume(document.getElementById('localVolume'), volume);
  });

  // 화면공유
  webrtc.on('localScreenAdded', function (video) {
      log('localScreenAdded');
      /*
      video.onclick = function () {
          video.style.width = video.videoWidth + 'px';
          video.style.height = video.videoHeight + 'px';
      };
      */
      document.getElementById('localScreenContainer').appendChild(video);

      $('#localScreenContainer').find('video').css({'width':'200px'});
      $('#localScreenLayer').show();
  });
  // local screen removed
  webrtc.on('localScreenRemoved', function (video) {
      log('localScreenRemoved');
      document.getElementById('localScreenContainer').removeChild(video);
      $('#localScreenLayer').hide();
  });

  webrtc.on('mute', function (data) { // show muted symbol
    log('mute');
    webrtc.getPeers(data.id).forEach(function (peer) {
        if (data.name == 'audio') {
            $('#videocontainer_' + webrtc.getDomId(peer) + ' .muted').show();
        } else if (data.name == 'video') {
            $('#videocontainer_' + webrtc.getDomId(peer) + ' .paused').show();
            $('#videocontainer_' + webrtc.getDomId(peer) + ' video').hide();
        }
    });
  });
  webrtc.on('unmute', function (data) { // hide muted symbol
    log('unmute');
      webrtc.getPeers(data.id).forEach(function (peer) {
          if (data.name == 'audio') {
              $('#videocontainer_' + webrtc.getDomId(peer) + ' .muted').hide();
          } else if (data.name == 'video') {
              $('#videocontainer_' + webrtc.getDomId(peer) + ' video').show();
              $('#videocontainer_' + webrtc.getDomId(peer) + ' .paused').hide();
          }
      });
  });

  //local mute/unmute events
  webrtc.on('audioOn', function () {
      // your local audio just turned on
        log('audioOn');
  });
  webrtc.on('audioOff', function () {
      // your local audio just turned off
      log('audioOff');
  });
  webrtc.on('videoOn', function () {
      // local video just turned on
      log('videoOn');
  });
  webrtc.on('videoOff', function () {
      // local video just turned off
      log('videoOff');
  });

  webrtc.on('localScreenStopped', function () {
      log('localScreenStopped');
      $('#localScreenLayer').find('video').remove();
      $('#localScreenLayer').hide();
  });
}



function resizeRemoteVideoScreen()
{
  setTimeout(function() {
    var width = $(document).width();
    var el = $('#remotesPanel').find('.video-stream:visible');
    var size = el.length;
    //console.error('size : ' + size);


    el.css({'position':'absolute', 'left':'0', 'top':'0', 'width':'100%', 'height':'100%'});
    switch (size)
    {
      //case 1:
        //el.css({'position':'absolute', 'left':'0', 'top':'0', 'width':'50%', 'height':'100%'});
        //break;
      case 2:
        if (width <= 492)
        {
          el.eq(0).css({'width':'100%', 'height':'50%', 'left':'0', 'top':'0'});
          el.eq(1).css({'width':'100%', 'height':'50%', 'left':'0', 'top':'50%'});
          el.find('video').removeClass('fit-height').addClass('fit-width');
        }
        else
        {
          el.eq(0).css({'left':'0', 'top':'0%', 'width':'50%', 'height':'100%'});
          el.eq(1).css({'left':'50%', 'top':'0%', 'width':'50%', 'height':'100%'});
          el.find('video').removeClass('fit-width').addClass('fit-height');
        }
        break;
      case 3:
      case 4:
        el.find('video').removeClass('fit-width').addClass('fit-height');
        el.eq(0).css({'width':'50%', 'height':'50%', 'left':'0', 'top':'0'});
        el.eq(1).css({'width':'50%', 'height':'50%', 'left':'50%', 'top':'0'});
        el.eq(2).css({'width':'50%', 'height':'50%', 'left':'0', 'top':'50%'});
        el.eq(3).css({'width':'50%', 'height':'50%', 'left':'50%', 'top':'50%'});
        break;
      case 5:
      case 6:
        el.find('video').removeClass('fit-width').addClass('fit-height');
        el.eq(0).css({'width':'33.3333%', 'height':'50%', 'left':'0', 'top':'0'});
        el.eq(1).css({'width':'33.3333%', 'height':'50%', 'left':'33.3333%', 'top':'0'});
        el.eq(2).css({'width':'33.3333%', 'height':'50%', 'left':'66.6667%', 'top':'0'});
        el.eq(3).css({'width':'33.3333%', 'height':'50%', 'left':'0', 'top':'50%'});
        el.eq(4).css({'width':'33.3333%', 'height':'50%', 'left':'33.3333%', 'top':'50%'});
        el.eq(5).css({'width':'33.3333%', 'height':'50%', 'left':'66.6667%', 'top':'50%'});
        break;
      /*
        case 1:
          el.find('video').css({'width' : '100%'});
          break;
        case 2:
          el.find('video').css({'width' : '100%', 'height': '100%'});
          el.eq(0).css({'position': 'absolute', 'width': '48%', 'left' : 0, 'top':0});
          el.eq(1).css({'position': 'absolute','width': '48%', 'left' : '48%', 'top':0});
          break;
        case 3:
          el.find('video').css({'width' : '100%', 'height': '100%'});
          el.eq(0).css({'position': 'absolute','width': '50%', 'left' : 0, 'top':0});
          el.eq(1).css({'position': 'absolute','width': '50%', 'left' : '50%', 'top':0});
          el.eq(2).css({'position': 'absolute','width': '50%', 'left' : '0', 'top':'50%'});
          break;
        case 4:
          el.find('video').css({'width' : '100%', 'height': '100%'});
          el.eq(0).css({'position': 'absolute','width': '50%', 'left' : 0, 'top':0});
          el.eq(1).css({'position': 'absolute','width': '50%', 'left' : '50%', 'top':0});
          el.eq(2).css({'position': 'absolute','width': '50%', 'left' : '0', 'top':'50%'});
          el.eq(3).css({'position': 'absolute','width': '50%', 'left' : '50%', 'top':'50%'});
          break;
          */
    }
  }, 500);

}

// Since we use this twice we put it here
function setRoom(name) {
    $('form').remove();
    $('h1').text(name);
    $('#join-url-link').text(location.href);
    $('body').addClass('active');
}

function showVolume(el, volume) {
    if (!el) return;
    if (volume < -45) { // vary between -45 and -20
        el.style.height = '0px';
    } else if (volume > -20) {
        el.style.height = '100%';
    } else {
        el.style.height = '' + Math.floor((volume + 100) * 100 / 25 - 220) + '%';
    }
}

/**
 * 배경색 변경 (remote)
 */
function setRemoteBackground(flag)
{
  if (flag)
  {
    $('.stream-podium').css({'background':'#4d5659'}); // 배경색 변경
    $('.join-text-layer').hide();
  }
  else
  {
    $('.stream-podium').css({'background':'#fff'}); // 배경색 변경
    $('.join-text-layer').show();
  }
}

function onResizeWindow()
{
  resizeRemoteVideoScreen();
}

function checkSupportBrowser()
{
  if (!_getUserMedia)
  {
    $('#support-browser-notify').text('지원하지 않는 브라우저 입니다. Chrome을 사용하시기 바랍니다.');;
    $('#support-browser-notify').show();
  }
  else
  {
    if (/KAKAOTALK/i.test(navigator.userAgent) )
    {
      $('#support-browser-notify').text('카카오톡에서는 지원하지 않습니다. Chrome을 사용하시기 바랍니다.');;
      $('#support-browser-notify').show();
    }
  }
}

function resizeToFullScreen(e)
{
  //log('dobule click')
  var elem = e.target

  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) {
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  }
}

var FIREBASE_AUTH = 'R13DqMrp6nU8E99jlwDdQzlDGlK3rDXmJCMkqncO';
function updateToFirebase(room)
{
  //log('updateToFirebase room : ' + room)
  var random = Math.floor(Math.random() * 100000000);
  var ref = new Firebase('https://screen-share-fe249.firebaseio.com/screenshare/room-' + room);
  var user = 'user-' + random;

  ref.authWithCustomToken(FIREBASE_AUTH, function(error, authData) {
      if (error)
      {
          console.log("Authentication Failed!", error);
      }
      else
      {
          if (atob)
          {
              var currentUserKey = user;
              var currentUserRef = ref.parent().parent().child('/video/room-' + room + '/' + currentUserKey);
              var value = {
                  user : user,
                  ip : ipAddress,
                  username : username,
                  created : getCurrDate()
              };

              currentUserRef.update(value);
              currentUserRef.onDisconnect().remove(); // 연결이 끊어질때 지우기

              //var key = currTime + "_" + loginInfoJson.userName + '_' + pathname;/
              var key = user;
              var url = decodeURIComponent(location.href);

              var data = {};

              value['url'] = url;
              data[key] = value;

              ref.update(data);

              // access 로그
              var currentUserKey = user;
              var date = getCurrDate('date');
              var currentUserRef = ref.parent().parent().child('/video-access-log/' + date + '/' + 'room-' + room + '/' + currentUserKey);
              var value = {
                  user : user,
                  ip : ipAddress,
                  username : username,
                  created : getCurrDate()
              };

              if (ipAddress == '211.63.24.124')
              {
                return;
              }
              currentUserRef.update(value);

          }

          ref.on("value", onValueFirebase, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
          });
      }
  });
};

function onValueFirebase(snapshot)
{
    var count = 0;
    snapshot.forEach(function(childSnapshot) {
      var key = childSnapshot.key();
      var childData = childSnapshot.val();

      count++;
    });

    //log('count : ' + count)
    var displayCount = 0;
    displayCount = count - 1;

    var badge = $('#paticipantsLayer').find('.badge');
    //badge.attr('title', displayCount + '명의 사용자가 보고 있습니다.');
    if (displayCount >= 1)
    {
      badge.text(displayCount);
      $('#paticipantsLayer').show();
    }
    else
    {
      $('#paticipantsLayer').hide();
    }

}

function getCurrDate(type)
{
    var now     = new Date();
    var year    = now.getFullYear();
    var month   = now.getMonth()+1;
    var day     = now.getDate();
    var hour    = now.getHours();
    var minute  = now.getMinutes();
    var second  = now.getSeconds();
    if(month.toString().length == 1) {
        var month = '0'+month;
    }
    if(day.toString().length == 1) {
        var day = '0'+day;
    }
    if(hour.toString().length == 1) {
        var hour = '0'+hour;
    }
    if(minute.toString().length == 1) {
        var minute = '0'+minute;
    }
    if(second.toString().length == 1) {
        var second = '0'+second;
    }

    if (type == 'date')
    {
        return year+'-'+month+'-' + day;
    }
    else if (type == 'time')
    {
        return hour+':'+minute+':'+second;
    }
    else
    {
        return year+'-'+month+'-'+day+'@'+hour+':'+minute+':'+second;
    }
}

// 쿠키 가져오기
function getCookie(cName) {
    cName = cName + '=';
    var cookieData = document.cookie;
    var start = cookieData.indexOf(cName);
    var cValue = '';
    if(start != -1){
        start += cName.length;
        var end = cookieData.indexOf(';', start);
        if(end == -1)end = cookieData.length;
        cValue = cookieData.substring(start, end);
    }
    return cValue;
}

function detectmob() {
  if( navigator.userAgent.match(/Android/i)
    || navigator.userAgent.match(/webOS/i)
    || navigator.userAgent.match(/iPhone/i)
    || navigator.userAgent.match(/iPad/i)
    || navigator.userAgent.match(/iPod/i)
    || navigator.userAgent.match(/BlackBerry/i)
    || navigator.userAgent.match(/Windows Phone/i)
  ){
    return true;
  }
  else {
    return false;
  }
}

var _debug = false;
function log(str)
{
  if (_debug)
    console.error(str);
}
