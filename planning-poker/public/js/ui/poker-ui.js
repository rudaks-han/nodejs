/**
 * 로그인 버튼 클릭시
 */
function onLoginClick(e)
{
    var username = $.trim($('#username').val());
    var role = $('#role').val();
    var room = $.trim($('#room').val());
    if (username == '')
    {
        alert('이름을 입력하세욧!');
        $('#username').focus();
        return;
    }

    if (room == '')
    {
        alert('방이름을 입력하세욧!');
        $('#room').focus();
        return;
    }

    if (room == '__login__')
    {
        alert('사용할 수 없는 방입니다.');
        $('#room').select();
        return;
    }

    socket.emit('login', {
        username: username,
        role: role,
        room : room
    });
}

/**
 * 로그아웃 버튼 클릭시
 */
function onLogoutClick(e)
{
    if (e) e.preventDefault();

    var uid = localStorage.getItem('uid');
    var username = localStorage.getItem('username');
    socket.emit('logout', {
        uid : uid,
        username: username,
        room : room
    });
}

function onIssueIdKeydown(e)
{
  if (e.keyCode == 13)
  {
    onSearchIssueClick(e);
  }
}

function onJoinRoom(room)
{
  $('#room').val(room);
  onLoginClick();
}

function onSearchIssueClick(e)
{
    e.preventDefault();

    var issueId = $('#issue-id').val();
    if (issueId == '')
    {
        alert('Issue Id를 입력해주세요');
        return;
    }

    var data = {
        issueId : issueId,
        room : room
    };
    socket.emit('search-issue', data);
}

function onUpdateStoryClick(e)
{
    e.preventDefault();

    var issueId = $('#issue-id').val();
    if (issueId == '')
    {
        alert('Issue Id를 입력해주세요');
        return;
    }

    var storyPoint = $('#story-point').val();
    if (storyPoint == '')
    {
        alert('Story Point를 입력해주세요');
        return;
    }

    /*
    var taskStep = $('#task-step').val();
    if (taskStep == '')
    {
        alert('작업단계를 입력해주세요');
        return;
    }
    */

    var data = {
        issueId : issueId,
        storyPoint : storyPoint,
        //taskStep : taskStep,
        room : room
    };
    socket.emit('update-story', data);
}

/**
 * 카드 선택시 이벤트
 */
function onSelectCardClick(e)
{
    e.preventDefault();

    $('#card-selection > a').removeClass('card-choice-selected');
    $(this).addClass('card-choice-selected');

    var value = $(this).text();
    var username = localStorage.getItem('username');
    var uid = localStorage.getItem('uid');

    var data = {
        uid : uid,
        username: username,
        value: value,
        room : room
    };

    socket.emit('select-card', data);
}

/**
 * 이름표시 클릭시
 */
function onShowUsernameClick(e)
{

    var value = $('#show-username').prop('checked') ? 'Y' : 'N';

    var data = {
        value: value,
        room : room
    };

    socket.emit('show-username', data);
}

/**
 * 카드 취소 클릭시
 */
function onCancelCardClick(e)
{
    e.preventDefault();

    var value = $(this).text();
    var username = localStorage.getItem('username');
    var uid = localStorage.getItem('uid');

    var data = {
        uid : uid,
        username: username,
        value: value,
        room : room
    };

    socket.emit('cancel-card', data);
}

/**
 * 카드 열기 클릭시
 */
function onOpenCardClick(e)
{
    e.preventDefault();
    var data = {
        room : room
    };
    socket.emit('open-card', room);
}

/**
 * 카드 열기 클릭시
 */
function onCloseCardClick(e)
{
    e.preventDefault();
    var data = {
        room : room
    };
    socket.emit('close-card', room);
}


/**
 * 초기화 클릭시
 */
function onResetCardClick(e)
{
    e.preventDefault();
    var data = {
        room : room
    };
    socket.emit('reset-card', data);
}

/**
 * 사용자 권한별로 이미지 표시
 */
function getUserImageByRole(role)
{
    var result = '';
    switch (role)
    {
        case 'developer':
            result = '/images/person/developer.png';
            break;
        case 'scrummaster':
            result = '/images/person/scrummaster.png';
            break;
        default:
            result = '/images/person/viewer.png';
            break;
    }

    return result;
}

