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
		var $adminLink = $('.js-admin-link');
		if (!$adminLink.length && $('.js-cabinet-link').length) {
			$adminLink = $('<li class="nav-item js-admin-link" hidden><a href="admin.html" class="nav-link">Адмін-панель</a></li>');
			$('.js-cabinet-link').after($adminLink);
		}
		if (authState.user && authState.user.name) {
			$ctaLinks.each(function() {
				var $link = $(this);
				var $item = $link.closest('.nav-item');
				var destination = authState.user.is_admin ? 'admin.html' : 'cabinet.html';
				$link.text('Кабінет: ' + authState.user.name.split(' ')[0]).addClass('js-account-toggle').attr('aria-expanded', 'false');
				$item.addClass('account-menu-wrap');
				if (!$item.find('.js-account-menu').length) {
					$item.append('' +
						'<div class="account-menu js-account-menu" hidden>' +
						'<a href="' + destination + '" class="account-menu__item js-account-home">Мій кабінет</a>' +
						'<button type="button" class="account-menu__item account-menu__item--danger js-logout">Вийти</button>' +
						'</div>');
				}
				$item.find('.js-account-home').attr('href', destination).text(authState.user.is_admin ? 'Адмін-панель' : 'Мій кабінет');
			});
		} else {
			$ctaLinks.each(function() {
				var $link = $(this);
				var $item = $link.closest('.nav-item');
				$link.text('Забронювати зараз').removeClass('js-account-toggle').removeAttr('aria-expanded');
				$item.removeClass('account-menu-wrap is-account-open');
				$item.find('.js-account-menu').remove();
			});
		}
		if ($adminLink.length) {
			$adminLink.prop('hidden', !(authState.user && authState.user.is_admin));
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

		$(document).on('click', '.js-open-register', function(event) {
			event.preventDefault();
			if (authState.user) {
				var $item = $(this).closest('.nav-item');
				$('.account-menu-wrap').not($item).removeClass('is-account-open').find('.js-account-menu').prop('hidden', true);
				$item.toggleClass('is-account-open');
				$item.find('.js-account-menu').prop('hidden', !$item.hasClass('is-account-open'));
				$(this).attr('aria-expanded', $item.hasClass('is-account-open') ? 'true' : 'false');
				return;
			}
			openModal($(this).data('authMode') || 'register');
		});

		$(document).on('click', function(event) {
			if ($(event.target).closest('.account-menu-wrap').length) { return; }
			$('.account-menu-wrap').removeClass('is-account-open').find('.js-account-menu').prop('hidden', true);
			$('.js-account-toggle').attr('aria-expanded', 'false');
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
				setTimeout(function() { closeModal(); window.location.href = authState.user.is_admin ? 'admin.html' : 'cabinet.html'; }, 900);
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
				setTimeout(function() { closeModal(); window.location.href = authState.user.is_admin ? 'admin.html' : 'cabinet.html'; }, 900);
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
				if ($('.js-cabinet-page, .js-admin-page').length) {
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
					showAlert(data.message || 'Не вдалося відправити повідомлення.', false);
					return;
				}
				$form[0].reset();
				showAlert(data.message || 'Повідомлення збережено.', true);
			});
		});
	};
	contactForm();

	var escapeHtml = function(value) {
		return $('<div>').text(value == null ? '' : String(value)).html();
	};

	var formatDate = function(value) {
		if (!value) { return 'Ще не заплановано'; }
		var parsed = new Date(value);
		if (Number.isNaN(parsed.getTime())) { return value; }
		return parsed.toLocaleDateString('uk-UA', { year: 'numeric', month: 'long', day: 'numeric' });
	};


	var parsePickerDate = function(value) {
		if (!value) { return ''; }
		var parts = String(value).split('/');
		if (parts.length !== 3) { return value; }
		var month = parts[0].padStart(2, '0');
		var day = parts[1].padStart(2, '0');
		var year = parts[2];
		return year + '-' + month + '-' + day;
	};

	var getToursRequestUrl = function() {
		var params = new URLSearchParams(window.location.search);
		var apiParams = new URLSearchParams();
		['query', 'country', 'city', 'date_from', 'price_min', 'price_max', 'transport', 'duration_days', 'available_seats', 'sort'].forEach(function(key) {
			var value = params.get(key);
			if (value) { apiParams.set(key, value); }
		});
		var queryString = apiParams.toString();
		return '/api/tours' + (queryString ? '?' + queryString : '');
	};

	var syncTourCards = function() {
		var $cards = $('.project-wrap');
		if (!$cards.length) { return; }
		var $grid = $cards.first().parent().parent();
		var $empty = $('.js-tour-empty');
		if (!$empty.length) {
			$empty = $('<div class="col-12 js-tour-empty" hidden><div class="cabinet-empty"><h3>Нічого не знайдено</h3><p>Спробуйте змінити фільтри або обрати іншу дату подорожі.</p></div></div>');
			$grid.append($empty);
		}
		if (!toursCache.length) {
			$cards.parent().attr('hidden', true);
			$empty.prop('hidden', false);
			return;
		}
		$empty.prop('hidden', true);
		while ($cards.length < toursCache.length) {
			var $newColumn = $cards.first().parent().clone(false, false);
			$newColumn.removeAttr('hidden').addClass('js-generated-tour-card');
			$newColumn.find('.booking-tour-meta, .booking-tour-action').remove();
			$newColumn.insertBefore($empty);
			$cards = $('.project-wrap');
		}
		$cards.each(function(index) {
			var $card = $(this);
			var tour = toursCache[index];
			if (!tour) {
				$card.parent().attr('hidden', true);
				return;
			}
			$card.parent().attr('hidden', false);
			$card.find('.img').attr('href', 'tour.html?id=' + tour.id).css('background-image', 'url(images/' + escapeHtml(tour.image) + ')');
			$card.find('.price').text('$' + tour.price + '/особа');
			$card.find('.days').text(tour.duration_days + ' днів туру');
			$card.find('h3 a').attr('href', 'tour.html?id=' + tour.id).text(tour.title);
			$card.find('.location').html('<span class="ion-ios-map"></span> Відправлення: ' + escapeHtml(tour.departure_city));
			var seatsAvailable = parseInt(tour.seats_available, 10) || 0;
			var features = [
				'<li><span class="flaticon-sun-umbrella"></span>' + escapeHtml(tour.country) + '</li>',
				'<li><span class="flaticon-mountains"></span>' + escapeHtml(tour.transport) + '</li>',
				'<li><span class="flaticon-king-size"></span>' + escapeHtml(seatsAvailable) + ' вільних місць</li>'
			];
			$card.find('ul').html(features.join(''));
		});
	};

	var attachBookingButtons = function() {
		var $cards = $('.project-wrap .text');
		if (!$cards.length) { return; }
		if (!toursCache.length) {
			apiRequest(getToursRequestUrl()).then(function(data) {
				toursCache = data.tours || [];
				syncTourCards();
				attachBookingButtons();
			});
			return;
		}

		$cards.each(function(index) {
			var $text = $(this);
			$text.find('.booking-tour-meta, .booking-tour-action').remove();
			var tour = toursCache[index];
			if (!tour) { return; }
			var seatsAvailable = parseInt(tour.seats_available, 10) || 0;
			var isSoldOut = seatsAvailable <= 0;
			var meta = '' +
				'<div class="booking-tour-meta">' +
				'<span class="booking-tour-pill">' + escapeHtml(tour.route_code) + '</span>' +
				'<span class="booking-tour-pill">Виїзд: ' + escapeHtml(formatDate(tour.departure_date)) + '</span>' +
				'<span class="booking-tour-pill">Вільно місць: ' + escapeHtml(seatsAvailable) + '</span>' +
				'</div>';
			var button = '' +
				'<div class="booking-tour-action">' +
				'<a href="tour.html?id=' + tour.id + '" class="btn btn-white booking-tour-action__link">Детальніше</a>' +
				'<button type="button" class="btn btn-primary js-book-tour" ' +
				'data-tour-id="' + tour.id + '" ' +
				'data-tour-title="' + escapeHtml(tour.title) + '" ' +
				'data-tour-route="' + escapeHtml(tour.route_code) + '" ' +
				'data-tour-date="' + escapeHtml(tour.departure_date) + '" ' +
				'data-tour-seats="' + seatsAvailable + '" ' +
				(isSoldOut ? 'disabled' : '') + '>' +
				(isSoldOut ? 'Місць немає' : 'Забронювати місце') +
				'</button>' +
				'</div>';
			$text.append(meta + button);
		});
	};

	var tourSearchForms = function() {
		$('.search-property-1').on('submit', function(event) {
			event.preventDefault();
			var $form = $(this);
			var params = new URLSearchParams();
			var query = $.trim($form.find('input[type="text"]').first().val());
			var dateFrom = parsePickerDate($.trim($form.find('.checkin_date').val()));
			var priceMax = $.trim($form.find('select').val());
			if (query) { params.set('query', query); }
			if (dateFrom) { params.set('date_from', dateFrom); }
			if (priceMax) { params.set('price_max', String(priceMax).replace(/[^\d]/g, '')); }
			window.location.href = 'destination.html' + (params.toString() ? '?' + params.toString() : '');
		});
	};
	tourSearchForms();

	var tourDetailPage = function() {
		var $page = $('.js-tour-detail-page');
		if (!$page.length) { return; }
		var params = new URLSearchParams(window.location.search);
		var tourId = parseInt(params.get('id'), 10);
		var $content = $('.js-tour-detail-content');
		if (!tourId) {
			$content.html('<div class="cabinet-empty"><h3>Тур не обрано</h3><p>Поверніться до каталогу і відкрийте потрібну подорож.</p><a href="destination.html" class="btn btn-primary">До всіх турів</a></div>');
			return;
		}
		apiRequest('/api/tours/' + tourId).then(function(data) {
			if (!data.ok || !data.tour) {
				$content.html('<div class="cabinet-empty"><h3>Тур не знайдено</h3><p>Можливо, він був змінений або тимчасово недоступний.</p><a href="destination.html" class="btn btn-primary">Повернутися до каталогу</a></div>');
				return;
			}
			var tour = data.tour;
			toursCache = [tour];
			var seatsAvailable = parseInt(tour.seats_available, 10) || 0;
			var seatPreview = (tour.seat_map && tour.seat_map.layout ? tour.seat_map.layout.slice(0, 12) : []).map(function(seat) {
				var occupied = tour.seat_map.occupied.indexOf(seat) !== -1;
				return '<span class="tour-seat-badge' + (occupied ? ' is-occupied' : '') + '">' + escapeHtml(seat) + '</span>';
			}).join('');
			$content.html('' +
				'<div class="row align-items-start">' +
				'<div class="col-lg-6 mb-4">' +
				'<div class="tour-detail__image" style="background-image:url(images/' + escapeHtml(tour.image) + ')"></div>' +
				'</div>' +
				'<div class="col-lg-6">' +
				'<div class="tour-detail__panel">' +
				'<div class="booking-tour-meta"><span class="booking-tour-pill">' + escapeHtml(tour.route_code) + '</span><span class="booking-tour-pill">' + escapeHtml(tour.transport) + '</span><span class="booking-tour-pill">' + escapeHtml(seatsAvailable) + ' місць</span></div>' +
				'<h2 class="tour-detail__title">' + escapeHtml(tour.title) + '</h2>' +
				'<p class="tour-detail__lead">' + escapeHtml(tour.description) + '</p>' +
				'<div class="tour-detail__stats">' +
				'<div><span>Країна</span><strong>' + escapeHtml(tour.country) + '</strong></div>' +
				'<div><span>Місто</span><strong>' + escapeHtml(tour.city) + '</strong></div>' +
				'<div><span>Дата виїзду</span><strong>' + escapeHtml(formatDate(tour.departure_date)) + '</strong></div>' +
				'<div><span>Тривалість</span><strong>' + escapeHtml(tour.duration_days) + ' днів</strong></div>' +
				'<div><span>Відправлення</span><strong>' + escapeHtml(tour.departure_city) + '</strong></div>' +
				'<div><span>Ціна</span><strong>$' + escapeHtml(tour.price) + ' / особа</strong></div>' +
				'</div>' +
				'<div class="tour-detail__section"><h3>Умови бронювання</h3><p>Після вибору місць заявка зберігається в кабінеті, а менеджер підтверджує бронювання та фінальну оплату.</p></div>' +
				'<div class="tour-detail__section"><h3>Карта місць</h3><div class="tour-seat-preview">' + seatPreview + '</div></div>' +
				'<div class="booking-tour-action tour-detail__actions">' +
				'<a href="destination.html" class="btn btn-white booking-tour-action__link">Усі маршрути</a>' +
				'<button type="button" class="btn btn-primary js-book-tour" data-tour-id="' + tour.id + '" data-tour-title="' + escapeHtml(tour.title) + '" data-tour-route="' + escapeHtml(tour.route_code) + '" data-tour-date="' + escapeHtml(tour.departure_date) + '" data-tour-seats="' + seatsAvailable + '" ' + (seatsAvailable <= 0 ? 'disabled' : '') + '>' + (seatsAvailable <= 0 ? 'Місць немає' : 'Забронювати тур') + '</button>' +
				'</div>' +
				'</div>' +
				'</div>' +
				'</div>');
		});
	};
	tourDetailPage();
	var bookingPlanner = function() {
		var $modal = $('#booking-planner-modal');
		if (!$modal.length) { return; }
		var plannerState = { tour: null, selectedSeats: [], passengerCount: 1 };
		var $body = $('body');
		var $summary = $modal.find('.js-planner-summary');
		var $seatMap = $modal.find('.js-seat-map');
		var $passengerFields = $modal.find('.js-passenger-fields');
		var $form = $modal.find('.js-planner-form');
		var $alert = $modal.find('.js-planner-alert');
		var $count = $modal.find('.js-passenger-count');
		var $total = $modal.find('.js-planner-total');
		var $date = $modal.find('[name="date_from"]');
		var $notes = $modal.find('[name="notes"]');
		var $split = $modal.find('.js-split-booking');

		var closePlanner = function() {
			$modal.removeClass('is-open').attr('aria-hidden', 'true');
			$body.removeClass('modal-open');
		};

		var setAlert = function(message, isSuccess) {
			$alert.text(message).toggleClass('is-success', !!isSuccess).prop('hidden', false);
		};

		var clearAlert = function() {
			$alert.prop('hidden', true).removeClass('is-success').text('');
		};

		var syncTotal = function() {
			var price = plannerState.tour ? Number(plannerState.tour.price || 0) : 0;
			$total.text('$' + (price * plannerState.passengerCount).toFixed(0));
		};

		var renderPassengerFields = function() {
			var cards = [];
			for (var i = 0; i < plannerState.passengerCount; i++) {
				var seat = plannerState.selectedSeats[i] || 'Оберіть місце';
				cards.push('' +
					'<div class="booking-planner__passenger">' +
					'<span class="booking-planner__passenger-title">Пасажир ' + (i + 1) + '</span>' +
					'<div class="booking-planner__passenger-seat">Місце: ' + escapeHtml(seat) + '</div>' +
					'<input type="text" class="form-control js-passenger-name" data-passenger-index="' + i + '" placeholder="' + (i === 0 ? 'Ваше ім\'я та прізвище' : 'Ім\'я та прізвище пасажира') + '" ' + (i === 0 ? 'value="' + escapeHtml(authState.user ? authState.user.name : '') + '"' : '') + ($split.is(':checked') && i > 0 ? ' disabled' : ' required') + '>' +
					($split.is(':checked') && i > 0 ? '<small class="booking-planner__split-note">Пасажир заповнить дані за своїм захищеним посиланням.</small>' : '') +
					'</div>');
			}
			$passengerFields.html(cards.join(''));
		};

		var renderSeatMap = function() {
			if (!plannerState.tour) { return; }
			var seatMap = plannerState.tour.seat_map || { layout: [], occupied: [] };
			var transport = String(plannerState.tour.transport || '').toLowerCase();
			$seatMap.removeClass('booking-planner__map--train booking-planner__map--bus');
			if (transport.indexOf('train') !== -1) { $seatMap.addClass('booking-planner__map--train'); }
			if (transport.indexOf('bus') !== -1) { $seatMap.addClass('booking-planner__map--bus'); }
			$seatMap.html(seatMap.layout.map(function(seatLabel) {
				var occupied = seatMap.occupied.indexOf(seatLabel) !== -1;
				var selected = plannerState.selectedSeats.indexOf(seatLabel) !== -1;
				var classes = 'seat' + (occupied ? ' seat--occupied' : '') + (selected ? ' seat--selected' : '');
				return '<button type="button" class="' + classes + ' js-seat-toggle" data-seat="' + escapeHtml(seatLabel) + '" ' + (occupied ? 'disabled' : '') + '>' + escapeHtml(seatLabel) + '</button>';
			}).join(''));
			renderPassengerFields();
			syncTotal();
		};

		var openPlanner = function(tour) {
			plannerState.tour = tour;
			plannerState.selectedSeats = [];
			plannerState.passengerCount = 1;
			clearAlert();
			$split.prop('checked', false);
			$notes.val('');
			$date.val(String(tour.departure_date || '').slice(0, 10));
			$count.html('');
			for (var i = 1; i <= Math.max(1, Math.min(6, parseInt(tour.seats_available, 10) || 1)); i++) {
				$count.append('<option value="' + i + '">' + i + ' пас.</option>');
			}
			$count.val('1');
			$summary.html('' +
				'<div class="booking-planner__card"><span>Маршрут</span><strong>' + escapeHtml(tour.route_code) + '</strong></div>' +
				'<div class="booking-planner__card"><span>Транспорт</span><strong>' + escapeHtml(tour.transport) + '</strong></div>' +
				'<div class="booking-planner__card"><span>Вільно місць</span><strong>' + escapeHtml(tour.seats_available) + '</strong></div>');
			$modal.addClass('is-open').attr('aria-hidden', 'false');
			$body.addClass('modal-open');
			renderSeatMap();
		};

		$count.on('change', function() {
			plannerState.passengerCount = parseInt($(this).val(), 10) || 1;
			if (plannerState.selectedSeats.length > plannerState.passengerCount) {
				plannerState.selectedSeats = plannerState.selectedSeats.slice(0, plannerState.passengerCount);
			}
			renderSeatMap();
		});

		$split.on('change', function() {
			renderPassengerFields();
		});

		$(document).on('click', '.js-seat-toggle', function() {
			var seat = $(this).data('seat');
			var index = plannerState.selectedSeats.indexOf(seat);
			if (index !== -1) {
				plannerState.selectedSeats.splice(index, 1);
			} else {
				if (plannerState.selectedSeats.length >= plannerState.passengerCount) {
					setAlert('Спочатку зменште кількість пасажирів або зніміть одне з уже обраних місць.', false);
					return;
				}
				plannerState.selectedSeats.push(seat);
			}
			clearAlert();
			renderSeatMap();
		});

		$(document).on('click', '.js-book-tour', function() {
			if (!authState.user) {
				var $trigger = $('.js-open-register').first();
				$trigger.attr('data-auth-mode', 'login').trigger('click').removeAttr('data-auth-mode');
				return;
			}
			var tourId = parseInt($(this).data('tour-id'), 10);
			var tour = toursCache.find(function(item) { return parseInt(item.id, 10) === tourId; });
			if (!tour) {
                return;
			}
			openPlanner(tour);
		});

		$modal.find('.js-close-planner').on('click', function() { closePlanner(); });
		$(document).on('keydown', function(event) { if (event.key === 'Escape' && $modal.hasClass('is-open')) { closePlanner(); } });

		$form.on('submit', function(event) {
			event.preventDefault();
			clearAlert();
			if (!plannerState.tour) { return; }
			if (plannerState.selectedSeats.length !== plannerState.passengerCount) {
				setAlert('Оберіть місце для кожного пасажира.', false);
				return;
			}
			var isSplitBooking = $split.is(':checked');
			var passengerNames = [];
			$form.find('.js-passenger-name').each(function() {
				if (!$(this).prop('disabled')) {
					passengerNames.push($.trim($(this).val()));
				}
			});
			if (passengerNames.some(function(name) { return !name; })) {
				setAlert(isSplitBooking ? 'Вкажіть своє імʼя для головного місця.' : 'Вкажіть імена всіх пасажирів.', false);
				return;
			}
			apiRequest('/api/bookings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'Accept': 'application/json' },
				body: formBody({
					tour_id: plannerState.tour.id,
					date_from: $date.val(),
					seats_reserved: plannerState.passengerCount,
					selected_seats: plannerState.selectedSeats.join(', '),
					passenger_manifest: passengerNames.join(', '),
					split_booking: isSplitBooking ? 'true' : 'false',
					notes: $.trim($notes.val())
				})
			}).then(function(data) {
				if (!data.ok) {
					setAlert(data.message || 'Не вдалося завершити бронювання.', false);
					return;
				}
				if (data.split_links && data.split_links.length) {
					var linksHtml = data.split_links.map(function(link) {
						return '<li><strong>Місце ' + escapeHtml(link.seat_code) + ':</strong> <a href="' + escapeHtml(link.url) + '" target="_blank" rel="noopener">' + escapeHtml(link.url) + '</a></li>';
					}).join('');
					setAlert('Бронювання створено. Посилання для попутників збережено у кабінеті.', true);
					$passengerFields.html('<div class="booking-planner__share"><strong>Безпечні посилання для пасажирів</strong><ul>' + linksHtml + '</ul></div>');
				} else {
					setAlert(data.message || 'Бронювання створено.', true);
				}
				toursCache = [];
				$('.booking-tour-meta, .booking-tour-action').remove();
				attachBookingButtons();
				document.dispatchEvent(new CustomEvent('travel-auth-updated', { detail: authState.user }));
				if (!(data.split_links && data.split_links.length)) {
					setTimeout(function() { closePlanner(); }, 900);
				}
			});
		});
	};
	bookingPlanner();

	var adminPage = function() {
		var $page = $('.js-admin-page');
		if (!$page.length) { return; }
		var $list = $('.js-admin-bookings');
		var $alert = $('.js-admin-alert');
		var $query = $('.js-admin-query');
		var $status = $('.js-admin-status-filter');
		var $analytics = $('.js-admin-analytics');

		var setAdminAlert = function(message, isSuccess) {
			$alert.text(message).toggleClass('is-success', !!isSuccess).prop('hidden', false);
		};

		var loadAdminBookings = function() {
			if (!authState.user) {
				$list.html('<div class="cabinet-empty"><h3>Потрібен вхід менеджера</h3><p>Увійдіть у менеджерський акаунт, щоб переглядати всі бронювання.</p><button type="button" class="btn btn-primary js-open-register" data-auth-mode="login">Увійти</button></div>');
				return;
			}
			if (!authState.user.is_admin) {
				$list.html('<div class="cabinet-empty"><h3>Недостатньо прав</h3><p>Ця сторінка доступна лише менеджеру або адміністратору.</p></div>');
				return;
			}
			var params = new URLSearchParams();
			if ($.trim($query.val())) { params.set('query', $.trim($query.val())); }
			if ($status.val()) { params.set('status', $status.val()); }
			apiRequest('/api/admin/bookings' + (params.toString() ? '?' + params.toString() : '')).then(function(data) {
				if (!data.ok) {
					$list.html('<div class="cabinet-empty"><h3>Не вдалося завантажити дані</h3><p>' + escapeHtml(data.message || 'Спробуйте оновити сторінку.') + '</p></div>');
					return;
				}
				var items = data.bookings || [];
				if (!items.length) {
					$list.html('<div class="cabinet-empty"><h3>Бронювань не знайдено</h3><p>Спробуйте змінити пошук або фільтр за статусом.</p></div>');
					return;
				}
				$list.html(items.map(function(item) {
					var passengerProgress = item.is_split_booking ? '<br><strong>Заповнено:</strong> ' + escapeHtml(item.passengers_completed || 0) + ' з ' + escapeHtml(item.seats_reserved || 0) : '';
					var splitLinks = (item.passenger_links || []).map(function(link) {
						return '<li><span>' + escapeHtml(link.seat_code || '-') + '</span><a href="' + escapeHtml(link.url) + '" target="_blank" rel="noopener">лінк</a><small>' + escapeHtml(link.full_name || 'очікує') + '</small></li>';
					}).join('');
					return '<article class="admin-booking">' +
					'<div class="admin-booking__head"><div><span class="booking-tour-pill">' + escapeHtml(item.booking_reference) + '</span><h3>' + escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.city + ', ' + item.country) + '</p></div>' +
					'<div class="admin-booking__status"><label>Статус</label><select class="form-control js-admin-status" data-booking-id="' + item.id + '">' +
					'<option value="Pending confirmation"' + (item.status === 'Pending confirmation' ? ' selected' : '') + '>Очікує підтвердження</option>' +
					'<option value="Partially filled"' + (item.status === 'Partially filled' ? ' selected' : '') + '>Частково заповнено</option>' +
					'<option value="Ready for processing"' + (item.status === 'Ready for processing' ? ' selected' : '') + '>Готово до обробки</option>' +
					'<option value="Confirmed"' + (item.status === 'Confirmed' ? ' selected' : '') + '>Підтверджено</option>' +
					'<option value="Awaiting payment"' + (item.status === 'Awaiting payment' ? ' selected' : '') + '>Очікує оплати</option>' +
					'<option value="Cancelled"' + (item.status === 'Cancelled' ? ' selected' : '') + '>Скасовано</option>' +
					'<option value="Completed"' + (item.status === 'Completed' ? ' selected' : '') + '>Завершено</option>' +
					'</select></div></div>' +
					'<div class="admin-booking__grid">' +
					'<div><strong>Клієнт:</strong> ' + escapeHtml(item.user_name || item.traveler_name) + '<br><strong>Email:</strong> ' + escapeHtml(item.user_email || item.traveler_email) + '<br><strong>Телефон:</strong> ' + escapeHtml(item.traveler_phone) + '</div>' +
					'<div><strong>Виїзд:</strong> ' + escapeHtml(formatDate(item.date_from)) + '<br><strong>Транспорт:</strong> ' + escapeHtml(item.transport) + '<br><strong>Місць:</strong> ' + escapeHtml(item.seats_reserved) + '</div>' +
					'<div><strong>Місця:</strong> ' + escapeHtml(item.selected_seats || 'не вибрано') + '<br><strong>Пасажири:</strong> ' + escapeHtml(item.passenger_manifest || item.traveler_name) + passengerProgress + '</div>' +
					'</div>' +
					(item.is_split_booking && splitLinks ? '<ul class="admin-booking__links">' + splitLinks + '</ul>' : '') +
					(item.notes ? '<p class="admin-booking__notes">Побажання: ' + escapeHtml(item.notes) + '</p>' : '') +
					'</article>';
				}).join(''));
			});
		};

		var loadAdminAnalytics = function() {
			if (!$analytics.length || !authState.user || !authState.user.is_admin) { return; }
			apiRequest('/api/admin/analytics').then(function(data) {
				if (!data.ok) {
					$analytics.html('');
					return;
				}
				var summary = data.summary || {};
				var routes = data.routes || [];
				var rows = routes.map(function(route) {
					var signalLabel = route.signal === 'deficit' ? 'Дефіцит' : (route.signal === 'discount' ? 'Потрібна дія' : 'Стабільно');
					return '<article class="admin-forecast admin-forecast--' + escapeHtml(route.signal) + '">' +
						'<div><span class="booking-tour-pill">' + escapeHtml(route.route_code) + '</span><h3>' + escapeHtml(route.title) + '</h3><p>' + escapeHtml(route.city + ', ' + route.country) + ' · ' + escapeHtml(formatDate(route.departure_date)) + '</p></div>' +
						'<div class="admin-forecast__meter"><span style="width:' + Math.min(100, Number(route.projected_load_percent || 0)) + '%"></span></div>' +
						'<div><strong>' + escapeHtml(signalLabel) + '</strong><p>' + escapeHtml(route.recommendation) + '</p></div>' +
						'<ul><li>Зараз: ' + escapeHtml(route.load_percent || 0) + '%</li><li>Прогноз: ' + escapeHtml(route.projected_load_percent || 0) + '%</li><li>Вільно: ' + escapeHtml(route.seats_available || 0) + '</li></ul>' +
					'</article>';
				}).join('');
				$analytics.html('<div class="admin-analytics__summary">' +
					'<div><span>Маршрутів</span><strong>' + escapeHtml(summary.routes_total || 0) + '</strong></div>' +
					'<div><span>Дефіцитні</span><strong>' + escapeHtml(summary.deficit_routes || 0) + '</strong></div>' +
					'<div><span>Потребують знижки</span><strong>' + escapeHtml(summary.discount_routes || 0) + '</strong></div>' +
					'<div><span>Середня завантаженість</span><strong>' + escapeHtml(summary.average_load_percent || 0) + '%</strong></div>' +
					'</div><div class="admin-analytics__routes">' + rows + '</div>');
			});
		};

		$('.js-admin-search').on('click', function() { loadAdminBookings(); });
		$(document).on('change', '.js-admin-status', function() {
			var bookingId = $(this).data('booking-id');
			var statusValue = $(this).val();
			apiRequest('/api/admin/bookings/' + bookingId + '/status', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'Accept': 'application/json' },
				body: formBody({ status: statusValue })
			}).then(function(data) {
				if (!data.ok) {
					setAdminAlert(data.message || 'Не вдалося оновити статус.', false);
					loadAdminBookings();
					return;
				}
				setAdminAlert(data.message || 'Статус оновлено.', true);
			});
		});

		document.addEventListener('travel-auth-updated', loadAdminBookings);
		document.addEventListener('travel-auth-updated', loadAdminAnalytics);
		loadAdminBookings();
		loadAdminAnalytics();
	};
	adminPage();
	var cabinetPage = function() {
		var $page = $('.js-cabinet-page');
		if (!$page.length) { return; }
		var $summary = $('.js-cabinet-summary');
		var $bookings = $('.js-cabinet-bookings');

		var renderGuest = function() {
			$summary.html('<div class="cabinet-empty"><h3>Увійдіть у свій акаунт</h3><p>Після входу тут з’являться ваші бронювання, контактні дані та історія поїздок.</p><button type="button" class="btn btn-primary js-open-register">Увійти або зареєструватися</button></div>');
			$bookings.html('');
		};

		var renderProfile = function(profileData, bookingsData) {
			var user = profileData.user;
			var stats = profileData.stats || {};
			var bookingItems = bookingsData.bookings || [];
			$summary.html(
				'<div class="cabinet-grid">' +
				'<div class="cabinet-card cabinet-card--profile"><span class="cabinet-label">Профіль</span><h3>' + escapeHtml(user.name) + '</h3><p><strong>Email:</strong> ' + escapeHtml(user.email) + '</p><p><strong>Телефон:</strong> ' + escapeHtml(user.phone || 'ще не вказано') + '</p><p><strong>Тип входу:</strong> ' + escapeHtml(user.provider === 'google' ? 'Google' : 'Email і пароль') + '</p><a href="#" class="cabinet-link js-logout">Вийти з акаунта</a></div>' +
				'<div class="cabinet-card"><span class="cabinet-label">Бронювання</span><h3>' + escapeHtml(stats.total_bookings || 0) + '</h3><p>Заявок у кабінеті: ' + escapeHtml(stats.total_bookings || 0) + '. Зарезервовано місць: ' + escapeHtml(stats.total_seats || 0) + '.</p></div>' +
				'<div class="cabinet-card"><span class="cabinet-label">Наступна поїздка</span><h3>' + escapeHtml(formatDate(stats.next_trip_date)) + '</h3><p>Найближча дата виїзду серед ваших активних бронювань.</p></div>' +
				'</div>'
			);

			if (!bookingItems.length) {
				$bookings.html('<div class="cabinet-empty"><h3>Бронювань поки немає</h3><p>Оберіть один із маршрутів на сторінці напрямків, і ваше бронювання одразу з’явиться тут.</p><a href="destination.html" class="btn btn-primary">Перейти до маршрутів</a></div>');
				return;
			}

			$bookings.html(bookingItems.map(function(item) {
				var passengerList = String(item.passenger_manifest || '')
					.split(',')
					.map(function(name) { return $.trim(name); })
					.filter(Boolean)
					.map(function(name) { return '<li>' + escapeHtml(name) + '</li>'; })
					.join('');
				var selectedSeats = String(item.selected_seats || '') || 'буде визначено менеджером';
				var totalPrice = (Number(item.price || 0) * Number(item.seats_reserved || 0)).toFixed(0);
				var splitLinks = (item.passenger_links || []).map(function(link) {
					return '<li><span>Місце ' + escapeHtml(link.seat_code || '-') + '</span><a href="' + escapeHtml(link.url) + '" target="_blank" rel="noopener">посилання</a>' + (link.full_name ? '<small>' + escapeHtml(link.full_name) + '</small>' : '<small>очікує дані</small>') + '</li>';
				}).join('');
				return '<article class="cabinet-booking">' +
				'<div class="cabinet-booking__media" style="background-image:url(images/' + escapeHtml(item.image) + ')"></div>' +
				'<div class="cabinet-booking__content">' +
				'<span class="cabinet-booking__status">' + escapeHtml(item.status) + '</span>' +
				'<h3>' + escapeHtml(item.title) + '</h3>' +
				'<p>' + escapeHtml(item.city + ', ' + item.country) + '</p>' +
				'<ul class="cabinet-booking__meta"><li>Маршрут: ' + escapeHtml(item.route_code) + '</li><li>Дата виїзду: ' + escapeHtml(formatDate(item.date_from)) + '</li><li>Місць: ' + escapeHtml(item.seats_reserved) + '</li><li>Транспорт: ' + escapeHtml(item.transport) + '</li><li>Відправлення: ' + escapeHtml(item.departure_city) + '</li><li>Місця: ' + escapeHtml(selectedSeats) + '</li><li>Сума: $' + escapeHtml(totalPrice) + '</li></ul>' +
				'<div class="cabinet-booking__traveler"><strong>Контактна особа:</strong> ' + escapeHtml(item.traveler_name) + '<br><strong>Email:</strong> ' + escapeHtml(item.traveler_email) + '<br><strong>Телефон:</strong> ' + escapeHtml(item.traveler_phone) + '<br><strong>Код бронювання:</strong> ' + escapeHtml(item.booking_reference) + '</div>' +
				(passengerList ? '<div class="cabinet-booking__traveler"><strong>Пасажири:</strong><ul class="cabinet-booking__passengers">' + passengerList + '</ul></div>' : '') +
				(item.is_split_booking && splitLinks ? '<div class="cabinet-booking__traveler"><strong>Захищені посилання:</strong><ul class="cabinet-booking__passenger-links">' + splitLinks + '</ul></div>' : '') +
				(item.notes ? '<p class="cabinet-booking__notes">Побажання: ' + escapeHtml(item.notes) + '</p>' : '') +
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

	var passengerVerificationPage = function() {
		var $page = $('.js-passenger-page');
		if (!$page.length) { return; }
		var $panel = $('.js-passenger-panel');
		var params = new URLSearchParams(window.location.search);
		var token = params.get('token') || '';

		var renderError = function(message) {
			$panel.html('<div class="cabinet-empty"><h3>Посилання недоступне</h3><p>' + escapeHtml(message || 'Перевірте адресу або попросіть замовника надіслати посилання ще раз.') + '</p></div>');
		};

		if (!token) {
			renderError('У посиланні немає токена пасажира.');
			return;
		}

		apiRequest('/api/passenger-verification/' + encodeURIComponent(token)).then(function(data) {
			if (!data.ok) {
				renderError(data.message);
				return;
			}
			var passenger = data.passenger || {};
			var completed = !!passenger.full_name;
			$panel.html('' +
				'<div class="passenger-verify__header">' +
				'<span class="booking-tour-pill">' + escapeHtml(passenger.booking_reference) + '</span>' +
				'<h1>' + escapeHtml(passenger.title) + '</h1>' +
				'<p>' + escapeHtml(passenger.city + ', ' + passenger.country) + ' · ' + escapeHtml(formatDate(passenger.date_from || passenger.departure_date)) + '</p>' +
				'</div>' +
				'<div class="passenger-verify__seat"><span>Ваше місце</span><strong>' + escapeHtml(passenger.seat_code || '-') + '</strong></div>' +
				'<form class="passenger-verify__form js-passenger-form" novalidate>' +
				'<div class="booking-modal__alert js-passenger-alert" hidden></div>' +
				'<div class="form-group"><label for="passenger-full-name">ПІБ пасажира</label><input id="passenger-full-name" name="full_name" type="text" class="form-control" value="' + escapeHtml(passenger.full_name || '') + '" placeholder="Наприклад: Петренко Іван Сергійович" required></div>' +
				'<div class="passenger-verify__meta"><div><strong>Маршрут:</strong> ' + escapeHtml(passenger.route_code) + '</div><div><strong>Транспорт:</strong> ' + escapeHtml(passenger.transport) + '</div><div><strong>Відправлення:</strong> ' + escapeHtml(passenger.departure_city) + '</div></div>' +
				'<button type="submit" class="btn btn-primary">' + (completed ? 'Оновити дані' : 'Зберегти дані') + '</button>' +
				'</form>');
		});

		$(document).on('submit', '.js-passenger-form', function(event) {
			event.preventDefault();
			var $form = $(this);
			var $alert = $form.find('.js-passenger-alert');
			$alert.prop('hidden', true).removeClass('is-success').text('');
			apiRequest('/api/passenger-verification/' + encodeURIComponent(token), {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'Accept': 'application/json' },
				body: formBody({ full_name: $.trim($form.find('[name="full_name"]').val()) })
			}).then(function(data) {
				$alert.text(data.message || (data.ok ? 'Дані збережено.' : 'Не вдалося зберегти дані.')).toggleClass('is-success', !!data.ok).prop('hidden', false);
			});
		});
	};
	passengerVerificationPage();

	fetchAuthStatus();
	attachBookingButtons();

})(jQuery);








