AOS.init({
 	duration: 800,
 	easing: 'slide'
});

(function($) {

	"use strict";

	var isMobile = {
		Android: function() { return navigator.userAgent.match(/Android/i); },
		BlackBerry: function() { return navigator.userAgent.match(/BlackBerry/i); },
		iOS: function() { return navigator.userAgent.match(/iPhone|iPad|iPod/i); },
		Opera: function() { return navigator.userAgent.match(/Opera Mini/i); },
		Windows: function() { return navigator.userAgent.match(/IEMobile/i); },
		any: function() { return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows()); }
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
				var comma_separator_number_step = $.animateNumber.numberStepFactories.separator(',');
				$('.number').each(function(){
					var $this = $(this), num = $this.data('number');
					$this.animateNumber({ number: num, numberStep: comma_separator_number_step }, 7000);
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
		$('.smoothscroll[href^="#"], #ftco-nav ul li a[href^="#"]').on('click', function(e) {
			e.preventDefault();
			var hash = this.hash;
			var navToggler = $('.navbar-toggler');
			if (!hash || !$(hash).length) { return; }
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

	var registrationModal = function() {
		var $modal = $('#register-modal');
		if (!$modal.length) { return; }

		var storageKey = 'travelAgencyUsers';
		var sessionKey = 'travelAgencySession';
		var $body = $('body');
		var $ctaLinks = $('.js-open-register');
		var $tabs = $modal.find('.js-auth-tab');
		var $form = $modal.find('.js-auth-form');
		var $alert = $modal.find('.js-auth-alert');
		var $submit = $modal.find('.js-auth-submit');
		var $hint = $modal.find('.js-auth-hint');
		var $mode = $form.find('[name="mode"]');
		var $registerOnlyFields = $modal.find('.js-auth-field[data-auth-only="register"]');
		var registerHint = 'Після реєстрації ми збережемо ваш профіль локально до підключення бази даних.';
		var loginHint = 'Якщо акаунт уже існує, увійдіть з email і паролем, щоб продовжити бронювання.';

		var readUsers = function() {
			try {
				return JSON.parse(window.localStorage.getItem(storageKey)) || [];
			} catch (error) {
				return [];
			}
		};

		var saveUsers = function(users) {
			window.localStorage.setItem(storageKey, JSON.stringify(users));
		};

		var readSession = function() {
			try {
				return JSON.parse(window.localStorage.getItem(sessionKey));
			} catch (error) {
				return null;
			}
		};

		var saveSession = function(user) {
			window.localStorage.setItem(sessionKey, JSON.stringify({
				name: user.name,
				email: user.email,
				provider: user.provider || 'local',
				loggedInAt: new Date().toISOString()
			}));
		};

		var setAlert = function(message, isSuccess) {
			$alert.text(message).toggleClass('is-success', !!isSuccess).prop('hidden', false);
		};

		var clearAlert = function() {
			$alert.prop('hidden', true).removeClass('is-success').text('');
		};

		var updateCta = function() {
			var session = readSession();
			if (session && session.name) {
				$ctaLinks.text('Кабінет: ' + session.name.split(' ')[0]);
			} else {
				$ctaLinks.text('Забронювати зараз');
			}
		};

		var setMode = function(mode) {
			var isRegister = mode === 'register';
			$mode.val(mode);
			$tabs.removeClass('is-active');
			$tabs.filter('[data-auth-mode="' + mode + '"]').addClass('is-active');
			$modal.attr('data-auth-mode', mode);
			$registerOnlyFields.toggleClass('is-hidden', !isRegister);
			$form.find('[name="name"], [name="phone"], [name="passwordConfirm"], [name="policy"]').prop('required', isRegister);
			$submit.text(isRegister ? 'Створити акаунт' : 'Увійти в акаунт');
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

		var findUserByEmail = function(email) {
			var normalized = email.toLowerCase();
			return readUsers().find(function(user) { return user.email.toLowerCase() === normalized; });
		};

		var createGoogleUser = function(email) {
			var users = readUsers();
			var existing = users.find(function(user) { return user.email.toLowerCase() === email.toLowerCase(); });
			if (existing) {
				saveSession(existing);
				updateCta();
				setAlert('Вхід через Google виконано. Раді бачити вас знову.', true);
				setTimeout(closeModal, 1200);
				return;
			}

			var displayName = email.split('@')[0].replace(/[._-]+/g, ' ');
			displayName = displayName.replace(/\b\w/g, function(char) { return char.toUpperCase(); });
			var user = {
				name: displayName,
				email: email,
				phone: '',
				password: '',
				provider: 'google',
				createdAt: new Date().toISOString()
			};
			users.push(user);
			saveUsers(users);
			saveSession(user);
			updateCta();
			setAlert('Google-акаунт додано. Після підключення бекенду сюди можна підв’язати справжню OAuth-авторизацію.', true);
			setTimeout(closeModal, 1500);
		};

		$ctaLinks.on('click', function(event) {
			event.preventDefault();
			openModal('register');
		});

		$modal.find('.js-close-register').on('click', function() {
			closeModal();
		});

		$tabs.on('click', function() {
			setMode($(this).data('auth-mode'));
		});

		$modal.find('.js-google-auth').on('click', function() {
			clearAlert();
			var googleEmail = window.prompt('Введіть ваш Google email для демо-входу:', 'traveler@gmail.com');
			if (!googleEmail) { return; }
			var normalizedEmail = $.trim(googleEmail).toLowerCase();
			var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailPattern.test(normalizedEmail)) {
				setAlert('Вкажіть коректний email для входу через Google.', false);
				return;
			}
			createGoogleUser(normalizedEmail);
		});

		$(document).on('keydown', function(event) {
			if (event.key === 'Escape' && $modal.hasClass('is-open')) {
				closeModal();
			}
		});

		$form.on('submit', function(event) {
			event.preventDefault();
			clearAlert();

			var mode = $mode.val();
			var name = $.trim($form.find('[name="name"]').val());
			var phone = $.trim($form.find('[name="phone"]').val());
			var email = $.trim($form.find('[name="email"]').val()).toLowerCase();
			var password = $form.find('[name="password"]').val();
			var passwordConfirm = $form.find('[name="passwordConfirm"]').val();
			var acceptedPolicy = $form.find('[name="policy"]').is(':checked');
			var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

			if (!email || !password) {
				setAlert('Вкажіть email і пароль, щоб продовжити.', false);
				return;
			}

			if (!emailPattern.test(email)) {
				setAlert('Введіть коректний email.', false);
				return;
			}

			if (mode === 'register') {
				if (!name || !phone || !passwordConfirm) {
					setAlert('Будь ласка, заповніть усі поля для реєстрації.', false);
					return;
				}
				if (password.length < 6) {
					setAlert('Пароль має містити щонайменше 6 символів.', false);
					return;
				}
				if (password !== passwordConfirm) {
					setAlert('Паролі не співпадають. Перевірте введені дані.', false);
					return;
				}
				if (!acceptedPolicy) {
					setAlert('Потрібно погодитися на обробку персональних даних.', false);
					return;
				}
				if (findUserByEmail(email)) {
					setAlert('Акаунт з таким email уже існує. Перейдіть у вкладку "Вхід".', false);
					return;
				}

				var users = readUsers();
				var user = {
					name: name,
					phone: phone,
					email: email,
					password: password,
					provider: 'local',
					createdAt: new Date().toISOString()
				};
				users.push(user);
				saveUsers(users);
				saveSession(user);
				$form[0].reset();
				updateCta();
				setAlert('Акаунт створено. Тепер ви можете переходити до бронювання.', true);
				setTimeout(closeModal, 1300);
				return;
			}

			var existingUser = findUserByEmail(email);
			if (!existingUser) {
				setAlert('Користувача з таким email не знайдено. Спершу зареєструйтеся.', false);
				return;
			}
			if (existingUser.provider === 'google') {
				setAlert('Для цього акаунта використайте кнопку "Продовжити з Google".', false);
				return;
			}
			if (existingUser.password !== password) {
				setAlert('Неправильний пароль. Спробуйте ще раз.', false);
				return;
			}

			saveSession(existingUser);
			$form[0].reset();
			updateCta();
			setAlert('Вхід виконано успішно. Раді бачити вас знову.', true);
			setTimeout(closeModal, 1200);
		});

		updateCta();
		setMode('register');
	};
	registrationModal();

	var contactForm = function() {
		var $form = $('.js-contact-form');
		if (!$form.length) { return; }
		var $alert = $form.find('.js-contact-alert');
		var storageKey = 'travelAgencyContactMessages';
		var showAlert = function(message, isSuccess) { $alert.text(message).toggleClass('is-success', !!isSuccess).prop('hidden', false); };

		$form.on('submit', function(event) {
			event.preventDefault();
			$alert.prop('hidden', true).removeClass('is-success').text('');
			var form = event.currentTarget;
			var payload = {
				name: $.trim($(form).find('[name="name"]').val()),
				email: $.trim($(form).find('[name="email"]').val()),
				subject: $.trim($(form).find('[name="subject"]').val()),
				message: $.trim($(form).find('[name="message"]').val()),
				createdAt: new Date().toISOString()
			};
			if (!payload.name || !payload.email || !payload.subject || !payload.message) { showAlert('Будь ласка, заповніть усі поля форми зворотного зв’язку.', false); return; }
			var messages = [];
			try { messages = JSON.parse(window.localStorage.getItem(storageKey)) || []; } catch (error) { messages = []; }
			messages.push(payload);
			window.localStorage.setItem(storageKey, JSON.stringify(messages));
			form.reset();
			showAlert('Ваше повідомлення збережено. Після підключення бази даних воно автоматично надсилатиметься менеджеру.', true);
		});
	};
	contactForm();

})(jQuery);