/* =====================
   アプリについて
===================== */

function openAboutApp(){

    closeHomeMenu();

    const modal =
        document.getElementById("aboutAppModal");

    if(modal){

        modal.style.display = "flex";

    }

}


/* =====================
   アプリについてを閉じる
===================== */

function closeAboutApp(){

    const modal =
        document.getElementById("aboutAppModal");

    if(modal){

        modal.style.display = "none";

    }

}