var modal = document.getElementById("myModal");
var isMouseDown = false;
var startX, startY;

modal.onmousedown = function(e) {
    isMouseDown = true;
    startX = e.clientX - modal.offsetLeft;
    startY = e.clientY - modal.offsetTop;
}

window.onmouseup = function() {
    isMouseDown = false;
}

window.onmousemove = function(e) {
    if (isMouseDown) {
        modal.style.left = e.clientX - startX + "px";
        modal.style.top = e.clientY - startY + "px";
    }
}