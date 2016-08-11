
function keyPlayPopup(e)  {

}


function songClick(e) {
    target = e.target
    if ( target.parentElement.id == "" ) {
        li = target.parentElement;
        if ( target.classList.contains("play") ) {
            tlid = parseInt( li.getAttribute("data-tlid") );
            Mop.playback.play( { tlid: tlid } ).then(function(data) {
                console.log(data);
            });
        }
    }
}

function keyNumber(str) {
    if ( key_entry == "cd" ) {
        key_cd = (key_cd + str).slice(-3);
    } else {
        key_track = (key_track + str).slice(-2);
    }
    showCDTrack();
}

function keyPlay() {
  if ( key_entry == "cd" ) {
      key_entry = "track";
  } else {
      keyPlayDisc();
      key_entry = "cd";
      clearCDTrack();
  }
}


function keyPlayNextCD() {
}

function keyQueueCD() {
}


function keyShowNext() {
    disc = browse_num.text();
    if ( disc == "" ) {
        disc = numbers.text();
        browse_num.text(disc);
    }
    if ( cdlist.indexOf(parseInt(disc)) == -1 ) {
        setNumbers(cur_cd);
    }
    showNext();
}

function keyShowPrev() {
    disc = browse_num.text();
    if ( disc == "" ) {
        disc = numbers.text();
        browse_num.text(disc);
    }
    if ( cdlist.indexOf(parseInt(disc)) == -1 ) {
        setNumbers(cur_cd);
    }
    showPrev();
}

function keyShowDisc() {
    disc = numbers.text();
    if ( cdlist.indexOf(parseInt(disc)) != -1 ) {
        showDisc(disc);
    }
}

function keyPlayDisc() {
    popup.fadeOut();
    if ( cdlist.indexOf(parseInt(key_cd)) != -1 ) {
        playDisc(key_cd);
    }
}

function keyTooglePlay() {
    if ( play_state == "paused" ) {
        Mop.playback.resume({});
        playtoggle.addClass("fa-pause");
        playtoggle.removeClass("fa-play");
    }   
    if ( play_state == "playing" ) {
        Mop.playback.pause({});
        playtoggle.removeClass("fa-pause");
        playtoggle.addClass("fa-play");
    }   
}

function keyPlayPrevious() {
    // if currently playing track is the first then don't do .previous() 
    if ( list.firstChild.dataset.id != "track_" + cur_track.track_no ) {
        Mop.playback.previous({});
    }
}

function keyPlayNext() {
    Mop.playback.next({});
}


function keyHidePopup() {
    popup.fadeOut()
}



