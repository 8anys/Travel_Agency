AOS.init({
	duration: 800,
	easing: 'slide'
});

(function($) {
	"use strict";

	var authState = { user: null, checked: false };
	var toursCache = [];

	var apiRequest = function(url, options) {
		return fetch(url, Object.assign({
			credentials: 'same-origin',
			headers: { 'Accept': 'application/json' }
		}, options || {})).then(function(response) {
			return response.json().catch(function() {
				return { ok: false, message: '\u0421\u0435\u0440\u0432\u0435\u0440 \u043f\u043e\u0432\u0435\u0440\u043d\u0443\u0432 \u043d\u0435\u043a\u043e\u0440\u0435\u043a\u0442\u043d\u0443 \u0432\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u044c.' };
			}).then(function(data) {
				if (!response.ok) {
					data.ok = false;
				}
				return data;
			});
		});
	};

	var formBody = function(payload) {
		var params = new URLSearchParams();
		Object.keys(payload).forEach(function(key) {
			params.append(key, payload[key]);
		});
		return params.toString();
	};

	$(window).stellar({ responsive: true, parallaxBackgrounds: true, parallaxElements: true, horizontalScrolling: false, hideDistantElements: false, scrollProperty: 'scroll' });

	var fullHeight = function() {
		$('.js-fullheight').css('height', $(window).height());
		$(window).resize(function(){ $('.js-fullheight').css('height', $(window).height()); });
	};
	fullHeight();

	var loader = function() {
		setTimeout(function() { if ($('#ftco-loader').length > 0) { $('#ftco-loader').removeClass('show'); } }, 1);
	};
	loader();

	$.Scrollax();

	var carousel = function() {
		$('.carousel-testimony').owlCarousel({
			center: true,
			loop: true,
			items: 1,
			margin: 30,
			stagePadding: 0,
			nav: false,
			navText: ['<span class="ion-ios-arrow-back">', '<span class="ion-ios-arrow-forward">'],
			responsive: { 0: { items: 1 }, 600: { items: 2 }, 1000: { items: 3 } }
		});
	};
	carousel();

	$('nav .dropdown').hover(function(){
		var $this = $(this);
		$this.addClass('show');
		$this.find('> a').attr('aria-expanded', true);
		$this.find('.dropdown-menu').addClass('show');
	}, function(){
		var $this = $(this);
		$this.removeClass('show');
		$this.find('> a').attr('aria-expanded', false);
		$this.find('.dropdown-menu').removeClass('show');
	});

	var scrollWindow = function() {
		$(window).scroll(function(){
			var $w = $(this), st = $w.scrollTop(), navbar = $('.ftco_navbar'), sd = $('.js-scroll-wrap');
			if (st > 150 && !navbar.hasClass('scrolled')) { navbar.addClass('scrolled'); }
			if (st < 150 && navbar.hasClass('scrolled')) { navbar.removeClass('scrolled sleep'); }
			if (st > 350) {
				if (!navbar.hasClass('awake')) { navbar.addClass('awake'); }
				if (sd.length > 0) { sd.addClass('sleep'); }
			}
			if (st < 350) {
				if (navbar.hasClass('awake')) { navbar.removeClass('awake').addClass('sleep'); }
				if (sd.length > 0) { sd.removeClass('sleep'); }
			}
		});
	};
	scrollWindow();

	var counter = function() {
		$('#section-counter, .hero-wrap, .ftco-counter').waypoint(function(direction) {
			if (direction === 'down' && !$(this.element).hasClass('ftco-animated')) {
				var commaSeparator = $.animateNumber.numberStepFactories.separator(',');
				$('.number').each(function(){
					var $this = $(this), num = $this.data('number');
					$this.animateNumber({ number: num, numberStep: commaSeparator }, 7000);
				});
			}
		}, { offset: '95%' });
	};
	counter();

	var contentWayPoint = function() {
		$('.ftco-animate').waypoint(function(direction) {
			if (direction === 'down' && !$(this.element).hasClass('ftco-animated')) {
				$(this.element).addClass('item-animate');
				setTimeout(function(){
					$('body .ftco-animate.item-animate').each(function(k){
						var el = $(this);
						setTimeout(function() {
							var effect = el.data('animate-effect');
							if (effect === 'fadeIn') { el.addClass('fadeIn ftco-animated'); }
							else if (effect === 'fadeInLeft') { el.addClass('fadeInLeft ftco-animated'); }
							else if (effect === 'fadeInRight') { el.addClass('fadeInRight ftco-animated'); }
							else { el.addClass('fadeInUp ftco-animated'); }
							el.removeClass('item-animate');
						}, k * 50, 'easeInOutExpo');
					});
				}, 100);
			}
		}, { offset: '95%' });
	};
	contentWayPoint();

	var onePageNav = function() {
		$('.smoothscroll[href^="#"], #ftco-nav ul li a[href^="#"]').not('.js-open-register').on('click', function(e) {
			var hash = this.hash;
			var navToggler = $('.navbar-toggler');
			if (!hash || !$(hash).length) { return; }
			e.preventDefault();
			$('html, body').animate({ scrollTop: $(hash).offset().top }, 700, 'easeInOutExpo', function(){ window.location.hash = hash; });
			if (navToggler.is(':visible')) { navToggler.click(); }
		});
	};
	onePageNav();

	$('.image-popup').magnificPopup({
		type: 'image', closeOnContentClick: true, closeBtnInside: false, fixedContentPos: true,
		mainClass: 'mfp-no-margins mfp-with-zoom', gallery: { enabled: true, navigateByImgClick: true, preload: [0,1] }, image: { verticalFit: true }, zoom: { enabled: true, duration: 300 }
	});

	$('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({ disableOn: 700, type: 'iframe', mainClass: 'mfp-fade', removalDelay: 160, preloader: false, fixedContentPos: false });
	$('.checkin_date, .checkout_date').datepicker({ format: 'm/d/yyyy', autoclose: true });

	var updateAuthUi = function() {
		var $ctaLinks = $('.js-open-register');
		if (authState.user && authState.user.name) {
			$ctaLinks.text('\u041a\u0430\u0431\u0456\u043d\u0435\u0442: ' + authState.user.name.split(' ')[0]);
		} else {
			$ctaLinks.text('\u0417\u0430\u0431\u0440\u043e\u043d\u044e\u0432\u0430\u0442\u0438 \u0437\u0430\u0440\u0430\u0437');
		}
		document.dispatchEvent(new CustomEvent('travel-auth-updated', { detail: authState.user }));
	};

	var fetchAuthStatus = function() {
		return apiRequest('/api/auth/status').then(function(data) {
			authState.user = data.user || null;
			authState.checked = true;
			updateAuthUi();
			return data;
		});
	};

	var registrationModal = function() {
		var $modal = $('#register-modal');
		if (!$modal.length) { return; }
		var $body = $('body');
		var $tabs = $modal.find('.js-auth-tab');
		var $form = $modal.find('.js-auth-form');
		var $alert = $modal.find('.js-auth-alert');
		var $submit = $modal.find('.js-auth-submit');
		var $hint = $modal.find('.js-auth-hint');
		var $mode = $form.find('[name="mode"]');
		var $registerOnlyFields = $modal.find('.js-auth-field[data-auth-only="register"]');
		var registerHint = '\u041f\u0456\u0441\u043b\u044f \u0440\u0435\u0454\u0441\u0442\u0440\u0430\u0446\u0456\u0457 \u043f\u0440\u043e\u0444\u0456\u043b\u044c \u043f\u043e\u0442\u0440\u0430\u043f\u0438\u0442\u044c \u0443 \u0431\u0430\u0437\u0443 \u0434\u0430\u043d\u0438\u0445 \u0456 \u0431\u0443\u0434\u0435 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0438\u0439 \u0443 \u0432\u0430\u0448\u043e\u043c\u0443 \u043a\u0430\u0431\u0456\u043d\u0435\u0442\u0456.';
		var loginHint = '\u0423\u0432\u0456\u0439\u0434\u0456\u0442\u044c \u0443 \u0432\u0436\u0435 \u0441\u0442\u0432\u043e\u0440\u0435\u043d\u0438\u0439 \u0430\u043a\u0430\u0443\u043d\u0442, \u0449\u043e\u0431 \u043f\u0435\u0440\u0435\u0433\u043b\u044f\u043d\u0443\u0442\u0438 \u0441\u0432\u043e\u0457 \u0431\u0440\u043e\u043d\u044e\u0432\u0430\u043d\u043d\u044f \u0456 \u0441\u0442\u0432\u043e\u0440\u0438\u0442\u0438 \u043d\u043e\u0432\u0456.';

		var setAlert = function(message, isSuccess) {
			$alert.text(message).toggleClass('is-success', !!isSuccess).prop('hidden', false);
		};

		var clearAlert = function() {
			$alert.prop('hidden', true).removeClass('is-success').text('');
		};

		var setMode = function(mode) {
			var isRegister = mode === 'register';
			$mode.val(mode);
			$tabs.removeClass('is-active');
			$tabs.filter('[data-auth-mode="' + mode + '"]').addClass('is-active');
			$modal.attr('data-auth-mode', mode);
			$registerOnlyFields.toggleClass('is-hidden', !isRegister);
			$registerOnlyFields.find('input').prop('required', isRegister);
			$form.find('[name="policy"]').prop('required', isRegister);
			$submit.text(isRegister ? '\u0421\u0442\u0432\u043e\u0440\u0438\u0442\u0438 \u0430\u043a\u0430\u0443\u043d\u0442' : '\u0423\u0432\u0456\u0439\u0442\u0438 \u0432 \u0430\u043a\u0430\u0443\u043d\u0442');
			$hint.text(isRegister ? registerHint : loginHint);
			clearAlert();
		};

		var openModal = function(mode) {
			setMode(mode || 'register');
			$modal.addClass('is-open').attr('aria-hidden', 'false');
			$body.addClass('modal-open');
		};

		var closeModal = function() {
			$modal.removeClass('is-open').attr('aria-hidden', 'true');
			$body.removeClass('modal-open');
		};

		$('.js-open-register').on('click', function(event) {
			event.preventDefault();
			if (authState.user) {
				window.location.href = 'cabinet.html';
				return;
			}
			openModal($(this).data('authMode') || 'register');
		});

		$modal.find('.js-close-register').on('click', function() { closeModal(); });
		$tabs.on('click', function() { setMode($(this).data('auth-mode')); });
		$(document).on('keydown', function(event) { if (event.key === 'Escape' && $modal.hasClass('is-open')) { closeModal(); } });

		$modal.find('.js-google-auth').on('click', function() {
			clearAlert();
			var email = window.prompt('\u0412\u0432\u0435\u0434\u0456\u0442\u044c \u0432\u0430\u0448 Google email \u0434\u043b\u044f \u0432\u0445\u043e\u0434\u0443:', 'traveler@gmail.com');
			if (!email) { return; }
			apiRequest('/api/auth', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'Accept': 'application/json' },
				body: formBody({ action: 'google', email: email })
			}).then(function(data) {
				if (!data.ok) {
					setAlert(data.message || '\u041d\u0435 \u0432\u0434\u0430\u043b\u043e\u0441\u044f \u0432\u0438\u043a\u043e\u043d\u0430\u0442\u0438 \u0432\u0445\u0456\u0434 \u0447\u0435\u0440\u0435\u0437 Google.', false);
					return;
				}
				authState.user = data.user || null;
				updateAuthUi();
				setAlert(data.message || '\u0412\u0445\u0456\u0434 \u0447\u0435\u0440\u0435\u0437 Google \u0432\u0438\u043a\u043e\u043d\u0430\u043d\u043e.', true);
				setTimeout(function() { closeModal(); window.location.href = 'cabinet.html'; }, 900);
			});
		});

		$form.on('submit', function(event) {
			event.preventDefault();
			clearAlert();
			var mode = $mode.val();
			var payload = {
				action: mode,
				name: $.trim($form.find('[name="name"]').val()),
				phone: $.trim($form.find('[name="phone"]').val()),
				email: $.trim($form.find('[name="email"]').val()),
				password: $form.find('[name="password"]').val(),
				passwordConfirm: $form.find('[name="passwordConfirm"]').val(),
				policy: $form.find('[name="policy"]').is(':checked') ? 'true' : 'false'
			};

			apiRequest('/api/auth', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'Accept': 'application/json' },
				body: formBody(payload)
			}).then(function(data) {
				if (!data.ok) {
					setAlert(data.message || '\u0421\u0442\u0430\u043b\u0430\u0441\u044f \u043f\u043e\u043c\u0438\u043b\u043a\u0430. \u0421\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0449\u0435 \u0440\u0430\u0437.', false);
					return;
				}
				authState.user = data.user || null;
				updateAuthUi();
				$form[0].reset();
				setAlert(data.message || '\u041e\u043f\u0435\u0440\u0430\u0446\u0456\u044e \u0432\u0438\u043a\u043e\u043d\u0430\u043d\u043e \u0443\u0441\u043f\u0456\u0448\u043d\u043e.', true);
				setTimeout(function() { closeModal(); window.location.href = 'cabinet.html'; }, 900);
			});
		});

		$(document).on('click', '.js-logout', function(event) {
			event.preventDefault();
			apiRequest('/api/auth', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'Accept': 'application/json' },
				body: formBody({ action: 'logout' })
			}).then(function() {
				authState.user = null;
				updateAuthUi();
				if ($('.js-cabinet-page').length) {
					window.location.reload();
				}
			});
		});

		setMode('register');
	};
	registrationModal();

	var contactForm = function() {
		var $form = $('.js-contact-form');
		if (!$form.length) { return; }
		var $alert = $form.find('.js-contact-alert');
		var showAlert = function(message, isSuccess) { $alert.text(message).toggleClass('is-success', !!isSuccess).prop('hidden', false); };

		$form.on('submit', function(event) {
			event.preventDefault();
			$alert.prop('hidden', true).removeClass('is-success').text('');
			var payload = {
				name: $.trim($form.find('[name="name"]').val()),
				email: $.trim($form.find('[name="email"]').val()),
				subject: $.trim($form.find('[name="subject"]').val()),
				message: $.trim($form.find('[name="message"]').val())
			};
			apiRequest('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'Accept': 'application/json' },
				body: formBody(payload)
			}).then(function(data) {
				if (!data.ok) {
					showAlert(data.message || '?? ??????? ?????????? ????????????.', false);
					return;
				}
				$form[0].reset();
				showAlert(data.message || '???????????? ?????????.', true);
			});
		});
	};
	contactForm();

	var attachBookingButtons = function() {
		var $cards = $('.project-wrap .text');
		if (!$cards.length) { return; }
		if (!toursCache.length) {
			apiRequest('/api/tours').then(function(data) {
				toursCache = data.tours || [];
				attachBookingButtons();
			});
			return;
		}

		$cards.each(function(index) {
			var $text = $(this);
			if ($text.find('.js-book-tour').length) { return; }
			var tour = toursCache[index];
			if (!tour) { return; }
			$text.append('<div class="booking-tour-action"><button type="button" class="btn btn-primary js-book-tour" data-tour-id="' + tour.id + '" data-tour-title="' + tour.title.replace(/"/g, '&quot;') + '">??????????? ???</button></div>');
		});
	};

	var bookingHandler = function() {
		$(document).on('click', '.js-book-tour', function() {
			if (!authState.user) {
				var $trigger = $('.js-open-register').first();
				$trigger.attr('data-auth-mode', 'login').trigger('click').removeAttr('data-auth-mode');
				return;
			}

			var tourId = $(this).data('tour-id');
			var tourTitle = $(this).data('tour-title');
			var dateFrom = window.prompt('??????? ?????? ???? ??????? ??????? ??? ???? "' + tourTitle + '" (YYYY-MM-DD):', new Date().toISOString().slice(0, 10));
			if (!dateFrom) { return; }
			var peopleCount = window.prompt('??????? ????? ???? ?????????????', '2');
			if (!peopleCount) { return; }
			var notes = window.prompt("????????? ????????? ?? ?????????? (??????'??????):", '') || '';

			apiRequest('/api/bookings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'Accept': 'application/json' },
				body: formBody({ tour_id: tourId, date_from: dateFrom, people_count: peopleCount, notes: notes })
			}).then(function(data) {
				if (!data.ok) {
					window.alert(data.message || '?? ??????? ???????? ??????????.');
					return;
				}
				window.alert(data.message || '?????????? ????????.');
			});
		});
	};
	bookingHandler();

	var cabinetPage = function() {
		var $page = $('.js-cabinet-page');
		if (!$page.length) { return; }
		var $summary = $('.js-cabinet-summary');
		var $bookings = $('.js-cabinet-bookings');

		var renderGuest = function() {
			$summary.html('<div class="cabinet-empty"><h3>???????? ? ???? ??????</h3><p>????? ????? ??? ?????????? ???? ??????????, ????????? ???? ?? ??????? ???????.</p><button type="button" class="btn btn-primary js-open-register">?????? ??? ???????????????</button></div>');
			$bookings.html('');
		};

		var renderProfile = function(profileData, bookingsData) {
			var user = profileData.user;
			var stats = profileData.stats;
			var bookingItems = bookingsData.bookings || [];
			$summary.html(
				'<div class="cabinet-grid">' +
				'<div class="cabinet-card cabinet-card--profile"><span class="cabinet-label">???????</span><h3>' + user.name + '</h3><p><strong>Email:</strong> ' + user.email + '</p><p><strong>???????:</strong> ' + (user.phone || '?? ?? ???????') + '</p><p><strong>??? ?????:</strong> ' + (user.provider === 'google' ? 'Google' : 'Email ? ??????') + '</p><a href="#" class="cabinet-link js-logout">????? ? ???????</a></div>' +
				'<div class="cabinet-card"><span class="cabinet-label">??????????</span><h3>' + stats.total_bookings + '</h3><p>???????? ?? ?????????? ?????? ? ?????? ????????.</p></div>' +
				'<div class="cabinet-card"><span class="cabinet-label">??????? ??????????</span><h3>' + (stats.last_booking_at ? new Date(stats.last_booking_at).toLocaleDateString('uk-UA') : '?? ?????') + '</h3><p>???? ?????????? ?????????? ??????????.</p></div>' +
				'</div>'
			);

			if (!bookingItems.length) {
				$bookings.html('<div class="cabinet-empty"><h3>????????? ???? ?????</h3><p>??????? ???? ?? ????? ?? ???????? ?????????, ? ??? ?????? ????????? ???.</p><a href="destination.html" class="btn btn-primary">??????? ?? ?????</a></div>');
				return;
			}

			$bookings.html(bookingItems.map(function(item) {
				return '<article class="cabinet-booking">' +
				'<div class="cabinet-booking__media" style="background-image:url(images/' + item.image + ')"></div>' +
				'<div class="cabinet-booking__content">' +
				'<span class="cabinet-booking__status">' + item.status + '</span>' +
				'<h3>' + item.title + '</h3>' +
				'<p>' + item.city + ', ' + item.country + '</p>' +
				'<ul class="cabinet-booking__meta"><li>????: ' + item.date_from + '</li><li>?????: ' + item.people_count + '</li><li>??????????: ' + item.duration_days + ' ????</li><li>????: $' + item.price + '</li></ul>' +
				(item.notes ? '<p class="cabinet-booking__notes">?????????: ' + item.notes + '</p>' : '') +
				'</div></article>';
			}).join(''));
		};

		var loadCabinet = function() {
			if (!authState.user) {
				renderGuest();
				return;
			}
			Promise.all([ apiRequest('/api/profile'), apiRequest('/api/bookings') ]).then(function(results) {
				if (!results[0].ok || !results[1].ok) {
					renderGuest();
					return;
				}
				renderProfile(results[0], results[1]);
			});
		};

		document.addEventListener('travel-auth-updated', loadCabinet);
		loadCabinet();
	};
	cabinetPage();

	fetchAuthStatus();
	attachBookingButtons();

})(jQuery);
