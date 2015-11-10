/*
    Name: Dakota Miller
    Class: INFO 200
    Description: Javascript for "Connect"
*/


"use strict";

$(document).ready(function() {

	$(".dropdown-menu a").click(function(event) {
		console.log(event);
		//$("body")
	});

	$("#work-button").click(function() {
		$(this).css("display","none");
		$("#work-options").css("display","block");
	});

	// $("#hire-button").click(function() {
	// 	$(this).css("display","none");
	// 	$("#hire-options").css("display","block");
	// });


});