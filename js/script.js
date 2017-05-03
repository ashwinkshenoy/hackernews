
// =========================
// ashwinkshenoy@gmail.com
// Developed using pure Javascript/Jquery!
// =========================

// pushData function (to HTML)
var pushData = function(news, number){
	var newsData = document.getElementById('newsList');
	news = news.slice(0,10);
	var newsLength = news.length;
	// console.log(newsLength);
	newsData.innerHTML = "";
	var count = number + 1;
	$('.pagination li').removeClass('active');
	$('.pagination li:first-child').addClass('active');
	for(var i=0; i<newsLength; i++) {
		// Get url and split to get host
		var pathUrl = news[i].url.split( '/' );
		var host = pathUrl[2];

		// HTML Content
		var li = '<li value="'+count+'" data-id="'+news[i].id+'">'+
								'<table>'+
									'<tbody>'+
										'<tr>'+
											'<td>'+
												'<a href="#" class="upvote"><i class="fa fa-caret-up" aria-hidden="true"></i></a>'+
											'</td>'+
											'<td>'+
												'<a href="'+news[i].url+'" target="_blank">'+
													'<div class="hd2">'+
														news[i].title+
														'<small> ('+host+')</small>'+
													'</div>'+
												'</a>'+
											'</td>'+
										'</tr>'+
									'</tbody>'+
								'</table>'+
								'<ul class="news-details">'+
									'<li>'+news[i].num_points+' Point(s)</li>'+
									'<li>by '+news[i].author+'</li>'+
									'<li>'+news[i].created_at+'</li>'+
									'<li>'+news[i].num_comments+' Comment(s)</li>'+
								'</ul><!--news-details end-->'+
							'</li>'
		newsData.innerHTML = newsData.innerHTML + li;
		count++;
	}
}
// pushData function end



// Pagination
// Pagination click function
var page = function(number){
	var newsData = document.getElementById('newsList');
	newsData.innerHTML = "";
	var news = JSON.parse(sessionStorage.getItem('news'));
	news = news.slice(number*10,100);
	var count = number*10;
	pushData(news, count);
	var pageData = document.getElementById('pagination');
	pageData.querySelector('.active').classList.remove("active");
}
// Pagination initialization
var pushPagination = function(news) {
	var pageData = document.getElementById('pagination');
	pageData.innerHTML = "";
	var newsLength = news.length;
	pageLength = newsLength/10;
	pageLength = Math.round(pageLength);
	for(i=0; i<pageLength; i++) {
		if(i == 0) {
			var li = '<li class="active"><a onClick="page('+i+')">'+(i+1)+'</a></li>';
		} else {
			var li = '<li><a onClick="page('+i+')">'+(i+1)+'</a></li>';
		}
		pageData.innerHTML = pageData.innerHTML + li;
	}
	// Pagination active class
	$('.pagination li').click(function(){
		$(this).addClass('active');
	});
}
// Pagination end



// Sorting
var sort_by = function(field, reverse, primer){
	var key = primer ?
		function(x) {return primer(x[field])} :
		function(x) {return x[field]};
	reverse = !reverse ? 1 : -1;
	return function (a, b) {
		return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
	}
}
// Sort based on points
var sortPoints = function(order){
	document.getElementById('loader').style.display = 'block';
	var news = JSON.parse(sessionStorage.getItem('news'));
	if(order == 1) { // Ascending Order
		news = news.sort(sort_by('num_points', true, parseInt));
	} else if(order == 0){ // Descending Order
		news = news.sort(sort_by('num_points', false, parseInt));
	}
	sessionStorage.setItem('news', JSON.stringify(news));
	news = JSON.parse(sessionStorage.getItem('news'));
	document.getElementById('loader').style.display = 'none';
	pushData(news, 0);
}
// Sort based on date
var sortDate = function(order){
	document.getElementById('loader').style.display = 'block';
	var news = JSON.parse(sessionStorage.getItem('news'));
	if(order == 1) { // New to Old Order
		news.sort(function(a,b){
			// Turn your strings into dates, and then subtract them
			// to get a value that is either negative, positive, or zero.
			return new Date(b.created_at) - new Date(a.created_at);
		});
	} else if(order == 0){ // Old to New Order
		news.sort(function(a,b){
			// Turn your strings into dates, and then subtract them
			// to get a value that is either negative, positive, or zero.
			return new Date(a.created_at) - new Date(b.created_at);
		});
	}
	sessionStorage.setItem('news', JSON.stringify(news));
	news = JSON.parse(sessionStorage.getItem('news'));
	document.getElementById('loader').style.display = 'none';
	pushData(news, 0);
}
// Sorting end



// Search
function search2(source, name) {
	var results = [];
	var index;
	var entry;
	name = name.toUpperCase();
	for (index = 0; index < source.length; ++index) {
		entry = source[index];
		if (entry && entry.title && entry.title.toUpperCase().indexOf(name) !== -1) {
			results.push(entry);
		}
		// Search by autor if required (Extra)
		// else if (entry && entry.author && entry.author.toUpperCase().indexOf(name) !== -1){
		// 	results.push(entry);
		// }
	}
	return results;
}
var search1 = function(){
	var searchVal = document.getElementById("search").value;
	var pagination = document.getElementById("pagination");
	if(searchVal == "" ) {
		pagination.style.display = 'inline-block';
	} else {
		pagination.style.display = 'none';
	}
	console.log(searchVal);
	news = JSON.parse(sessionStorage.getItem('news'));
	var results = search2(news, searchVal);
	pushData(results, 0);
}
// Search end



// (fresh fetch api)
// Extra feature added on refresh button click on top right corner
var fetchApi = function(){
	document.getElementById('newsList').innerHTML = '';
	document.getElementById('loader').style.display = 'block';
	document.getElementById('refresh').className += ' fa-spin';
	// Call API
	var request = new XMLHttpRequest();
	request.open('GET', 'hackernews.json', true);
	request.onload = function() {
		if (request.status >= 200 && request.status < 400) {
			// Success!
			var data = JSON.parse(request.responseText);
			//console.log(data);
			var news = data;
			sessionStorage.setItem('news_api_rate_limit', JSON.stringify(news[0]));
			news.splice(0,1);
			sessionStorage.setItem('news', JSON.stringify(news));
			console.log('---Saved data from API to Session Storage---');
			document.getElementById('loader').style.display = 'none';
			document.getElementById('refresh').classList.remove('fa-spin');
			pushData(news, 0);
			pushPagination(news);
		} else {
			// We reached our target server, but it returned an error
			console.log('--Error from Server: '+request.status+'--');
		}
	};
	request.onerror = function() {
		// There was a connection error of some sort
		console.log('--Error Occured--');
	};
	request.send();
}


$(document).ready(function($) {
	// Check if data is present in LS
	var status = JSON.parse(sessionStorage.getItem('news'));
	if(status == null) {
		document.getElementById('loader').style.display = 'block';
		console.log('---No data found in Session Storage---');
		console.log('---Fetching data from API---');
		// Call External API
		// Call FetchApi function
		fetchApi();
	} else {
		// Use Session Storage
		console.log('---Data Found in Session Storage---');
		console.log('---Fetching from Session Storage---');
		document.getElementById('loader').style.display = 'block';
		var news = JSON.parse(sessionStorage.getItem('news'));
		document.getElementById('loader').style.display = 'none';
		pushData(news, 0);
		pushPagination(news);
	}

}); // doc.ready end



// Extra Feature (on refresh button click)
// Tooltip
$(function () {
	$('.addTool').tooltip();
});
// Extra Feature end
