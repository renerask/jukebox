

var list;
var numbers;


var browse_num;
var artist;
var album;
var bgimage;
var Mop;
var albumview;
var currenttime;
var songduration;
var cdlist; // list of active CD numbers
var cur_cd = "000"; // current cd number as zero padded text
var cur_track = { track_no : 0 };
var slider;
var next_tl_track; // if null then we are playing the last track
var popup;
var browser;
var server = location.host;
var play_state;
var playtoggle;

var next_cd;
var next_cd_track;

var key_entry = "cd";
var key_cd = 000;
var key_track = 00;

var numbers_timer;
var timer;
var curtime = 0;
var song_duration;

var res;
var res2;
var files;



function checkKey(e) {
    switch(e.key) {
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
            keyNumber(e.key);
            break;

        case "ArrowLeft":
            keyShowPrev();
            break;

        case "ArrowRight":
            keyShowNext();
            break;

        case "ArrowUp":
            if ( popup.is(':hidden') ) {
                keyPlayPrevious();
            }
            break;

        case "ArrowDown":
            if ( popup.is(':hidden') ) {
                keyPlayNext();
            }
            break;

        case "Backspace":
            setNumbers("000");
            break;

        case "+":
            keyShowDisc()
            break;

        case "Escape":
            keyHidePopup();
            break;

        case "Enter":
            keyPlayDisc();
            break;

        case " ":
            keyTooglePlay();
            break;
    }
}


function numClick(e){
    switch(e.currentTarget.id) {
      case "click-0":
      case "click-1":
      case "click-2":
      case "click-3":
      case "click-4":
      case "click-5":
      case "click-6":
      case "click-7":
      case "click-8":
      case "click-9":
          keyNumber(e.target.innerHTML);
          break;

      case "click-clr":
          setNumbers("000");
          break;

      case "click-play":
          keyPlay();
          break;

      case "click-backward":
          keyPlayPrevious();
          break;

      case "click-playtoggle":
          keyTooglePlay(); 
          break;

      case "click-forward":
          keyPlayNext();
          break;
                
      case "click-view":
          keyShowDisc();
          break;

      case "click-next":
          keyPlayNextCD();
          break;

      case "click-plus":
          keyQueueCD();
          break;

      case "click-fullscreen":
          document.getElementById("screen").mozRequestFullScreen();
          break;

      default:
          console.log("not handled:" + e.target.innerHTML);
    }
}


$(document).ready(function(){

    list = document.getElementById("play-list");
    numbers = $("#numbers");
    playing_cd = $("#playing_cd");
    playing_track = $("#playing_track");
    keys_cd = $("#keys_cd");
    keys_track = $("#keys_track");
    browse_num = $("#browse-num");
    slider = document.getElementById("slider");
    artist = document.getElementById("artist");
    album = document.getElementById("album");
    album = document.getElementById("album");
    bgimage = document.getElementById("bgimage");
    currenttime = document.getElementById("currenttime");
    songduration = document.getElementById("songduration");
    popup = $('#popup');

    playtoggle = $('#click-playtoggle i');

    // make keyboard navigation possible
    document.onkeydown = checkKey;
    
    list.addEventListener('click', songClick );
    //$('#play-list li .play').on('click', function(event) { songClick(event) } );

    $('#numpad td').on('click', function(event) { numClick(event) } );

    Mop = new Mopidy({
                webSocketUrl: "ws://" + server + ":6680/mopidy/ws/",
                callingConvention: "by-position-or-by-name"
              });

    Mop.on("state:online", function() {
        getDiscList();
        getCurrentDisc();
    });


    // playback has started
    Mop.on("event:trackPlaybackStarted", function(data) {
        console.log("playback started");
        //console.log(data);

        clearInterval(timer);

        cur_track = data.tl_track.track;

        setPlaying(cur_track);
        setArtist();

        curtime = 0;
        setDuration(cur_track.length);
        setTime();

        // start timer
        timer = setInterval(setTime, 1000);

        // get next track on the list
        Mop.tracklist.getNextTlid({}).then(function(data){
            next_tl_track = data
        });
    });

    Mop.on("event:playbackStateChanged", function(data) {
        console.log("state changed: " + data.new_state);
        play_state = data.new_state;
        //console.log(data);
        if ( data.new_state == "stopped" ) {
            unsetPlaying();
            clearInterval(timer);
            currenttime.innerHTML = format(0);
            setDuration(0);
        }
        
        // set the play/pause icons
        if ( play_state == "playing" ) {
            playtoggle.addClass("fa-pause");
            playtoggle.removeClass("fa-play");
        } else {
            playtoggle.removeClass("fa-pause");
            playtoggle.addClass("fa-play");

        }
    });

    Mop.on("event:trackPlaybackEnded",function(data) {
        console.log("Track Playback ended");
        // play next cd if this was the last track
        // NOTE: this breaks if multiple browsers are connected.
        // FIXME breaks on last track on CD
        if ( next_tl_track === null ) {
            index = cdlist.indexOf(parseInt(cur_cd));
            next_cd = cdlist[index+1];
            if ( next_cd === undefined ) {
                next_cd = cdlist[1];
                console.log("next cd: " + next_cd)
            }
            tmp = "000" + next_cd.toString();
            cur_cd = tmp.slice(-3);
            setNumbers(cur_cd);
            playDisc(cur_cd);
        }
    });

    Mop.on("event:trackPlaybackResumed", function(data) {
        console.log("Playback Resumed");
        //console.log(data);
        timer = setInterval(setTime, 1000);
        curtime = data.time_position;
    });

    Mop.on("event:trackPlaybackPaused", function(data) {
        console.log("Playback Paused");
        //console.log(data);
        clearInterval(timer);
        curtime = data.time_position;
    });

    //Mop.on("event:tracklistChanged", function(data) { console.log(data) });
    //Mop.on("event:volumeChanged", function(data) { console.log(data) });

    // create a clear the song list (it needs an <li> to initialize)
    options = {
      valueNames: [
        'play',
        'track',
        'title',
        'artist',
        'duration',
        { data: ['uri'] },
        { data: ['id'] },
        { data: ['tlid'] },
      ]
    };
    albumview = new List('song-list', options);
    albumview.clear();

    boptions = {
      valueNames: [
        'play',
        'track',
        'title',
        'artist',
        'duration',
      ],
      listClass: "b-list",
    };
    browser = new List('browse-list', boptions);
    browser.clear();

});
