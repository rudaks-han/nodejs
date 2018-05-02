var FIREBASE_AUTH = 'R13DqMrp6nU8E99jlwDdQzlDGlK3rDXmJCMkqncO';

var _getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia || navigator.mozGetUserMedia;

function log(str)
{
  console.error(str);
}

function checkSupportBrowser()
{
  if (!_getUserMedia)
  {
    log('unsupported browser');
    $('#support-browser-notify').show();
    $('#btnScreenShare').prop('disabled', true);
  }

  if (detectmob())
  {
    //$('#btnScreenShare').remove();
    var html = '<div class="waiting-spinner">';
    //html += '<div class="double-bounce1"></div>';
    //html += '<div class="double-bounce2"></div>';
    html += '<div class="cube1"></div>';
    html += '<div class="cube2"></div>';
    html += '</div>';
    html += '<div style="font-size:16px; font-weight:strong;">화면공유 대기중...</div>';

    $('#selectScreenLayer').html(html);
  }
}

function initXirsys()
{
  /*
  $.ajax({
      url: "https://service.xirsys.com/ice",
      data: {
          ident: "rudaks",
          //secret: "3bff0ec0-ff6e-11e5-bd77-af395686a329",
          secret: 'c7377258-4de0-11e8-b725-ca606d5afd5c',
          domain: "node.spectra.co.kr",
          application: "default",
          room: 'node',
          secure: 1
      },
      success: function (data, status) {
          //log('ajax result : '+JSON.stringify(data));
          peerConnectionConfig = data.d;

          initWebRTC(peerConnectionConfig);
      }
  });
  */
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

function initialize()
{
  //$('#btnFullScreen').on('click', resizeToFullScreen);;

  $('#btnCloseScreenShare').on('click', function() {
    if (webrtc.getLocalScreen()) {
        webrtc.stopScreenShare();
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

  var btnCopyUrlEl = new ZeroClipboard(document.getElementById("btnCopyUrl"));

  btnCopyUrlEl.on( "ready", function( readyEvent ) {
    $('#btnCopyUrl').attr('data-clipboard-text', location.href);
    btnCopyUrlEl.on("aftercopy", function(event) {
      $.notify({
          message: '클립보드에 복사하였습니다. Ctrl + V로 붙여넣으세요.'
      }, {
          type: 'danger'
      });
    });
  });
}

function initWebRTC(peerConnectionConfig)
{
  webrtc = new SimpleWebRTC({
      localVideoEl: 'localVideo',
      remoteVideosEl: 'removeVideo',
      autoRequestMedia: true,
      debug: false,
      detectSpeakingEvents: false,
      autoAdjustMic: false,
      media: {
          video: false,
          audio: false
      },
      peerConnectionConfig: peerConnectionConfig
  });

  webrtc.on('readyToCall', function () {
      console.log('readyToCall');
      // you can name it anything
      if (room)
      {
        console.log('room : ' + room);
        webrtc.joinRoom(room);

        //$('#selectScreenLayer').delay(2000).fadeIn();
      }
  });

  webrtc.on('videoAdded', function (video, peer) {
      //console.log('video added', video);
      console.log('_____video added peer : ', peer);
      $('#loadingTextLayer').show();

      startScreenSharing(video);

      $('#btnCloseScreenShare').hide();

      addParticipants(room);
  });

  webrtc.on('videoRemoved', function (video, peer) {
    console.log('video removed', peer);
    console.log('video added peer : ', peer);

    stopScreenSharing();
    addParticipants(room);

    if (peer) // 참석자에게 전송
    {
      $.notify("화면공유가 종료되었습니다.", {
      	animate: {
      		enter: 'animated rollIn',
      		exit: 'animated rollOut'
      	},
        type : 'danger'
      });
    }
  });

  // 화면공유
  webrtc.on('localScreenAdded', function (video) {
      log('localScreenAdded');

      startScreenSharing(video);

      $('#copyUrlSpan').show();
      $.notify({
          //'position' : 'absolute',
          message: 'URL을 공유할 사용자에게 전달하세요.'
      }, {
          type: 'warning',
          placement: {
        		from: "bottom",
        		align: "right"
        	}
      });
  });
  // local screen removed
  webrtc.on('localScreenRemoved', function (video) {
      log('localScreenRemoved');

      //stopScreenSharing(video);
      //$('#copyUrlSpan').hide();
  });

  webrtc.on('localScreenStopped', function () {
    log('localScreenStopped');
      //$('#localScreenLayer').find('video').remove();
      //$('#localScreenLayer').hide();

      stopScreenSharing();
      $('#copyUrlSpan').hide();
  });
}

function startScreenSharing(video)
{
  document.getElementById('localScreenContainer').appendChild(video);

  var videoEl = $('#localScreenContainer').find('video');

  videoEl.css({'width':'80%', 'border':'1px solid #333', 'transform':'rotate(360deg)'});
  videoEl.attr('autoplay', 'true');
  videoEl.attr('controls', 'true');
  videoEl.on('dblclick', resizeToFullScreen);

  $('#localScreenLayer').show();
  $('#loadingTextLayer').hide();

  $('#btnScreenShare').prop('disabled', true);
  $('#selectScreenLayer').css({'display':'none'});
  //$('#btnFullScreen').show();
}

function stopScreenSharing()
{
  $('#localScreenLayer').find('video').remove();
  //document.getElementById('localScreenContainer').removeChild(video);
  $('#localScreenLayer').hide();

  $('#btnScreenShare').prop('disabled', false);
  $('#selectScreenLayer').css({'display':'block'});
  //$('#btnFullScreen').hide();
}

function addParticipants(room)
{
  /*
    var count = $('#btnScreenShare').find('.badge').text();
    if (count == '')
      count = 0;
    else
      count = parseInt(count);

    var totalCount = count + num;
    if (totalCount <= 0)
      totalCount = '';
    log('totalCount : ' + totalCount)
    $('#btnScreenShare').find('.badge').text(totalCount);
    */

    //log('addParticipants room ' +room)
    var ref = new Firebase('https://screen-share-fe249.firebaseio.com/screenshare/room-' + room);
    ref.authWithCustomToken(FIREBASE_AUTH, function(error, authData) {
        if (error)
        {
            console.log("Authentication Failed!", error);
        }
        else
        {
            ref.on("value", onValueFirebase, function (errorObject) {
              console.log("The read failed: " + errorObject.code);
            });
        }
      });
}

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

    console.error('___________onValueFirebase')
    console.error('displayCount : ' + displayCount)
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

function onResizeWindow()
{
  resizeRemoteVideoScreen();
}

function resizeToFullScreen()
{
  //log('dobule click')

  var videoEl = $('#localScreenContainer').find('video');
  var elem = videoEl.get(0);

  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) {
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  }
}

function updateToFirebase(room)
{
//  log('updateToFirebase room : ' + room)
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
              var currentUserRef = ref.parent().parent().child('/screenshare/room-' + room + '/' + currentUserKey);
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
              var currentUserRef = ref.parent().parent().child('/screenshare-access-log/' + date + '/' + 'room-' + room + '/' + currentUserKey);
              var value = {
                  user : user,
                  ip : ipAddress,
                  username : username,
                  created : getCurrDate()
              };

              //if (ipAddress != '211.63.24.124')
              {
                currentUserRef.update(value);
              }
          }

          ref.on("value", onValueFirebase, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
          });
      }
  });
};

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
