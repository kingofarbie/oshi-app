function setTheme(theme){

    document.body.className =
        document.body.className
        .replace(/theme-[^\s]+/g,'');

    document.body.classList.add(
        'theme-' + theme
    );

    localStorage.setItem(
        'theme',
        theme
    );

}

function loadTheme(){

    const theme =
        localStorage.getItem('theme');

    if(theme){

        document.body.classList.add(
            'theme-' + theme
        );

    }else{

        document.body.classList.add(
            'theme-neon-pink'
        );

    }

}

document.addEventListener(
    'DOMContentLoaded',
    loadTheme
);