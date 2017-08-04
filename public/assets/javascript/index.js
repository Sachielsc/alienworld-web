$(document).ready(function(){

	$('#preloader').fadeOut(2000, function(){$(this).remove();});

    var navHeight = 200;

    $(window).on('scroll',function(){

	    scrollposition = Math.round($(window).scrollTop());
	    if (scrollposition > navHeight) {
	        $('.aw-header').addClass('hidethis');
	        $('nav').addClass('hidethis');
	    } else {
	        $('.aw-header').removeClass('hidethis');
	        $('nav').removeClass('hidethis');
	   }
	});
});
