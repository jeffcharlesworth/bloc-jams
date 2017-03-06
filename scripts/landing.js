 var animatePoints = function() {
 
     var points = document.getElementsByClassName('point');
  // takes a single argument: the index of the points class node element does it want function (i) to choose where to start?
     var revealPoint = function () {
        for(var i =0; i < points.length; i++) {
         points[i].style.opacity = 1;
         points[i].style.transform = "scaleX(1) translateY(0)";
         points[i].style.msTransform = "scaleX(1) translateY(0)";
         points[i].style.WebkitTransform = "scaleX(1) translateY(0)";
        } 
     };
     revealPoint();
 };