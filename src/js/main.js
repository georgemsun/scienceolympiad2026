// Function for including other scripts
function include(file) {
	var script = document.createElement('script');
	script.src = file;
	script.type = 'text/javascript';
	document.getElementsByTagName('head').item(0).appendChild(script);
}
include('/src/js/accordion.js');

// Appends site name to page titles
var site_title = "2026 Science Olympiad National Tournament";
if (document.title.length == 0) {
	document.title = site_title;
} else {
	document.title += " - " + site_title;
}

// Adds files for page head, navigation, and footer
$(function() {
	$.get('/src/html/head.html', function(data) {
		$('head').append(data);
		$.get('/src/html/navigation.html', function(data) {
			$('.header').prepend(data);
			$.get('/src/html/footer.html', function(data) {
				$('body').append(data);
			});
		});
	});
});

// Function is called by the hamburger menu when it is clicked
menu = false;
function hamburger(element) {
	if (!menu) {
		$('.navigation').toggleClass('active');
		menu = true;
	} else {
		$('.navigation').toggleClass('active');
		menu = false;
	}
}

// Add class for high-contrast mode
$(document).ready(function() {
	var mode = localStorage.getItem('mode');
	if (mode == 'contrast') {
		$('html').addClass('contrast');
	}
});
$(document).on('click', '#contrast', function () {
	const enabled = $('html').toggleClass('contrast').hasClass('contrast');
	if (enabled) {
		localStorage.setItem('mode', 'contrast');
	} else {
		localStorage.removeItem('mode');
	}
});

// External links and PDFs open in new tab
$(function() {
	$.expr[':'].external = function(obj){
		return !obj.href.match(/^mailto\:/)
			&& (obj.hostname != location.hostname)
			&& !obj.href.match(/^javascript\:/)
			&& !obj.href.match(/^$/)
	};
	$('a:external, a[href$=".pdf"]').attr('target', '_blank');
});

// Add parameter with current datetime to `soinc.org` URLs to force cache refresh
document.addEventListener('DOMContentLoaded', () => {
	document.querySelectorAll('a[href]').forEach(a => {
		const url = new URL(a.href, window.location.origin);

		if (url.hostname === 'soinc.org' || url.hostname === 'www.soinc.org') {
			url.searchParams.set('refresh', Date.now());
			a.href = url.toString();
		}
	});
});

// Copy links to anchors when clicked
$(function() {
	$('h1, h2, h3, h4, h5, h6').not('.header *').not('.trifold *').css('cursor', 'pointer');
	$('h1, h2, h3, h4, h5, h6').not('.header *').not('.trifold *').not('.accordion *').click(function(event) {
		let copy = document.createElement('input');
		copy.value = window.location.href.split(/[?#]/)[0] + "#" + event.target.id;
		document.body.appendChild(copy);
		copy.select();
		document.execCommand('copy');
		document.body.removeChild(copy);
		if ($(this).find('.copy-clipboard').length == 0) {
			$('<i class="material-icons copy-clipboard" style="font-size: 0.75em; margin-left: 10px;">content_copy</i>').appendTo(this).delay(2000).queue(function() { $(this).remove(); });
		}
	});
});

// Automatically expand last schedule viewed
$(document).ready(function() {
	// Clear values if it has been at least 12 hours since last set
	if (Date.now() - parseInt(localStorage.getItem('time'), 10) >= 12 * 60 * 60 * 1000) {
		localStorage.removeItem('schedules');
		localStorage.removeItem('time');
	}

	// Restore active schedules
	let schedules = localStorage.getItem('schedules');
	schedules = schedules ? schedules.split(',') : [];
	schedules.forEach(item => {
		$('h3#' + item).addClass('active');
	});

	// Click handler for updating schedules displayed
	$('.schedule-day h3, .schedule-events h3').on('click', function() {
		// Get clicked item
		const id = $(this).attr('id');

		// Get list of active items
		let schedules = localStorage.getItem('schedules');
		schedules = schedules ? schedules.split(',') : [];

		// Check if clicked item is active or not
		if (schedules.includes(id)) {
			schedules = schedules.filter(item => item !== id);
		} else {
			schedules.push(id);
		}

		// Update local storage with list of displayed schedules
		if (schedules.length) {
			localStorage.setItem('schedules', schedules.join(','));
			localStorage.setItem('time', Date.now().toString());
		} else {
			localStorage.removeItem('schedules');
			localStorage.removeItem('time');
		}
	});
});

// Fade out other team number ranges when one is selected on event schedules
$(document).ready(function() {
	// Regex to match ranges like 1–10, 11–20, etc.
	var regex_rule = /^\d+–\d+$/;

	// Load previously selected range from localStorage
	var team = localStorage.getItem('team');

	// Fade all team number ranges except those corresponding to selected range
	function focus_team_numbers(range) {
		$('.schedule-events td').each(function() {
			var selected = $(this).text().trim();
			if (regex_rule.test(selected)) {
				if (selected !== range) {
					$(this).css('color', 'var(--primary-pink)'); // Fade non-matching
				} else {
					$(this).css('color', ''); // Matching range normal
				}
			}
		});
	}

	// Restore previous selection on page load
	if (team) {
		focus_team_numbers(team);
	}

	// Apply rules to all table cells in event schedules
	$('.schedule-events td').each(function() {
		var text = $(this).text().trim();

		if (regex_rule.test(text)) {
			// Show pointer on hover
			$(this).css('cursor', 'pointer');

			$(this).click(function() {
				// If selected is same as current range, reset all cell styles
				if (team === text) {
					$('td').each(function() {
						if (regex_rule.test($(this).text().trim())) {
							$(this).css('color', '');
						}
					});
					team = null;
					localStorage.removeItem('team');
				// Otherwise apply styling to corresponding cells and store current selection
				} else {
					team = text;
					focus_team_numbers(team);
					localStorage.setItem('team', team);
				}
			});
		}
	});
});