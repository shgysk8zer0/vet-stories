['map', 'reduce', 'filter', 'forEach', 'some', 'every'].forEach(function(method) {
	NodeList.prototype[method] = Array.prototype[method];
});
function $(selector) {
	return document.querySelectorAll(selector);
}
function buildArticle(story) {
	var url = new URL(window.location.href);
	var container = document.querySelector('[itemprop="text"]');
	var header = document.createElement('header');
	var footer = document.createElement('footer');
	var ccLogo = new Image();

	url.hash = '#chapter-0';
	container.childNodes.filter(function(node) {
		return node.nodeType === 1;
	}).forEach(function(node) {
		console.log(node);
		node.parentElement.removeChild(node);
	});
	ccLogo.src = 'https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png';
	ccLogo.alt = 'Creative Commons License';
	ccLogo.addEventListener('load', function() {
		var terms = document.createElement('span');
		var author = document.createElement('span');
		var license = document.createElement('a');

		this.width = this.naturalWidth;
		this.height = this.naturalHeight;
		footer.appendChild(license);
		license.rel = 'license';
		terms.setAttribute('xmlns:dct', 'http://purl.org/dc/terms/');
		terms.setAttribute('href', 'http://purl.org/dc/dcmitype/Text');
		terms.setAttribute('property', "dct:title");
		terms.setAttribute('rel', 'dct:type');
		author.setAttribute('xmlns', 'http://creativecommons.org/ns#');
		author.setAttribute('property', 'cc:attributionName');
		author.setAttribute('rel', 'author');
		author.textContent = story.author;
		terms.textContent = story.title;
		footer.appendChild(license);
		license.appendChild(this);
		footer.appendChild(document.createElement('br'));
		footer.appendChild(terms);
		footer.innerHTML += ' by ';
		footer.appendChild(author);
		footer.innerHTML += ' is licensed under a ';
		footer.appendChild(license.cloneNode(true)).textContent = 'Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License';
	});
	container.appendChild(header);
	if ('image' in story) {
		var img = new Image();
		img.src = story.image;
		img.width = 46;
		img.height = 46;
		header.appendChild(img);
		img.alt = story.author;
		img.addEventListener('load', function() {
			console.log(this);
			this.width = this.naturalWidth;
			this.height = this.naturalHeight;
		});
		delete img;
	}
	var title = document.createElement('h2');
	container.appendChild(title);
	title.textContent = story.title;
	delete title;
	story.chapters.forEach(function(segment, chapter, chapters) {
		var section  = document.createElement('section');
		var nav = document.createElement('nav');
		var next = document.createElement('a');
		var prev = document.createElement('a');

		container.appendChild(section);
		section.appendChild(nav);
		nav.appendChild(prev);
		nav.appendChild(next);
		section.id = 'chapter-' + chapter;
		next.href = '#chapter-' + (chapter + 1);
		prev.href = '#chapter-' + (chapter - 1);
		prev.rel = 'prev';
		next.rel = 'next';
		section.innerHTML += segment;
	});
	container.appendChild(footer);
	window.location.replace(url);
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
	var url = new URL('stories/lorem-ipsum.json', window.location);
	fetch(url).then(function(resp){
		if (resp.ok && resp.headers.get('Content-Type').startsWith('application/json')) {
			return resp;
		} else {
			throw 'Unable to process request';
		}
	}).then(function(resp) {
		return resp.json();
	}).then(function(json) {
		buildArticle(json);
	}).catch(function(exception) {
		console.error(exception);
	})
});
