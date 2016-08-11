
function search() {
    str = document.getElementById("search").value;
    strs = str.split(" ");
    //Mop.library.search( { query: { any: str }, 
    Mop.library.search( { query: {  album: strs,
                                    artist: strs,
                                    track_name: strs }, 
                          exact: false,
                           uris: ['local:'] } )
        .then( function(data) {
            console.log(data);
        });
}


function setBrowseNumbers(str) {
     num = browse_num.text().slice(-3);
     new_num = num + str;
     browse_num.text(new_num.slice(-3));
}

function showCDTrack() {
    cd = ("000" + key_cd).slice(-3);
    track = ("00" + key_track).slice(-2);
    keys.text(cd + ":" + track);
}

function clearCDTrack() {
  keys.text("000:00");
}

function setNumbers(str) {
    num = numbers.text().slice(-3);
    new_num = num + str;
    numbers.text(new_num.slice(-3));
    setWarning();
    setNumbersTimer();
}

// reset the "numbers" if it doesn't match the currently playing disc
function setNumbersTimer() {
    clearTimeout(numbers_timer); 
    numbers_timer = setTimeout(function(){ setNumbers(cur_cd) }, 5000); 
}


function setWarning() {
     if ( cdlist.indexOf(parseInt(numbers.text())) != -1 ) {
         numbers.removeClass("not-found");
     } else {
         numbers.addClass("not-found");
     }
}

function showPrev(){
    index = cdlist.indexOf(parseInt(browse_num.text()));
    next_cd = cdlist[parseInt(index)-1];
    if ( next_cd === undefined ) {
        next_cd = cdlist[cdlist.length-1];
    }
    tmp = "000" + next_cd.toString();
    cd = tmp.slice(-3);
    setBrowseNumbers(cd);
    setNumbers(cd);
    showDisc(cd);
}
function showNext(){
    index = cdlist.indexOf(parseInt(browse_num.text()));
    next_cd = cdlist[parseInt(index)+1];
    if ( next_cd === undefined ) {
        next_cd = cdlist[0];
    }
    tmp = "000" + next_cd.toString();
    cd = tmp.slice(-3);
    setBrowseNumbers(cd);
    setNumbers(cd);
    showDisc(cd);
}

function setArtist() {
    console.log(cur_track.artists[0].name);
    $('#artist').text( cur_track.artists[0].name );
}


// show a popup with the selected disc
function showDisc(disc) {
    browse_num.text(disc);
    uri = 'local:directory:' + parseInt(disc).toString();
    Mop.library.browse( {uri: uri } ).then(function(data){
        urilist = [];
        data.forEach(d => {
             urilist.push(d.uri);
        });
        Mop.library.lookup({uris: urilist}).then(function(songs){
            // display artist and album
            firstsong = songs[Object.keys(songs)[0]][0];
            if ( firstsong.hasOwnProperty('artists') === true ) {
                $('#popup-artist').text( firstsong.artists[0].name );
            }
            if ( firstsong.hasOwnProperty('album') === true) {
                $('#popup-album').text( firstsong.album.name );
            }
            // clear the list 
            browser.clear();
            // display the song list
            urilist.forEach(u => {
                song = songs[u][0];
                browser.add( {  track: song.track_no,
                                  title: song.name,
                                  artist: song.artists[0].name,
                                  uri: u,
                                  duration: format(song.length),
                                  id: "track_" + song.track_no } );
            });
            // display the image if any is found
            document.getElementById("browse-image").style.backgroundImage = "url(\'http://" + server + ":6680/" + parseInt(disc) + "/cover.jpg\')";
        });
    });
    popup.fadeIn();
}

