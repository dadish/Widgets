$(document).ready(function () {
    
    var script;

    script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '/site/modules/Widgets/deps/requirejs/require.js';
    script.setAttribute('data-main', '/site/modules/Widgets/js/Boot');
    document.head.appendChild(script);
});