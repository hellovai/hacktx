// Menu Functions
function createMenu() {
	var menu_items = [ {img:'github-alt', id:'login', color:'#f6a6a6', title:'Login'},
						{img:'question', id:'toggleQuestion', color:'green', title:'New Question!'},
						{img:'video-camera', id:'video', color:'purple', title:'Hide Video'},
						{img:'code', id:'userCode', color:'orange', title:'Hide Code'},
						{img:'user', id:'partnerCode', color:'gray', title:'Hide Partner\'s Code'},
						{img:'random', id:'toggleRoom', color:'red', title:'New Partner'},
					];
	var div = $("ul[class='menu']");
	for(i = 0; i < menu_items.length; i++) {
		var item = menu_items[i];
		div.append('<li class="pure-u-3-4"> \
					<button class="btn menu-item" style="background:' + item.color + '" id="' + item.id + '" data-toggle="tooltip" title="' + item.title + '" data-placement="right"> \
					<i class="fa fa-lg fa-' + item.img + '"></i>\
					</button></li>');
	}
}

function updateHeight()
{
    var div = $("li[id='menu-item']");
    var width = div.width();
    div.css('height', width);
	if(check_overflow('#question-box')) {
		$('#more').show();
	} else {
		$('#more').hide();
	}
}

function remove_scroll (div) {
	$(div).width($(div).width() + 15);
}

function check_overflow(div) {
    var _elm = $(div)[0];
    var _hasScrollBar = false; 
    if ((_elm.clientHeight < _elm.scrollHeight) || (_elm.clientWidth < _elm.scrollWidth)) {
        _hasScrollBar = true;
    }
    return _hasScrollBar;
}

function notify (index) {
	// play sound with index
}