function playDisc(disc) {
    uri = 'local:directory:' + parseInt(disc).toString();
    console.log(uri);
    //uri = 'file:///home/rene/mopidy/fakelist/' + parseInt(disc).toString();
    cur_cd = disc;
    albumview.clear();
    Mop.library.browse( {uri: uri } ).then(function(data){
        urilist = [];
        data.forEach(d => {
             urilist.push(d.uri);
        });
        Mop.library.lookup({uris: urilist}).then(function(songs){
              // display artist and album
              firstsong = songs[Object.keys(songs)[0]][0];
              if ( firstsong.hasOwnProperty('artists') === true ) {
                  artist.innerHTML = firstsong.artists[0].name;
              }
              if ( firstsong.hasOwnProperty('album') === true) {
                  album.innerHTML = firstsong.album.name;
              }

              // clear the tracklist
              Mop.tracklist.clear({}).then(function(data){
                  console.log("Tracklist cleared");
              });

              // add the new songs
              Mop.tracklist.add({'uris': urilist}).then(function(data){
                  // start playing the selected track or the first track if not found
                  track = parseInt(key_track)-1;
                  if ( !data[track] ) {
                      track = 0;
                  }
                  Mop.playback.play( { tlid: data[track].tlid } ).then(function(data){
                      console.log(data);
                      key_cd = "000";
                      key_track = "000";
                  });
                  // display the song list
                  song_i = 0;
                  urilist.forEach(u => {
                      song = songs[u][0];
                      albumview.add( {  track: song.track_no,
                                        title: song.name,
                                        artist: song.artists[0].name,
                                        uri: u,
                                        duration: format(song.length),
                                        id: "track_" + song.track_no,
                                        tlid: data[song_i].tlid
                                      } );
                      song_i++;
                  });
              });
              // display the image if any is found
              bgimage.style.backgroundImage = "url(\'http://" + server + ":6680/" + parseInt(disc) + "/cover.jpg\')";
        });
    });
}

// Get list of cd's
// Must be directories named from 0 to 999
function getDiscList() {
    if ( cdlist === undefined ) {
        match = /^[0-9]{1,3}$/
        Mop.library.browse({uri: 'local:directory'}).then(function(dirs){
            cdlist = [];
            dirs.forEach(d => {
                if ( match.test(d.name) ) {
                    cdlist.push(parseInt(d.name));
                }
            });
            cdlist.sort(compareNumbers);
        });
    }
}

function getCurrentDisc() {
    Mop.tracklist.getTlTracks().then(loadDisc, console.error);
}

function loadDisc(resArr) {
    // get current tracklist
    Mop.tracklist.getTlTracks().then(function(songs){
        if ( songs.length > 0 ) {
            // display artist and album
            firstsong = songs[0].track;
            if ( firstsong.hasOwnProperty('artists') === true ) {
                artist.innerHTML = firstsong.artists[0].name;
            }
            if ( firstsong.hasOwnProperty('album') === true) {
                album.innerHTML = firstsong.album.name;
            }

            // display the song list
            songs.forEach(u => {
                song = u.track;
                albumview.add( {  track: song.track_no,
                                  title: song.name,
                                  artist: song.artists[0].name,
                                  uri: song.uri,
                                  duration: format(song.length),
                                  id: "track_" + song.track_no,
                                  tlid: u.tlid
                                } );
            });
            // display the image if any is found
            disc = songs[0].track.uri.split(':')[2].split('/')[0];
            setNumbers(disc);
            showCDTrack();
            cur_cd = numbers.text();
            bgimage.style.backgroundImage = "url(\'http://" + server + ":6680/" + parseInt(disc) + "/cover.jpg\')";
        }
    }); 

    // get the currently playing track
    Mop.playback.getCurrentTrack({}).then(function(data){
        // mark the playing/active track in the list
        if ( data !== null ) {
            cur_track = data;
            setPlaying(data);
            setArtist();
            setDuration(data.length);
        }
    });
    showCDTrack();

    // get position in song
    Mop.playback.getTimePosition({}).then(function(data){
        // set the slider to the correct time
        curtime = data;
        setTime();
    });

    // get current state
    Mop.playback.getState().then( function(data){
        play_state = data;
        // start timer if playing
        if ( play_state == "playing" ) {
            timer = setInterval(setTime, 1000);
        }
    });

}

// set the song duration
function setDuration(ms) {
    song_duration = ms;
    songduration.innerHTML = format(ms);
}

// Display the currently playing song
function setPlaying(track) {
    // first we unset the currently playing song highlight
    $(".playing").removeClass("playing");
    trk = $('li[data-id=track_' + track.track_no + ']');
    trk.toggleClass("playing");
    $(".playing")[0].scrollIntoView({block: "end", behavior: "smooth"});
    
    slider.max = Math.floor(track.length/1000);
    slider.value = 0;
}

function unsetPlaying() {
    $(".playing").removeClass("playing");
}

function compareNumbers(a, b) {
      return a - b;
}

function setPosition(e) {
    curtime = e.target.value*1000;
    setTime();
    Mop.playback.seek({time_position: e.target.value*1000 });
}

