// menu items

// generic functions
function write_alert (message) {
	$('#conversation').append('<font class="message message-alert">' + message + '</font><br />');
	$("#conversation").scrollTop($('#conversation')[0].scrollHeight);
}

function write_message (me, message) {
	var who = ["c_remote", "Partner"];
	if(me) who = ["c_self", "You"];
	$('#conversation').append('<font class="message"><font class="' + who[0] + '">' + who[1] + ':</font> ' + message + '</font><br />');
	$("#conversation").scrollTop($('#conversation')[0].scrollHeight);
}

function write_question (title, data) {
	$('#question-box').find("h1").html(title);
	$('#question-box').find("p").html(data);
}

function present (data) {
	var pass = "fail";
	switch(data["status"]) {
		case -1:
			return '<div class="error">' + data["error"] + '</div>'
		case 2:
			return '<div class="info">Running...</div>'
		case 1:
			pass = "pass";
	}
	var minCount = data["info"][1];
	var passCount = data["info"][0];
	var resString = '<font class="score"><font class="' + pass + '">PASSED: ' + passCount + '</font> / ' + minCount + "</font><br />"
	for (var i = 0; i < data["data"].length; i++) {
		var item = data["data"][i];
		var input = item["input"];
		var error = undefined;
		var output = undefined;
		pass = "pass";
		
		if('output' in item) {
			output = item["output"];
		} else if('error' in item) {
			output = item["error"];
		}

		if('error' in item) {
			pass = "fail";
		}

		var tempStr = '<div class="case ' + pass + '">Case ' + (i + 1).toString() + ':</div><div class="content">';
		if(error !== undefined)
			tempStr += '<div class="error">' + error + '</div>';
		tempStr += '<div class="input"><b>Input:</b><br />' + input + '</div>';
		if(output !== undefined)
			tempStr += '<div class="output"><b>Output:</b><br />' + output + '</div>';
		tempStr += "</div>"
		resString = resString + tempStr;
	};
	return resString.replace(/\r\n|\n|\r/g, '<br />');
}

function scroll_down(who) {
	$("#" + who + "-result-toggle").removeClass("fa-sort-down").addClass("fa-sort-up");
	var allowedHt = $("#" + who + "-result-wrapper").parent().height();
	var ht = Math.round( Math.max( 0.05 * allowedHt , Math.min($("#" + who + "-result-wrapper").find(".run-result")[0].scrollHeight, allowedHt * 0.5) ) * 100.0 / allowedHt );
	$("#" + who + "-result-wrapper").animate({
		height: ht.toString() + "%"
	}, 400);
	$("#" + who + "-code-wrapper").animate({
		height: (100 - ht).toString() + "%"
	}, 400);
}

function scroll_up (who) {
	$("#" + who + "-result-toggle").removeClass("fa-sort-up").addClass("fa-sort-down");
	$("#" + who + "-result-wrapper").animate({
		height:"5%"
	}, 400);
	$("#" + who + "-code-wrapper").animate({
		height:"95%"
	}, 400);
}

function show_result (who, div, result) {
	$(div).html(present(JSON.parse(result)));
	scroll_down(who);
}
