$(document).ready(function(){

	$('#preloader').fadeOut(2000, function(){$(this).remove();});

    var navHeight = 200;

    $(window).on('scroll',function(){

	    scrollposition = Math.round($(window).scrollTop());
	    if (scrollposition > navHeight) {
	        $('.aw-header').fadeOut(500, function(){$(this).hide();});
	    } else {
	        $('.aw-header').fadeIn(500, function(){$(this).show();});
	   }
	});
});