function getRoleName(role)
{
    var result = '';
    switch (role)
    {
        case 'developer':
            result = '개발자';
            break;
        case 'scrummaster':
            result = '마스터';
            break;
        default:
            result = '참관자';
            break;
    }

    return result;
}

function onGamePlanningPokerClick(e)
{
    e.preventDefault();
    var data = {
        game : 'planning-poker',
        room : room
    };
    socket.emit('game.start', data);
}

function onGameMixItUpClick(e)
{
    e.preventDefault();
    var data = {
        game : 'mix-it-up',
        room : room
    };
    socket.emit('game.start', data);
}

function onCheckMixItUpClick(e)
{
    var listGroupItem = $(this).parent('.list-group-item');
    var uid = listGroupItem.attr('uid');
    var username = listGroupItem.find('.text-value').text();
    var avatar = listGroupItem.find('.avatar').attr('src');

    if ($(this).is(':checked'))
    {
        var html = '';
        html += '<div class="poker-card-display" uid="' + uid + '">';
        html += '<a class="poker-card poker-card-value"><img src="' + avatar + '" style="width:60px"/></a>';
        html += '<a class="poker-card poker-card-cover" style="display:none"></a>';
        html += '<span class="poker-card-player" title="' + username + '">' + username + '</span>';
        html += '</div>';

        $('<div id="tmpcard_' + uid + '" class="poker-card-display" style="border:1px dotted gray; width:70px; height:120px;"></div>').appendTo('#card-selected-list');

        var to = $('#card-selected-list').find('#tmpcard_' + uid);

        var from = $('#participants').find('li[uid="' + uid + '"]');
        var options = {to: to, className: 'ui-effects-transfer'};
        from.effect('transfer', options, 500, function() {
           to.replaceWith(html);

            $('#card-selected-list').find('div[uid="' + uid + '"]').on('click', function() {
                //$(this).find('.poker-card-cover').hide();
                var options = {};
                $(this).find('.poker-card-cover').hide('shake', options, 1000, function() {} );
                $(this).find('.poker-card-player').show();
            });
        });
    }
    else
    {
        var from = $('#card-selected-list').find('div[uid="' + uid + '"]');

        var to = $('#participants').find('li[uid="' + uid + '"]');
        var options = {to: to, className: 'ui-effects-transfer'};

        setTimeout(function() {
            from.hide();
        }, 100);
        from.effect('transfer', options, 500, function() {
           //to.replaceWith(html);
            from.remove();

        });
    }

}

function onStartMixItUpClick(e)
{
    e.preventDefault();

    $('#card-selected-list').mixItUp({
        selectors: {
            target: '.poker-card-display'
        },
        load: {
            sort: 'random'
        },
        callbacks: {
            onMixLoad: function() {
                console.error('MixItUp ready!');
            },
            onMixStart: function() {
                console.error('Animation starting!');
            },
            onMixEnd: function(state){
                console.error('Operation ended : ' + state.totalShow);
            },
            onMixFail: function(state){
                console.error('No elements found matching '+state.activeFilter);
            },
            onMixBusy: function(state){
                console.error('MixItUp busy');
            }
        }
    });

    $('#mix-it-up-layer').find('.sort').removeClass('disabled');

    $('#mix-it-up-layer').find('#open').removeClass('disabled');
    $('#mix-it-up-layer').find('#close').removeClass('disabled');
    $('#mix-it-up-layer').find('#add-layer').removeClass('disabled');
}

function onCheckAllMixItUpClick(e)
{
    $('#participants').find('li').each(function() {
        if ($(this).find('.chk').is(':checked'))
        {
            return true;
        }
        $(this).find('.chk').trigger('click');

    });
}

function onOpenMixItUpClick(e)
{
    e.preventDefault();

    $('#card-selected-list').find('.poker-card-cover').hide();
    $('#card-selected-list').find('.poker-card-player').show();

}

function onCloseMixItUpClick(e)
{
    e.preventDefault();
    $('#card-selected-list').find('.poker-card-cover').show();
    $('#card-selected-list').find('.poker-card-player').hide();
}

function onAddLayerMixItUpClick(e)
{
    e.preventDefault();
    var html = '<div style="display:inline-block; border-top:5px solid #d9534f; cursor:move;">';
    html += '<input type="text" class="form-control" style="width:65px; height:30px; border:1px solid #d9534f; font-size:12px;"/>';
    html += '</div>';

    $(html).appendTo('#card-selected-list').draggable();
}

