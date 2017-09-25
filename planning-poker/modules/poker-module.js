var Client = require('node-rest-client').Client;
var httpClient = new Client({user:"lab16",password:"asdf123"});

var userArray =
{
		"김상현" : "lab1",
    "김보경" : "lab2",
    "서형태" : "lab3",
    "김지환" : "lab4",
    "정창일" : "lab5",
    "윤현상" : "lab6",
    "서정현" : "lab7",
    "신미란" : "lab8",
    "원용석" : "lab9",
    "정은영" : "lab10",
    "김지훈" : "lab11",
    "박정균" : "lab12",
    "이승엽" : "lab13",
    "박은규" : "lab14",
    "이경환" : "lab15",
    "한경만" : "lab16",
		"김준모" : "lab17",
    "박경수" : "kspark",
    "임성현" : "shlim",
    "김선숙" : "kimss"
};

module.exports =
{
	getRandom: function (range)
	{
	    return Math.floor(Math.random() * range);
	},

	/**
	 * Jira에서 issue를 가져온다.
	 */
	searchIssue: function(socket, issueId)
	{
	    var url = "http://211.63.24.57:8080/rest/api/2/issue/" + issueId;
	    var args = {
	        headers: {
	            "Content-Type": "application/json"
	        }
	    };
	    httpClient.get(url, args, function(data, response) {
	        socket.emit('search-issue', data);
	    });
	},

	getUserAvata: function(socket, user)
	{
	    if (true) return;
	    var userId = userArray[user.username];
	    if (userId == undefined)
	    {
	        socket.emit('get-user-avata', user);
	        return;
	    }
	    var url = "http://211.63.24.57:8080/rest/api/latest/user?username=" + userId;
	    var args = {
	        headers: {
	            "Content-Type": "application/json"
	        }
	    };
	    httpClient.get(url, args, function(data, response) {

	        data.uid = socketId;

	        //console.error("::::::::::" + pokerUsers[socketId].username + " : " + data.avatarUrls["48x48"]);

	        pokerUsers[socketId].avataUrl = data.avatarUrls["48x48"];

					var room = data.room;
	        io.sockets.in(room).emit('get-user-avata', data);

	        //console.error('avatar : ' + JSON.stringify(data))

	        //console.error(user.username + ' : ' + data.avatarUrls["24x24"]);
	    });
	},

	updateStory: function (socket, data)
	{
	    var url = "http://211.63.24.57:8080/rest/api/2/issue/" + data.issueId;

	    var param = {};
	    /*param.fields = {};
	    param.fields.customfield_10002 = parseInt(data.storyPoint);
	    param.fields.customfield_10504 = {};
	    param.fields.customfield_10504.value = parseInt(data.taskStep);*/
	    param = {
	        fields : {
	            customfield_10002 : parseInt(data.storyPoint)
	            //"customfield_10504" : {value : data.taskStep}
	        }
	    }


	    var args = {
	        headers: {
	            "Content-Type": "application/json"
	        },
	        data: param
	    };

	    httpClient.put(url, args, function(data, response) {
	        console.log('--------------------------');
	        socket.emit('update-story');
	            //console.log(response);
	    });
	}
}
