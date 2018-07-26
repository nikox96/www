self.addEventListener('install', function(e) {
 e.waitUntil(
   caches.open('portaleInnovazioni').then(function(cache) {
     return cache.addAll([
       /*'/offline',*/
       '/client-list',
       /*'/product-list',*/
       'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css',
       '/material-design-icons/iconfont/material-icons.css',
       'https://code.jquery.com/jquery-3.2.1.slim.min.js',
       'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js',
       'https://use.fontawesome.com/025507bc43.js',
       'https://use.fontawesome.com/releases/v5.2.0/css/all.css',
       'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js'
     ]);
   })
 );
});
