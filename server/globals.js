var queue = []
	, users = {}
	, session = {};

// generic functions
function isConnected(paired, pid) {
	var p = getPartner(paired, pid);
	if(typeof p == "undefined") return false;
	return true;
};

function getPartner(paired, pid) {
	if(!paired) return;
	return users[pid];
}

function removeQ(id) {
	if(typeof id != "string") 
		return users[queue.pop()];
	var i = queue.indexOf(id);
	if(i != -1) queue.splice(i, 1);
	return users[id];
}

function safeCallback(cb) {
    if (typeof cb === 'function') {
        return cb;
    } else {
        return function () {};
    }
}

module.exports.queue = queue;
module.exports.users = users;
module.exports.isConnected = isConnected;
module.exports.getPartner = getPartner;
module.exports.removeQ = removeQ;
module.exports.session = session;
module.exports.safeCallback = safeCallback;