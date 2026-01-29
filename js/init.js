$.fn.DeeboProgressIsInViewport = function(content) {
	"use strict";
	return $(this).offset().top - content.outerHeight();
};
/*
 * Copyright (c) 2021 Frenify
 * Author: Frenify
 * This file is made for CURRENT TEMPLATE
*/


(function($){
  "use strict";
  
  
	var FrenifyDeebo = {

		init: function(){
			FrenifyDeebo.BgImg();
			FrenifyDeebo.imgToSVG();
			FrenifyDeebo.progress();
			FrenifyDeebo.resume();
			FrenifyDeebo.loadBlogPosts();
			FrenifyDeebo.modal();
			FrenifyDeebo.progress2();
			FrenifyDeebo.contactForm();
			FrenifyDeebo.toTopJumper();
			FrenifyDeebo.rating();
			FrenifyDeebo.isotope();
			FrenifyDeebo.portfolioFilter();
			FrenifyDeebo.magnific();
			FrenifyDeebo.anchor();
			FrenifyDeebo.darklight();
			FrenifyDeebo.loadFirebaseProfile();
		},

		loadFirebaseProfile: function(){
			if(typeof firebase === 'undefined'){
				return;
			}

			var slug = FrenifyDeebo.getSlugFromPath();
			if(!slug){
				return;
			}

			var firebaseConfig = {
				apiKey: "AIzaSyCiGeCQ3iy6mwNIe303tWBIB1Uduyss1y4",
				authDomain: "acme-b9b61.firebaseapp.com",
				databaseURL: "https://acme-b9b61-default-rtdb.firebaseio.com",
				projectId: "acme-b9b61",
				storageBucket: "acme-b9b61.appspot.com",
				messagingSenderId: "550286905719",
				appId: "1:550286905719:web:988d4c339c7e7fd23f1172",
				measurementId: "G-P8JM5MP1ZC"
			};

			if(!firebase.apps.length){
				firebase.initializeApp(firebaseConfig);
			}

var db = firebase.database();
var basePath = "projects/proj_72hJFm1Yto";
var collections = ['Negocios', 'vehiculoCargaChica', 'vehiculoParticular'];

var collectionPromises = collections.map(function(collection){
	var collectionRef = db.ref(basePath + "/data/" + collection);
	return collectionRef.once('value').then(function(snapshot){
		if(!snapshot.exists()){
			return null;
		}
		var match = null;
		snapshot.forEach(function(childSnapshot){
			if(match){
				return true;
			}
			var itemData = childSnapshot.val() || {};
			var slugMatch = false;
			if(typeof itemData.slug === 'string' || typeof itemData.slug === 'number'){
				slugMatch = String(itemData.slug) === slug;
			}else if(itemData.slug && typeof itemData.slug === 'object'){
				slugMatch = Object.prototype.hasOwnProperty.call(itemData.slug, slug);
			}else if(itemData.slugs && typeof itemData.slugs === 'object'){
				slugMatch = Object.prototype.hasOwnProperty.call(itemData.slugs, slug);
			}
			if(!slugMatch){
				return;
			}
			match = {
				collection: collection,
				itemData: itemData
			};
		});
		return match;
	});
});

Promise.all(collectionPromises)
	.then(function(results){
		var match = results.filter(Boolean)[0];
		if(!match){
			return null;
		}
		FrenifyDeebo.applyProfileData(match.collection, match.itemData);
		return null;
	})
	.catch(function(error){
		if(window.console && window.console.warn){
			window.console.warn('Firebase load failed', error);
		}
	});
		},

		getSlugFromPath: function(){
			var path = window.location.pathname || '';
			var cleaned = path.replace(/\/+$/,'').replace(/^\/+/,'');
			if(!cleaned || cleaned === 'index.html' || cleaned === 'index-light.html'){
				return '';
			}
			return cleaned;
		},

		applyProfileData: function(collection, data){
			var formattedDate = FrenifyDeebo.formatDate(data.fechaAfiliacion);
			var coordinates = '';
			if(data.latitude && data.longitude){
				coordinates = data.latitude + ', ' + data.longitude;
			}

			var quoteValue = collection === 'Negocios' ? data.descripcion : data.nombreVehiculo;
			var phoneValue = data.telefono || data.telefonoAfiliado || '';
			var avatarImage = collection === 'Negocios' ? data.imgRepresentante : data.imgAfiliado;
			var circleImage = collection === 'Negocios' ? data.imgNegocio : data.imgVehiculo;
			var addressValue = collection === 'Negocios' ? data.direccion : '';
			var entry = {
				name: data.nombreAfiliado || '',
				giro: data.Giro || '',
				business: data.nombreNegocio || '',
				vehicle: data.nombreVehiculo || '',
				folio: data.folio || '',
				address: addressValue || '',
				plate: data.placaVehiculo || '',
				coordinates: coordinates,
				joinDate: formattedDate,
				phone: phoneValue,
				quote: quoteValue || ''
			};

			FrenifyDeebo.setFieldValue('name', entry.name, true);
			FrenifyDeebo.setHeaderName(entry.name);
			FrenifyDeebo.setFieldValue('giro', entry.giro, collection === 'Negocios');
			FrenifyDeebo.setFieldValue('business', entry.business, collection === 'Negocios');
			FrenifyDeebo.setFieldValue('vehicle', entry.vehicle, collection !== 'Negocios');
			FrenifyDeebo.setFieldValue('folio', entry.folio, true);
			FrenifyDeebo.setFieldValue('address', entry.address, collection === 'Negocios');
			FrenifyDeebo.setFieldValue('plate', entry.plate, collection !== 'Negocios');
			FrenifyDeebo.setFieldValue('coordinates', entry.coordinates, true);
			FrenifyDeebo.setFieldValue('join-date', entry.joinDate, true);
			FrenifyDeebo.setFieldValue('phone', entry.phone, true, true);
			FrenifyDeebo.setQuoteField(entry.quote);
			FrenifyDeebo.setAddressLink(entry.address, entry.coordinates);
			FrenifyDeebo.setImageField('avatar-image', avatarImage);
			FrenifyDeebo.setImageField('circle-bg', circleImage, true);
			FrenifyDeebo.setImageField('circle-img', circleImage);
		},

		setHeaderName: function(value){
			var element = $('[data-field="header-name"]');
			if(!element.length){
				return;
			}
			var safeValue = value || '-';
			var parts = safeValue.trim().split(/\s+/);
			var firstName = parts.shift() || safeValue;
			var remainder = parts.join(' ');
			element.empty();
			element.append($('<span></span>').text(firstName));
			if(remainder){
				element.append(' ' + remainder);
			}
		},

		setFieldValue: function(field, value, showWhenEmpty, isPhone){
			var element = $('[data-field="' + field + '"]');
			if(!element.length){
				return;
			}
			var listItem = element.closest('li');
			if(!value && !showWhenEmpty){
				listItem.hide();
				return;
			}
			listItem.show();
			if(isPhone){
				element.text(value || '-');
				if(value){
					element.attr('href', 'tel:' + value.replace(/\s+/g,''));
				}
				return;
			}
			element.text(value || '-');
		},

		setQuoteField: function(value){
			var element = $('[data-field="quote"]');
			if(!element.length || !value){
				return;
			}
			element.text(value);
		},

		setAddressLink: function(address, coordinates){
			var element = $('[data-field="address-link"]');
			if(!element.length){
				return;
			}
			var listItem = element.closest('li');
			var hasAddress = Boolean(address);
			var hasCoordinates = Boolean(coordinates);
			if(!hasAddress){
				listItem.hide();
				return;
			}
			listItem.show();
			if(hasAddress){
				element.text(address);
			}
			if(hasCoordinates){
				var mapUrl = 'https://www.google.com/maps?q=' + encodeURIComponent(coordinates);
				element.attr({
					href: mapUrl,
					target: '_blank',
					rel: 'noopener'
				});
			}else{
				element.removeAttr('href');
				element.removeAttr('target');
				element.removeAttr('rel');
			}
		},

		setImageField: function(field, value, useAsBackground){
			if(!value){
				return;
			}
			var elements = $('[data-field="' + field + '"]');
			if(!elements.length){
				return;
			}
			elements.each(function(){
				var element = $(this);
				if(useAsBackground){
					element.attr('data-bg-img', value);
					element.css({backgroundImage:'url(' + value + ')'});
					return;
				}
				if(element.is('img')){
					element.attr('src', value);
					return;
				}
				element.attr('data-bg-img', value);
				element.css({backgroundImage:'url(' + value + ')'});
			});
		},

		formatDate: function(timestamp){
			if(!timestamp){
				return '';
			}
			var date = new Date(Number(timestamp));
			if(Number.isNaN(date.getTime())){
				return '';
			}
			var formatted = new Intl.DateTimeFormat('es-MX', {
				month: 'long',
				day: 'numeric',
				year: 'numeric'
			}).format(date);
			return formatted.charAt(0).toUpperCase() + formatted.slice(1);
		},
		
		darklight: function(){
			$('.deebo_fn_switcher_wrap input').on('change',function(){
				var checkBox = $(this);
				if(checkBox.is(':checked')){
					setTimeout(function(){
						window.open('index.html', "_self");
					},500);
				}else{
					setTimeout(function(){
						window.open('index-light.html', "_self");
					},500);
				}
				return false;
			});
		},
		
		anchor: function(){

			$('.anchor').on('click',function(){
				var selector = '.cv__content';
				if($(window).width() <= 1040){
					selector = 'body,html';
				}
				if($.attr(this, 'href') !== '#'){
					$(selector).animate({
						scrollTop: $($.attr(this, 'href')).offset().top
					}, 800);
				}

				return false;
			});	
		},
		
		magnific: function(){
			$('.popup-image').magnificPopup({
				type: 'image',
				removalDelay: 300,
				mainClass: 'mfp-fade'
			});

			$('.gallery_zoom').each(function() { // the containers for all your galleries
				$(this).magnificPopup({
					delegate: 'a.zoom', // the selector for gallery item
					type: 'image',
					gallery: {
					  enabled:true
					},
					removalDelay: 300,
					mainClass: 'mfp-fade'
				});

			});
			$('.popup-youtube, .popup-vimeo').each(function() { // the containers for all your galleries
				$(this).magnificPopup({
					disableOn: 700,
					type: 'iframe',
					mainClass: 'mfp-fade',
					removalDelay: 160,
					preloader: false,
					fixedContentPos: false
				});
			});

			$('.soundcloude_link').magnificPopup({
			  type : 'image',
			   gallery: {
				   enabled: true, 
			   },
			});	
		},
		
		portfolioFilter: function(){
			var filter		 = $('.fn_cs_portfolio .portfolio_filter ul');

			if(filter.length){
				// Isotope Filter 
				filter.find('a').on('click', function(){
					var element		= $(this);
					var selector 	= element.attr('data-filter');
					var list		= element.closest('.fn_cs_portfolio').find('.portfolio_list').children('ul');
					list.isotope({ 
						filter				: selector,
						animationOptions	: {
							duration			: 750,
							easing				: 'linear',
							queue				: false
						}
					});

					filter.find('a').removeClass('current');
					element.addClass('current');
					return false;
				});	
			}	
		},
		
		isotope: function(){
			$('.grid').masonry({
				itemSelector: '.grid-item',
			});	
		},
		
		
		rating: function(){
			$('.t_rating').each(function(){
				var e 		= $(this),
					stars 	= parseFloat(e.data('stars'));
				var a	= stars * 20;
				var b 	= 100 - a;
				e.find('.rating_regular').css({width: b + '%'});
				e.find('.rating_active').css({width: a + '%'});
			});
		},
		
		
		toTopJumper: function(){
			var totop		= $('.deebo_fn_totop');
			if(totop.length){
				totop.on('click', function(e) {
					e.preventDefault();		
					$("html, body").animate(
						{ scrollTop: 0 }, 'slow');
					return false;
				});
			}
		},
		
		
		fixedTotopScroll: function(){
			var totop			= $('.deebo_fn_totop');
			var height 			= 100;
			if(totop.length){
				if($('.cv__content').scrollTop() > height){
					totop.addClass('scrolled');
				}else{
					totop.removeClass('scrolled');
				}
			}
		},
		
		contactForm: function(){
			$('#send_message').on('click', function(){
				var form		= $('.section_contact .contact_form');
				var name 		= $("#name").val();
				var email 		= $("#email").val();
				var message 	= $("#message").val();
				var phone 		= $("#phone").val();
				var spanSuccess	= form.find(".success");
				var success     = spanSuccess.data('success');
				var emailto     = form.data('email');

				spanSuccess.empty();
				if(name === ''|| email === ''|| message === '' || emailto === '' || phone === ''){
					$('.empty_notice').slideDown(500).delay(2000).slideUp(500);
				}
				else{
					$.post(
						"modal/contact.php",
						{
							ajax_name: 		name,
							ajax_email: 	email,
							ajax_emailto: 	emailto,
							ajax_message: 	message,
							ajax_phone: 	phone
						}, function(data) {
							spanSuccess.append(data);
							if(spanSuccess.find(".contact_error").length){
								spanSuccess.slideDown(500).delay(2000).slideUp(500);		
							}else{
								spanSuccess.append("<span class='contact_success'>" + success + "</span>");
								spanSuccess.slideDown(500).delay(4000).slideUp(500);
							}
							if(data === ''){ form[0].reset();}
						}
					);
				}
				return false; 
			});
		},
		
		
		progress2: function(){
			$('.fn_cs_progress_bar').each(function() {
				var pWrap 	= $(this);
				pWrap.waypoint({handler: function(){FrenifyDeebo.progress2F(pWrap);},offset:'90%'});
			});
		},
		
		progress2F: function(container){
			container.find('.progress_item').each(function(i) {
				var progress 	= $(this);
				var pValue 		= parseInt(progress.data('value'));
				var percent 	= progress.find('.progress_percent');
				var pBar 		= progress.find('.progress_bg');
				pBar.css({width:pValue+'%'});
				setTimeout(function(){
					progress.addClass('open');
					percent.html(pValue+'%').css({right:(100 - pValue)+ '%'});
				},(i*500));
			});	
		},
		modal: function(){
			var self		= this;
			var modalBox	= $('.deebo_fn_modalbox');
			var item		= $('.modal_item');
			var closePopup	= modalBox.find('.closer,.extra_closer');
			var prevNext	= modalBox.find('.fn__nav');
			var extraCloser = modalBox.find('.extra_closer');
			extraCloser.on('mouseenter',function(){
				modalBox.addClass('hovered');
			}).on('mouseleave',function(){
				modalBox.removeClass('hovered');
			});
			item.on('click',function(){
				var element		= $(this);
				var content 	= element.find('.fn__hidden').html();
				
				
				var items		= element.closest('.modal_items'),
					index		= element.attr('data-index'),
					from		= items.attr('data-from');
				prevNext.attr('data-index',index);
				prevNext.attr('data-from',from);
				
				
				$('body').addClass('modal');
				modalBox.addClass('opened');
				modalBox.find('.modal_in').html(content);
				
				self.modal_prevnext(prevNext,modalBox);
				self.imgToSVG();
				self.BgImg();
				
				return false;
			});
			self.modal_prevnext(prevNext,modalBox);
			closePopup.on('click',function(){
				modalBox.removeClass('opened hovered');
				modalBox.find('.modal_in').html('');
				$('body').removeClass('modal');
				return false;
			});
		},
		
		modal_prevnext: function(prevNext,modalBox){
			var self		= this;
			prevNext.find('a').off().on('click',function(){
				var e		= $(this);
				var from 	= prevNext.attr('data-from');
				var index	= parseInt(prevNext.attr('data-index'));
				var itemss	= $('.modal_items[data-from="'+from+'"]');
				var count	= parseInt(itemss.attr('data-count'));
				if(e.hasClass('prev')){
					index--;
				}else{
					index++;
				}
				if(index < 1){index = count;}
				if(index > count){index = 1;}
				
				var content = itemss.find('.modal_item[data-index="'+index+'"] .fn__hidden').html();
				prevNext.removeClass('disabled');
				prevNext.attr('data-index',index);
				
				setTimeout(function(){
					modalBox.find('.modal_in').fadeOut(500, function() {
						$(this).html('').html(content).fadeIn(500);
					});
				},500);
					
				$(".deebo_fn_modalbox .modal_content").stop().animate({scrollTop:0}, 500, 'swing');
				
				self.modal_prevnext(prevNext,modalBox);
				self.imgToSVG();
				self.BgImg();
				return false;
			});
		},
		
		loadBlogPosts: function(){
			$('.section_tips .load_more a').on('mousedown',function(){
				var element 	= $(this);
				var text 		= element.find('.text');
				// stop function if don't have more items
				if(element.hasClass('done')){
					element.addClass('hold');
					text.text(element.attr('data-no'));
					return false;
				}
			}).on('mouseup',function(){
				var element 	= $(this);
				var text 		= element.find('.text');
				// stop function if don't have more items
				if(element.hasClass('done')){
					element.removeClass('hold');
					text.text(element.attr('data-done'));
					return false;
				}
			}).on('mouseleave',function(){
				var element 	= $(this);
				var text 		= element.find('.text');
				// stop function if don't have more items
				if(element.hasClass('done')){
					element.removeClass('hold');
					text.text(element.attr('data-done'));
					return false;
				}
			});
			$('.section_tips .load_more a').on('click',function(){
				var element 	= $(this);
				var text 		= element.find('.text');
				
				// stop function if elements are loading right now
				if(element.hasClass('loading') || element.hasClass('done')){return false;}
				element.addClass('loading');
				
				
				
				
				setTimeout(function(){
					var listItem = element.closest('.section_tips').find('.be_animated');
					listItem.each(function(i, e){
						setTimeout(function(){
							$(e).addClass('fadeInTop done');
						}, (i*100));	
					});
					element.addClass('done').removeClass('loading');
					text.text(element.attr('data-done'));
				},1500);
				
				
				return false;
			});
		},
		
		resume: function(){
			$('.deebo_fn__cv .cv__content').scrollTop(0);
			$('body').addClass('resume-opened');
		},
		
		progress: function(){
			var content = $('.deebo_fn__cv .cv__content');
			if($(window).width() <= 768){
				content = $('.deebo_fn__cv');
			}
			content.on('resize scroll', function() {
				if ($('.deebo_fn__cv .fn_cs_progress_bar').DeeboProgressIsInViewport(content) < 0) {
					FrenifyDeebo.progressF($('.deebo_fn__cv .fn_cs_progress_bar'));
				}
			});
		},
		
		progressF: function(container){
			container.find('.progress_item').each(function(i) {
				var progress 	= $(this);
				var pValue 		= parseInt(progress.data('value'));
				var percent 	= progress.find('.progress_percent');
				var pBar 		= progress.find('.progress_bg');
				pBar.css({width:pValue+'%'});
				setTimeout(function(){
					progress.addClass('open');
					percent.html(pValue+'%').css({right:(100 - pValue)+ '%'});
				},(i*500));
			});	
		},
		
		recallProgress: function(){
			var tabs = $('.fn_cs_progress_bar');
			tabs.find('.progress_bg').css({width:'0%'});
			tabs.find('.progress_percent').html('').css({right:'100%'});
			tabs.find('.progress_item').removeClass('open');
		},
		
		imgToSVG: function(){
			$('img.fn__svg').each(function(){
				var img 		= $(this);
				var imgClass	= img.attr('class');
				var imgURL		= img.attr('src');

				$.get(imgURL, function(data) {
					var svg 	= $(data).find('svg');
					if(typeof imgClass !== 'undefined') {
						svg 	= svg.attr('class', imgClass+' replaced-svg');
					}
					img.replaceWith(svg);

				}, 'xml');

			});	
		},

	  	BgImg: function(){
			var div = $('*[data-bg-img]');
			div.each(function(){
				var element = $(this);
				var attrBg	= element.attr('data-bg-img');
				var dataBg	= element.data('bg-img');
				if(typeof(attrBg) !== 'undefined'){
					element.css({backgroundImage:'url('+dataBg+')'});
				}
			});
		},
    
  	};
  	
	
	// READY Functions
	$(document).ready(function(){FrenifyDeebo.init();});
	
	// RESIZE Functions
	$(window).on('resize',function(){
		FrenifyDeebo.isotope();
		setTimeout(function(){
			FrenifyDeebo.isotope();
		},1010);
	});
	
	// LOAD Functions
	$(window).on('load',function(){
		
		setTimeout(function(){
			
		},10);
	});
	
	// SCROLL Functions
	$('.cv__content').on('scroll',function(){
		FrenifyDeebo.fixedTotopScroll();
	});
  	
})(jQuery);
