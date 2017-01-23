var gifLoader = function() {

  var $input              = $( '.landing__search' ),
      $searchForm         = $( '.landing__form' ),
      $introWrapper       = $( '.landing__wrapper' ),
      $noResults          = $( '.landing__no-results' ),
      $gifWrapper         = $( '.gif' ),
      $gifList            = $( '.gif-list' ),
      $gifTag             = $( '.meta__tag' ),
      $gifCount           = $( '.meta__count' ),
      $loadMore           = $( '.load-more' ),
      noResultsDisplay    = 'landing__no-results--display'
      bodyBlock           = 'body--block',
      loadMoreDisplay     = 'load-more--display',
      introWrapperHide    = 'landing__wrapper--reduce',
      proxyUrl            = 'https://query.yahooapis.com/v1/public/yql',
      loadCount           = 2,
      gifCount            = 0;          

  // Update meta values
  function setMeta( gifTag, gifCount ) {
    $gifTag.text( gifTag );
    $gifCount.text( gifCount );
  }

  // Empty image listing
  function emptyList() {
    $gifList.empty();          
  }

  // Find broken links and remove container
  function removeBrokenGif() {
    $( 'img' ).on( 'error', function(){
      $(this).parents( ':eq(1)' ).remove();
    });
  }

  // Populate image listing
  function populateGifs( gifArray ) {
    if ( gifArray.length >= 8 ) {
      gifCount = 8;
    } else {
      gifCount = gifArray.length;
    }

    for ( var i = 0; i < gifCount; i++ ) {
      var gif = gifArray[i];
      $gifList.append( 
        '<div class="gif"><div class="gif__image"><img src="' + gif.url + '"></div><a target="_blank" href="' + gif.url + '" class="gif__url"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="#fff" d="M14 16V5l-1 1v9H1V3h9l1-1H0v14z"/><path fill="#fff" d="M16 0h-5l1.8 1.8L6 8.6 7.4 10l6.8-6.8L16 5z"/></svg></a></div>' 
      );
    }

    // Remove any broken links
    removeBrokenGif()

  }

  // Search images
  function searchGifs() {
    var rawValue          = $input.val(),
        inputValue        = rawValue.replace(/\s/g, ""),
        gifBase           = 'http://gifbase.com/tag/' + inputValue + '?format=json';

    if ( inputValue.trim().length == 0 ) {
      $noResults.addClass( noResultsDisplay );
      $loadMore.removeClass( loadMoreDisplay );
    } else {
      gifCollect( inputValue, gifBase );
      $noResults.removeClass( noResultsDisplay );
    }

    emptyList();
    
  }

  // Load more images
  function loadMoreGifs() {
    var rawValue          = $input.val(),
        inputValue        = rawValue.replace(/\s/g, ""),
        gifBase           = 'http://gifbase.com/tag/' + inputValue + '?p=' + loadCount + '&format=json';

    gifCollect( inputValue, gifBase )
    loadCount++;
  }

  // Show 'Load more' button if there are 
  // more results available
  function loadMoreButton( pageCount ) {
    if ( pageCount > 1 ) {
      $loadMore.addClass( loadMoreDisplay );
    } else {
      $loadMore.removeClass( loadMoreDisplay );
    }
  }

  // Update DOM elements
  function updateUI( pageCount ) {
    loadMoreButton( pageCount );
    $introWrapper.addClass( introWrapperHide );
    $( 'body' ).addClass( bodyBlock );
  }

  // Grab images
  function gifCollect( inputValue, gifBase ) {

    // Process via proxy to avoid CORS errors
    $.ajax({
      'url': proxyUrl,
      'data': {
        'q': 'SELECT * FROM json WHERE url="' + gifBase + '"',
        'format': 'json',
        'jsonCompat': 'new',
       },

      'dataType': 'jsonp',

      'success': function(response) {

        // Catch queries with no results
        if ( response['query']['results']['error'] ) {
          $noResults.addClass( noResultsDisplay );
          $loadMore.removeClass( loadMoreDisplay );
        } else {

          // Set response vars
          var response      = response['query']['results']['json'];
              gifArray      = response['gifs'],
              gifTag        = response['tag'],
              gifCount      = response['gif_count'],
              pageCount     = response['page_count'];

          // Hide error/load more
          $noResults.removeClass( noResultsDisplay );
          $loadMore.removeClass( loadMoreDisplay );

          // Update meta
          setMeta( gifTag, gifCount );

          // Populate image list
          populateGifs( gifArray );

          // Update UI
          updateUI( pageCount );

          // Update modal
          modal();
        }            
      },
    });
  }

  function bindEvents() {

    // Initial search
    $searchForm.on( 'submit', function () {
      searchGifs();
      return false;
    });

    // Load more
    $loadMore.on( 'click', function() {
      loadMoreGifs();
    });
  }

  bindEvents();

};

var modal = function() {

  var $gifLink            = $( '.gif__url' ),
      $modalOverlay       = $( '.overlay' ),
      $modal              = $( '.modal' ),
      $modalContent       = $( '.modal__content' );
      $modalClose         = $( '.modal__close' );

  function modalFocus() {
    $( $modalContent ).select();
  }

  function populateModal( link ) {
    $modalContent.text( link );
    $modalContent.val( link );
  }

  function displayModal() {
    $modalOverlay.fadeIn(300);
  }

  function hideModal() {
    $modalOverlay.fadeOut(300);
  }

  function bindEvents() {

    // Populate and display modal
    $gifLink.on( 'click', function(e) {
      var link = $(this).attr('href');
      populateModal( link );
      displayModal();
      e.preventDefault();
    });
    
    // Select modal content
    $modalContent.on( 'focus', function() {
      modalFocus();
    });

    // Close modal
    $modalClose.on( 'click', function() {
      hideModal();
    });
  }

  bindEvents();

};

$(document).ready(function () {
  gifLoader();
  modal();
});
