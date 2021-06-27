/** @format */

//GOOGLE MAPS API
var pathArray = window.location.pathname.split("/");
var lat = parseFloat(pathArray[4]);
var lon = parseFloat(pathArray[3]);

let map;

function initMap() {
  var coordinates = { lat: lat, lng: lon };
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 16,
    center: coordinates,
  });
  new google.maps.Marker({
    position: coordinates,
    map,
    title: "Hello World!",
  });
}
console.log("from GMAPS");

///////END GOOGLE MAPS

//Start JQUERY
$(document).ready(function () {
  console.log("ready");

  //mobile-menu

  //open/close button
  $("#open-nav-btn").click(() => {
    $("#close-nav-btn").show();
    $("#open-nav-btn").hide();
    $(".mobile-navbar").css({ height: "100vh" });
    $(".logo, .search-form, .login").toggle();
    $(".search-form").addClass("mobile-nav-active");
  });

  $("#close-nav-btn").click(() => {
    $("#close-nav-btn").hide();
    $("#open-nav-btn").show();
    $(".mobile-navbar").css({ height: "80px" });
    $(".logo, .search-form, .login").toggle();
    $(".search-form").removeClass("mobile-nav-active");
  });

  //single-details tabs

  $("#generalTab").click(() => {
    $(".single-desc").hide();
    $(".general-info, #map").removeClass("inactive");
    $("#descriptionTab").removeClass("tab-active");
    $("#generalTab").addClass("tab-active");
  });
  $("#descriptionTab").click(() => {
    $(".single-desc").show();
    $(".single-desc").addClass("active");
    $(".general-info, #map").addClass("inactive");
    $("#descriptionTab").addClass("tab-active");
    $("#generalTab").removeClass("tab-active");
  });

  //end single-details tabs

  var maxLength = 300;

  $(".ticket-text").each(function () {
    var words = $(this).text();
    var maxWords = 300;

    if (words.length > maxWords) {
      html =
        words.slice(0, maxWords) +
        '<span class="more_text" style="display:none;"> ' +
        words.slice(maxWords, words.length) +
        "</span>" +
        '<a href="#" class="read_more">...<br/>[Read More]</a>';

      $(this).html(html);

      $(this)
        .find("a.read_more")
        .click(function (event) {
          $(this).toggleClass("less");
          event.preventDefault();
          if ($(this).hasClass("less")) {
            $(this).html("<br/>[Read Less]");
            $(this).parent().find(".more_text").show();
          } else {
            $(this).html("...<br/>[Read More]");
            $(this).parent().find(".more_text").hide();
          }
        });
    }
  });

  //END READ MORE

  //PAGINATION
  var a = document.querySelectorAll(".main-result-card");
  let els = Array.from(a);
  let perPage = 10;
  // console.log(els);

  function paginator(els, perPage) {
    if (perPage < 1 || !els) return () => [];

    return function (page) {
      const basePage = page * perPage;

      return page < 0 || basePage >= els.length
        ? []
        : els.slice(basePage, basePage + perPage);
    };
  }

  const paginate = paginator(els, 9);

  var firstPage = paginate(0); // [ 0-8 ]
  var secondPage = paginate(1); // [ 9-18 ]
  var thirdPage = paginate(2); // [ 19-38 ]
  var fourthPage = paginate(3); // [ 39-48 ]

  $(".results").html(firstPage);
  $("#first-page").click(() => {
    $("#first-page").addClass("active-pagination");
    $("#first-page").prop("disabled", true);
    $("#third-page, #second-page, #fourth-page").prop("disabled", false);
    $("#second-page, #third-page, #fourth-page").removeClass(
      "active-pagination"
    );
    $(".results").html(firstPage);
    $(window).scrollTop(0);
  });
  $("#second-page").click(() => {
    $("#second-page").addClass("active-pagination");
    $("#second-page").prop("disabled", true);
    $("#first-page, #third-page, #fourth-page").prop("disabled", false);
    $("#first-page, #third-page, #fourth-page").removeClass(
      "active-pagination"
    );
    $(".results").html(secondPage);
    $(window).scrollTop(0);
  });
  $("#third-page").click(() => {
    $("#third-page").addClass("active-pagination");
    $("#third-page").prop("disabled", true);
    $("#first-page, #second-page, #fourth-page").prop("disabled", false);
    $("#first-page, #second-page, #fourth-page").removeClass(
      "active-pagination"
    );
    $(".results").html(thirdPage);
    $(window).scrollTop(0);
  });
  $("#fourth-page").click(() => {
    $("#fourth-page").addClass("active-pagination");
    $("#fourth-page").prop("disabled", true);
    $("#first-page, #second-page, #third_page").prop("disabled", false);
    $("#first-page, #second-page, #third-page").removeClass(
      "active-pagination"
    );
    $(".results").html(fourthPage);
    $(window).scrollTop(0);
  });

  // new Paginator('#pager');

  //END PAGINATION
});