function onGameMemoryClick(e)
{
    e.preventDefault();
    var data = {
        game : 'memory',
        room : room
    };
    socket.emit('game.start', data);

    /*$('#user-story-layer').hide();
    $('#card-selection').hide();
    $('#memory-layer').show();
    $('#card-action-button').hide();*/
}

function onStartMemoryClick(e)
{
    var row = parseInt($('#memory-layer').find('#row').val());
    var target = $('#memory-layer').find('#target').val();

    /*for (var i=0; i<row*row; i++)
    {
        var uid = guid();

        var html = '';
        html += '<div class="poker-card-display" uid="' + uid + '">';
        html += '<a class="poker-card poker-card-value"></a>';
        html += '<a class="poker-card poker-card-cover" style="display:none"></a>';
        html += '<span class="poker-card-player"> 11</span>';
        html += '</div>';

        $('<div id="tmpcard_' + uid + '" class="poker-card-display" style="border:1px dotted gray; width:70px; height:120px;"></div>').appendTo('#card-selected-list');

        var to = $('#card-selected-list').find('#tmpcard_' + uid);

        var from = $('#memory-layer').find('#row');
        var options = {to: to, className: 'ui-effects-transfer'};
        from.effect('transfer', options, 500, function() {
           to.replaceWith(html);

            $('#card-selected-list').find('div[uid="' + uid + '"]').on('click', function() {
                //$(this).find('.poker-card-cover').hide();
                var options = {};
                $(this).find('.poker-card-cover').hide('shake', options, 1000, function() {} );
                $(this).find('.poker-card-player').show();
            });
        });
    }*/

    var data = {
        row: row,
        target: target,
        room : room
    };
    socket.emit('memory.start', data);
}

function onOpenMemoryClick(e)
{
    e.preventDefault();


}

function onCloseMemoryClick(e)
{
    e.preventDefault();
}

function onRowMemoryChange(e)
{
    e.preventDefault();

    var data = {
        row: $('#memory-layer').find('#row').val(),
        room : room
    };

    socket.emit('memory.changeRow', data);
}

function onTargeteMemoryChange(e)
{
    e.preventDefault();

    var data = {
        target: $('#memory-layer').find('#target').val(),
        room : room
    };

    socket.emit('memory.changeTarget', data);
}

function changeGame(data)
{
    var username = localStorage.getItem('username');
    var role = localStorage.getItem('role');
    var uid = localStorage.getItem('uid');

    $('.planning-poker').hide();
    $('.mix-it-up').hide();
    $('.memory').hide();

    $('#card-selected-list').css('width', '100%');
    //$('#card-selected-list').html('');

    $('#participants').find('input[type=checkbox]').remove();

    switch (data.currentGame)
    {
        case 'planning-poker':
            $('.planning-poker').show();

            if (role == 'scrummaster')
            {
                $('#card-action-button').find('#user-story-layer').show();
                $('#card-action-button').find('#close-card').hide();
                $('#card-action-button').find('#show-username-layer').show();

                $('#card-action-button').find('#show-username-layer').show();
                if (data.showUsername == 'Y')
                {
                    $('#card-action-button').find('#show-username').prop('checked', true);
                }
                else
                {
                    $('#card-action-button').find('#show-username').prop('checked', false);
                }
            }
            else
            {
                $('#user-story-layer').hide();
                $('#card-action-button').find('#reset-card').hide();
                $('#card-action-button').find('#open-card').hide();
                $('#card-action-button').find('#close-card').hide();
                $('#card-action-button').find('#show-username-layer').hide();
            }

            break;
        case 'mix-it-up':
            $('.mix-it-up').show();

            if (role != 'scrummaster')
            {
                $('#mix-it-up-layer').hide();
            }

            $('#participants').find('li').each(function() {
                if ($(this).find('.chk').length > 0)
                {
                    $(this).find('.chk').attr('checked', false);
                    return true;
                }

                $('<input type="checkbox" class="chk" />').prependTo($(this)).on('click', onCheckMixItUpClick);
            });

            $('#card-action-button').find('#reset-card').trigger('click');
            break;
        case 'memory':

            $('.memory').show();
            if (role != 'scrummaster')
            {
                $('#memory-layer').find('#row').attr('disabled', 'disabled');
                $('#memory-layer').find('#target').attr('disabled', 'disabled');
            }
            break;

    }

}

/**
 * GUID 자동생성 함수
 */
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}
