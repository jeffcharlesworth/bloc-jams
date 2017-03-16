
var createSongRow = function (songNumber, songName, songLength) {
    var template =
        '<tr class="album-view-song-item">'
    +     '<td class="song-item-number" data-song-number="' + songNumber  + '">' + songNumber + '</td>'
    +     '<td class="song-item-title">' + songName + '</td>'
    +     '<td class="song-item-duration">' + filterTimeCode(songLength) + '</td>'
    +   '</tr>'
    ;
    
    var $row = $(template);
    
    var clickHandler = function () {
    var songNumber = parseInt($(this).attr('data-song-number'));
    
    if (currentlyPlayingSongNumber !== null) {
		// Revert to song number for currently playing song because user started playing new song.
		var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
		currentlyPlayingCell.html(currentlyPlayingSongNumber);
	}
	if (currentlyPlayingSongNumber !== songNumber) {
		// Switch from Play -> Pause button to indicate new song is playing.
		$(this).html(pauseButtonTemplate);
		setSong(songNumber);
        currentSoundFile.play();
        updateSeekBarWhileSongPlays();
        currentSongFromAlbum = currentAlbum.songs[songNumber -1];
        updatePlayerBarSong();
        updateSeekBarWhileSongPlays();
        
        var $volumeFill = $('.volume .fill');
        var $volumeThumb = $('.volume .thumb');
        $volumeFill.width(currentSoundFile.volume + '%');
        $volumeThumb.css({left: currentSoundFile.volume + '%'});
	} else if (currentlyPlayingSongNumber === songNumber) {
		if (currentSoundFile.isPaused()) {
                $(this).html(pauseButtonTemplate);
                $('.main-controls .play-pause').html(playerBarPauseButton);
                currentSoundFile.play();
                updateSeekBarWhileSongPlays();
       } 
        else {
                $(this).html(playButtonTemplate);
                $('.main-controls .play-pause').html(playerBarPlayButton);
                currentSoundFile.pause();
            }
	   }
        
    };
    
    var onHover = function () {
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));
        
        if (songNumber !== currentlyPlayingSongNumber){
            songNumberCell.html(playButtonTemplate);
        }
    };
    var offHover = function () {
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));
        
        if (songNumber !== currentlyPlayingSongNumber) {
            songNumberCell.html(songNumber);
        }
        console.log("songNumber type is " + typeof songNumber + "\n and currentlyPlayingSongNumber type is " + typeof currentlyPlayingSongNumber);

    };
    
    $row.find('.song-item-number').click(clickHandler);
    $row.hover(onHover, offHover);
    return $row;
};
var updatePlayerBarSong = function () {
    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist); 
    $('.main-controls .play-pause').html(playerBarPauseButton);
    setTotalTimeInPlayerBar(currentSongFromAlbum.duration);
};

var setCurrentAlbum = function (album) {
    currentAlbum = album;
    var $albumTitle = $('.album-view-title');
    var $albumArtist = $('.album-view-artist');
    var $albumReleaseInfo = $('.album-view-release-info');
    var $albumImage = $('.album-cover-art');
    var $albumSongList = $('.album-view-song-list');
    
    $albumTitle.text(album.title);
    $albumArtist.text(album.artist);
    $albumReleaseInfo.text(album.year + ' ' + album.label);
    $albumImage.attr('src', album.albumArtUrl);
    
    $albumSongList.empty();
    
    for (var i = 0; i < album.songs.length; i++) {
        var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
        $albumSongList.append($newRow);
    }
};

var updateSeekBarWhileSongPlays = function () {
    if (currentSoundFile) {
        currentSoundFile.bind('timeupdate', function(event) {
            var seekBarFillRatio = this.getTime() / this.getDuration();
            var $seekBar = $('.seek-control .seek-bar');
        
            updateSeekPercentage($seekBar, seekBarFillRatio);
            setCurrentTimeInPlayerBar(this.getTime());
        });
    }  
};

var setTotalTimeInPlayerBar = function(totalTime) {
    $('.seek-control .total-time').html(filterTimeCode(totalTime));
};

var updateSeekPercentage = function ($seekBar, seekBarFillRatio) {
    var offsetXPercent = seekBarFillRatio * 100;
    offsetXPercent = Math.max(0, offsetXPercent);
    offsetXPercent = Math.min(100, offsetXPercent);
    
    var percentageString = offsetXPercent + '%';
    $seekBar.find('.fill').width(percentageString);
    $seekBar.find('.thumb').css({left: percentageString});
};

