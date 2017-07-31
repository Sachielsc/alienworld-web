$(document).ready(function(){
    $("span").click(function(){
        $(this).hide();
    });

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
