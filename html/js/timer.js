
function format(milliseconds) {
    if (milliseconds === Infinity) {
        return '(n/a)';
    } else if (milliseconds === 0) {
        return '0:00';
    }

    var seconds = Math.floor(milliseconds / 1000);
    var minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;

    seconds = seconds < 10 ? '0' + seconds : seconds;
    return minutes + ':' + seconds;
}

function setTime() {
    curtime = curtime+1000;
    slider.value = Math.floor(curtime/1000); 
    setRemaining();
    //currenttime.innerHTML = format(curtime);
}

function setRemaining() {
    time = song_duration-curtime;
    currenttime.innerHTML = "-" + format(time);
}