var setUpSeekBars = function () {
    var $seekBars = $('.player-bar .seek-bar');
    
    $seekBars.click(function(event) {
        var offsetX = event.pageX - $(this).offset().left;
        var barWidth = $(this).width();
        var seekBarFillRatio = offsetX / barWidth;
        
        if ($(this).parent().attr('class') == 'seek-control') {
            seek(seekBarFillRatio * currentSoundFile.getDuration());
        } else {
            setVolume(seekBarFillRatio * 100);   
        }
        
        updateSeekPercentage($(this), seekBarFillRatio);
    });
    
    $seekBars.find('.thumb').mousedown(function(event) {
        var $seekBar = $(this).parent();
        
        $(document).bind('mousemove.thumb', function(event) {
            var offsetX = event.pageX - $seekBar.offset().left;
            var barWidth = $seekBar.width();
            var seekBarFillRatio  = offsetX / barWidth;
            
            if ($seekBar.parent().attr('class') == 'seek-control') {
                seek(seekBarFillRatio * currentSoundFile.getDuration());   
            } else {
                setVolume(seekBarFillRatio);
            }

            updateSeekPercentage($seekBar, seekBarFillRatio);            
        });
        
        $(document).bind('mouseup.thumb', function() {
            $(document).unbind('mousemove.thumb');
            $(document).unbind('mouseup.thumb');
            
        })
    });
    
};

var setCurrentTimeInPlayerBar = function(currentTime) {
    $('.current-time').html(filterTimeCode(currentTime));
};


var trackIndex = function(album, song) {
    return album.songs.indexOf(song);  
};


var nextSong = function() {

    var getLastSongNumber = function(index) {
        return index == 0 ? currentAlbum.songs.length : index;
    };

    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    // Note that we're _incrementing_ the song here
    currentSongIndex++;

    if (currentSongIndex >= currentAlbum.songs.length) {
        currentSongIndex = 0;
    }

    // Set a new current song
    setSong(currentSongIndex + 1);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();

    // Update the Player Bar information
    updatePlayerBarSong();

    var lastSongNumber = getLastSongNumber(currentSongIndex);
    var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);

    $nextSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);

};

var previousSong = function() {

    // Note the difference between this implementation and the one in
    // nextSong()
    var getLastSongNumber = function(index) {
        return index == (currentAlbum.songs.length - 1) ? 1 : index + 2;
    };

    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    // Note that we're _decrementing_ the index here
    currentSongIndex--;

    if (currentSongIndex < 0) {
        currentSongIndex = currentAlbum.songs.length - 1;
    }

    // Set a new current song
    setSong(currentSongIndex + 1);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();

    // Update the Player Bar information
    updatePlayerBarSong();

    $('.main-controls .play-pause').html(playerBarPauseButton);

    var lastSongNumber = getLastSongNumber(currentSongIndex);
    var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);

    $previousSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);

};

var setSong = function (songNumber) {
    var tempSongNumber = currentlyPlayingSongNumber;
    
    if(tempSongNumber != null) {
    var tempVolume = currentSoundFile.volume;
    }
    
    if(currentSoundFile){
        currentSoundFile.stop();
    }
    
    currentlyPlayingSongNumber = parseInt(songNumber);
    currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
    currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
    formats: [ 'mp3' ],
    preload: true
    });
    
    if (tempSongNumber == null) {
        setVolume(80);
    }
    else{
        setVolume(tempVolume);
    }
};

var seek = function(time) {
    if(currentSoundFile) {
        currentSoundFile.setTime(time);
    }
};

var setVolume = function (volume) {
    if (currentSoundFile) {
        currentSoundFile.setVolume(volume);
    }
};

var getSongNumberCell = function (number) {
    return $('.song-item-number[data-song-number="' + number + '"]');
};

var filterTimeCode = function (timeInSeconds) {
    var seconds = Math.floor(parseFloat(timeInSeconds));
    if (Math.floor(seconds % 60) < 10) {
        return Math.floor(seconds/60) + ":0" + Math.floor(seconds % 60);
    }
    else{
        return Math.floor(seconds/60) + ":" + Math.floor(seconds % 60);
    }
};

var togglePlayFromPlayerBar = function() {
    if(currentSoundFile.isPaused()){
        $playPauseButton.html(playerBarPauseButton);
        currentSoundFile.play();
        var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
		currentlyPlayingCell.html(pauseButtonTemplate);
    }  
    else {
        $playPauseButton.html(playerBarPlayButton);
        currentSoundFile.pause();
        var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
		currentlyPlayingCell.html(playButtonTemplate);
    }
};

var songListContainer = document.getElementsByClassName('album-view-song-list')[0];
var songRows = document.getElementsByClassName('album-view-song-item');

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button pause"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentAlbum = null;
var currentSoundFile = null;
var currentVolume = null;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');
var $playPauseButton = $('.main-controls .play-pause');

$(document).ready(function () {
    setCurrentAlbum(albumPicasso);
    setUpSeekBars();
    $previousButton.click(previousSong);
    $nextButton.click(nextSong);
    $playPauseButton.click(togglePlayFromPlayerBar);
});