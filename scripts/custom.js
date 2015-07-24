['map', 'reduce', 'filter', 'forEach', 'some', 'every'].forEach(function(method) {
	NodeList.prototype[method] = Array.prototype[method];
});
function $(selector) {
	return document.querySelectorAll(selector);
}
function fetchStory(url) {
	fetch(new URL(url, window.location)).then(function(resp){
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
	});
}
function fetchLinks() {
	fetch(new URL('links.json', window.location)).then(function(resp){
		if (resp.ok && resp.headers.get('Content-Type').startsWith('application/json')) {
			return resp;
		} else {
			throw 'Unable to process request';
		}
	}).then(function(resp) {
		return resp.json();
	}).then(function(links) {
		links.nav.reduce(function(nav, link) {
			var a = document.createElement('a');
			a.href = link.href;
			a.textContent = link.text;
			nav.appendChild(a);
			return nav;
		}, document.querySelector('body > header > nav'));
		$('body > header a').filter(function(a) {
			return a.origin === location.origin;
		}).forEach(function(link) {
			link.addEventListener('click', function(event) {
				event.preventDefault();
				fetchStory(this.href);
			});
		})
		links.sidebar.reduce(function(sidebar, link) {
			var a = document.createElement('a');
			a.innerHTML = link.text;
			a.href = link.href;
			sidebar.appendChild(a);
			if ('attributes' in link) {
				Object.keys(link.attributes).forEach(function(attr) {
					a.setAttribute(attr, link.attributes[attr]);
				});
			}
			return sidebar;
		}, document.querySelector('aside'));
		links.footer.reduce(function(footer, link) {
			if (link === 'br') {
				footer.appendChild(document.createElement('br'));
				return footer;
			}
			var a = document.createElement('a');
			var icon = new URL('images/combined.svg', window.location);
			footer.appendChild(a);
			a.href = link.href || '#';
			if ('svg' in link) {
				var dom = new DOMParser();
				var svg = document.createElement('svg');
				var use = document.createElement('use');
				svg.appendChild(use);
				icon.hash = '#' + link.svg;
				svg.classList.add('logo');
				svg.setAttribute('version', '1.1');
				svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
				svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
				use.setAttribute('xlink:href', icon);
				var doc = dom.parseFromString(svg.outerHTML, 'image/svg+xml');
				a.appendChild(document.importNode(doc.documentElement, true));
			} else if ('img' in link) {
				var img = new Image();
				img.src = link.img;
				img.addEventListener('load', function() {
					a.appendChild(img);
				})
			} else if ('html' in link) {
				a.innerHTML = link.html;
			} else if ('text' in link) {
				a.textContent = link.text;
			}
			if ('attributes' in link) {
				Object.keys(link.attributes).forEach(function(attr) {
					a.setAttribute(attr, link.attributes[attr]);
				});
			}
			return footer;
		}, document.querySelector('body > footer'));
	}).catch(function(exception) {
		console.error(exception);
	});
}
function buildArticle(story) {
	var url = new URL(window.location.href);
	document.title = story.title + ' - ' + story.author + ' | Vet Stories';
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
	fetchStory('stories/lorem-ipsum.json');
	fetchLinks();
});
