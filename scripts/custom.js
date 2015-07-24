['map', 'reduce', 'filter', 'forEach', 'some', 'every'].forEach(function(method) {
	NodeList.prototype[method] = Array.prototype[method];
});
function $(selector) {
	return document.querySelectorAll(selector);
}
window.addEventListener('load', function() {
	var nav = document.createElement('nav');
	document.querySelector('body > header').appendChild(nav);
	$('article > section[id]').forEach(function(section) {
		var link = document.createElement('a');
		link.href = '#' + section.id;
		link.textContent = section.id;
		nav.appendChild(link);
	});
});
