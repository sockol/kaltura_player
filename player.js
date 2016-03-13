/*
Note - most of the comments are filtered out on production
*/

(function($) {



    $.log = function(arr, id) {

        if (dbug > 0 && arr !== undefined) {

            if (id === undefined)
                var id = "#pcmi-video,#pcmi-content-top-video";
            //dbug is set to 1 at least, print to console
            console.log(arr);


            var style = "";
            style += "display: block;";
            style += "font-family:Arial;";
            style += "font-weight:normal;";
            style += "font-size:10px;";
            style += "width:100%;";
            style += "overflow-x:scroll;";
            style += "margin-bottom:15px;";
            style += "height:400px;";
            if (!$("#log-box").length)
                $(id).after("<div id='log-box' style='" + style + "'></div>");

            style = "";
            style += "font-size:14px;";
            style += "font-weight:normal;";
            style += "font-family:monospace;";
            style += "white-space: nowrap;";
            style += "padding: 5px;";
            style += "display: table;";
            style += "overflow: hidden;";
            style += "width: 100%;";
            style += "background: #DADADA;";
            style += "margin-bottom: 2px;";

            var logbox = $("#log-box");

            if (dbug >= 2 && dbug < 4) {
                var str = $.logHelper(arr, 0);

                logbox.append("<p style='" + style + "'>" + $.timeStamp() + " " + str + "</p>");
                logbox.scrollTop(logbox[0].scrollHeight - logbox.height() + 100);

                //check if we need to attach events to new elements
                $.copyToClipboard();
            }
            if (dbug >= 4) {

                console.log = function(str) {
                    if (typeof str === "object" && !Array.isArray(str) && str !== null)
                        str = str.toSource();
                    logbox.append("<p style='" + style + "'>" + $.timeStamp() + " " + str + "</p>");
                };
                console.error = console.debug = console.info = console.log;
                logbox.scrollTop(logbox[0].scrollHeight - logbox.height() + 100);

                //check if we need to attach events to new elements
                $.copyToClipboard();
            }
        }
    };
    $.logHelper = function(arr, level) {

        var str = "";

        //The padding given at the beginning of the line.
        var padding = "";
        for (var j = 0; j < level * 4 + 1; j++)
            padding += "&nbsp;";

        if (typeof(arr) == 'object') { //Array/Hashes/Objects
            str += "{";
            for (var item in arr) {
                var value = arr[item];

                var temp = padding;
                for (var j = 0; j < level * 4 + 1; j++)
                    temp += "&nbsp;";

                if (typeof(value) == 'object') { //If it is an array,
                    str += "<br>" + temp + "[" + item + "] : ";
                    str += $.logHelper(value, level + 1);
                } else
                    str += "<br>" + temp + "'" + item + "' => \"" + value + "\"";
            }
            str += " }";
        } else
            str = arr;

        return str;
    };

    $.gaEvent = function(name, label, value) {

        if (value === undefined || value == null || value == "") {

            $.log("G.A. Event - name: '" + name + "' label: '" + label);
            ga('send', 'event', 'kalturaPlayer', name, label);

        } else {
            $.log("G.A. Event - name: '" + name + "' label: '" + label + "' value: '" + value + "'");
            ga('send', 'event', 'kalturaPlayer', name, label, value);
        }
    }


    $.timeStamp = function() {
        var now = new Date();
        var date = [now.getMonth() + 1, now.getDate(), now.getFullYear()];
        var time = [now.getHours(), now.getMinutes(), now.getSeconds()];
        var suffix = (time[0] < 12) ? "AM" : "PM";
        time[0] = (time[0] < 12) ? time[0] : time[0] - 12;
        time[0] = time[0] || 12;
        for (var i = 1; i < 3; i++)
            if (time[i] < 10)
                time[i] = "0" + time[i];
        return "(" + time.join(":") + " " + suffix + ") ";
    }

    $.getQuery = function(uri, name) {

        var results = new RegExp('[\?&amp;]' + name + '=([^&amp;#]*)').exec(uri);
        return (results != null) ? (results[1] || 0) : false;
    };

    $.arrayContains = function(arr, val) {

        if (arr === undefined || val === undefined)
            return false;
        return arr.indexOf(val) != -1;
    };

    $.copyToClipboard = function() {

        $(".clipboard-button").unbind('click');
        $(".clipboard-button").bind('click', function() {

            var $temp = $("<input>")
            $("body").append($temp);
            $temp.val($(this).attr("data-info")).select();
            try {
                document.execCommand("copy");
                console.log("Text copied to clipboard");
            } catch (err) {
                console.log("Oops, unable to copy");
            }
            $temp.remove();
        });
    }

    $.fn.kalturaPlayer = function(options) {


            var playerId = ($(this) !== undefined) ? $(this).attr('id') : 'videoPlayer';
            var kalturaId = (options.kalturaId !== undefined) ? options.kalturaId : 101;
            var kalturaUi = (options.kalturaUi !== undefined) ? options.kalturaUi : 23448200;

            var adTagUrl = (options.adTagUrl !== undefined) ? options.adTagUrl : "";

            var livedbug = $.getQuery(window.location, "dbug");
            dbug = livedbug != false && $.arrayContains([0, 1, 2, 3], parseInt(livedbug)) ? parseInt(livedbug) :
                (options.dbug !== undefined) ? options.dbug :
                0;

            var enableAds = (options.enableAds !== undefined) ? options.enableAds : false;

            var adReplay = (options.adReplay !== undefined) ? options.adReplay : false;

            var enableAdsMobile = (options.enableAdsMobile !== undefined) ? enableAds && options.enableAdsMobile && kWidget.isMobileDevice() : false;

            if (options.testMobileAdUrl !== undefined)
                adTagUrl = options.testMobileAdUrl;


            var enablePreroll = (options.adType !== undefined) ? options.adType == "pre" : false;
            var enableMidroll = (options.adType !== undefined) ? options.adType == "mid" : false; //not implemented yet since kaltura doesn't really support it
            var enablePostroll = (options.adType !== undefined) ? options.adType == "post" : false;

            var adLimit = (options.adLimit !== undefined) ? options.adLimit : 2;
            $.log("Maximum number of video ads: " + adLimit);

            livedbug = $.getQuery(window.location, "timeout");
            adTimeout = livedbug != false ? parseInt(livedbug) :
                (options.adTimeout !== undefined) ? options.adTimeout :
                10000;
            var videoUrl = (options.videoUrl !== undefined) ? options.videoUrl : "";
            var videoThumbnailUrl = (options.videoThumbnailUrl !== undefined) ? options.videoThumbnailUrl : "";
            var videoName = (options.videoName !== undefined) ? options.videoName : "";
            var videoDescription = (options.videoDescription !== undefined) ? options.videoDescription : "";
            var videoDuration = (options.videoDuration !== undefined) ? options.videoDuration : "";

            var videoPlaylist = (options.videoPlaylist !== undefined) ? options.videoPlaylist : [];


            var supportedProviders = {
                url: ["yumenetworks.com", "daptv.advertising.com", "bnmla.com", "optimatic.com", "btrll.com", "fastclick.net"],
                type: ["yumenetworks", "adapttv", "bnmla", "optimatic", "btrll", "fastclick"]
            };


            var supportedProvidersMobile = ["optimatic", "btrll"];


            var supportedProvidersNested = ["bnmla", "fastclick"];

            var flashvars = {};

            adlock = 0;

            globallock = 0;
            nestedXML = "";

            nestedObject = 0;

            adNowPlayingText = (options.adNowPlayingText !== undefined) ? options.adNowPlayingText : false;
            oldNowPlayingText = $("#now-playing .np-descript").html(); //placeholder for the old html that will be replaced by `adNowPlayingText` until the ad finishes
            var faillock = 0;


            var playlist = Object.keys(videoPlaylist).length; //true or a number
            var playlistLimit = (playlist) ? Object.keys(videoPlaylist).length : 1;

            var videoNext = (playlistLimit > 1) ? "video2" : "";


            if ($.getQuery(window.location, "timeout") != false)
                $.log("Timeout changed: " + $.getQuery(window.location, "timeout"));

            if ($.getQuery(window.location, "dbug") != false)
                $.log("Debugging level: " + $.getQuery(window.location, "dbug"));

            function hardcodedUrlLog() {

                var adType = "";
                var pageLink = "";

                if (videoUrl == "http://v1.rxwiki.com/70c7cc1b-7952-4c14-ac37-8d037e4f525d") {
                    hardcodedAdTagUrl = "http://vast.optimatic.com/vast/getVast.aspx?id=q145a541&zone=testing&pageURL=rxwiki.com&pageTitle=http%25253A%25252F%25252Fwww.rxwiki.com%25252Fnews-article%25252Fmediterranean-diet-high-olive-oil-linked-breast-cancer-risk-reduction&cb=5119124";
                    adType = "Optimatic";

                } else if (videoUrl == "http://v1.rxwiki.com/158df1e1-e333-4824-8e8c-f43056a6a3d7") {
                    hardcodedAdTagUrl = "http://vast.bp3868203.btrll.com/vast/3868203?n=753124494&br_pageurl=http://www.rxwiki.com/news-article/teens-got-majority-overall-exercise-school-still-fell-short-exercise-recommendations";
                    adType = "Brightroll";

                } else if (videoUrl == "http://v1.rxwiki.com/158df1e1-e333-4824-8e8c-f43056a6a3d7") {
                    hardcodedAdTagUrl = "";
                    adType = "Fastclick - not ready yet";

                } else if (videoUrl == "") {
                    hardcodedAdTagUrl = "";
                    adType = "BNMLA - not ready yet";

                } else if (videoUrl == "http://v1.rxwiki.com/bc52998e-dcac-4c4f-8b0b-7aaf9be209c1") {
                    hardcodedAdTagUrl = "http://plg1.yumenetworks.com/yvp/20/2235rfedZeAc/Online_VPAID_RxWiki.xml";
                    adType = "Yumenetworks";

                } else if (videoUrl == "http://v1.rxwiki.com/db19fbb6-0307-4c09-b4d8-89015538c678") {
                    hardcodedAdTagUrl = "http://ads.adaptv.advertising.com/a/h/XIPW9q9MVh1Z8otB0IwpDFeSxk1SQWWwSesrE_807JJejM2JK7C+vi2vAQR1_LA5TuVZj2Zo7Wk=?cb=1291751734&pageUrl=EMBEDDING_PAGE_URL&description=VIDEO_DESCRIPTION&duration=VIDEO_DURATION&id=VIDEO_ID&keywords=VIDEO_KEYWORDS&title=VIDEO_TITLE&url=VIDEO_URL&eov=eov";
                    adType = "AdaptTV";

                } else {
                    hardcodedAdTagUrl = adTagUrl;
                    hardcodedUrl = false;
                    adType = "Not a supported provider or not a page from the given list ^";
                }

                $.log("Using hardcoded urls for select pages");
                var str = "Links to testing pages: <br>";
                str += "<a href='/news-article/mediterranean-diet-high-olive-oil-linked-breast-cancer-risk-reduction?dbug=3&hardcoded-url=true'>Optimatic</a> <br>";
                str += "<a href='/news-article/teens-got-majority-overall-exercise-school-still-fell-short-exercise-recommendations?dbug=3&hardcoded-url=true'>Brightroll</a> <br>";
                str += "<a href='/'>Fastclick</a> <br>";
                str += "<a href='/'>Bnmla</a> <br>";
                str += "<a href='/news-article/depression-may-be-less-likely-when-diet-high-vegetables-fruits-nuts?dbug=3&hardcoded-url=true'>Yumenetworks</a> <br>";
                str += "<a href='/news-article/auvi-q-epinephrine-injection-recalled-sanofi-possible-inaccurate-dosage-delivery?dbug=3&hardcoded-url=true'>AdaptTV</a> <br>";
                str += "Current page is: <strong>" + adType + "</strong>";
                $.log(str);
            }

            livedbug = $.getQuery(window.location, "hardcoded-url");
            var hardcodedUrl = livedbug != false ? livedbug :
                "";
            if (hardcodedUrl)
                hardcodedUrlLog();

            enablePreroll && $.log("Ad is preroll");
            enableMidroll && $.log("Ad is midroll");
            enablePostroll && $.log("Ad is postroll");



            var mediaProxy = {
                'entry': {
                    "thumbnailUrl": videoThumbnailUrl,
                    "name": videoName,
                    "description": videoDescription,
                    "duration": videoDuration
                },
                'sources': [{
                    "src": videoUrl + ".ogg",
                    "type": "video/ogg;"
                }, {
                    "src": videoUrl + ".webm",
                    "width": "624",
                    "height": "352",
                    "bandwidth": "740352",
                    "type": "video/webm; codecs='vp8, vorbis'",
                }, {
                    "src": videoUrl + ".mp4",
                    "width": "640",
                    "height": "360",
                    "bandwidth": "1101824",
                    "type": "video/mp4; codecs='avc1.42E01E, mp4a.40.2'",
                }]
            }



            function updateNextVideo() {

                // update next video
                var counter = 1;
                var length = Object.keys(videoPlaylist).length;

                for (var val in videoPlaylist) {

                    if (videoNext == val && counter == length) {

                        videoNext = "video1";
                        return;

                    } else if (videoNext == val) {

                        videoNext = "video" + (counter + 1);
                        return;
                    }
                    counter += 1;
                }
            }


            function rebuildPlayerWithoutAds() {

                var flashvars = {
                    mediaProxy: mediaProxy,
                    watermark: {
                        "plugin": false,
                        "img": "",
                        "href": "",
                        "cssClass": "topRight"
                    },
                    // forceMobileHTML5: true,
                    controlBarContainer: {
                        "plugin": true,
                        "hover": true
                    },
                    autoPlay: true,
                    adsOnReplay: false,
                    enableCORS: true,
                    debugMode: dbug == 3,
                    debugLevel: (dbug == 3) ? 2 : 0,
                    autoMute: false,
                }

                $.log("Rebuilding player");

                kWidget.destroy(playerId);
                kWidget.embed({
                    'targetId': playerId,
                    'wid': '_' + kalturaId,
                    'uiconf_id': kalturaUi,

                    'flashvars': flashvars,
                });

                enablePlaylist();
            }


            function rebuildPlayer() {

                var kdp = $('#' + playerId).get(0);

                //get next video object
                var video = videoPlaylist[videoNext];

                var tinythumb = video.thumbnail;
                var bigthumb = tinythumb.replace("scald_playlist", "scald-drxmin-thumb");
                video.thumbnail = bigthumb;

                //get old video sources and update them with the next video object
                var sources = mediaProxy.sources;

                sources[0].src = "http://v1.rxwiki.com/" + video.uuid + ".ogg";
                sources[1].src = "http://v1.rxwiki.com/" + video.uuid + ".webm";
                sources[2].src = "http://v1.rxwiki.com/" + video.uuid + ".mp4";

                //update the new video palyer sources, thumbnail, description
                mediaProxy.sources = sources;
                mediaProxy.entry.thumbnailUrl = bigthumb;
                mediaProxy.entry.description = video.description;
                flashvars.mediaProxy = mediaProxy;

                // hide the old next video element
                $("#next-" + videoNext).css({
                    display: "none"
                });

                //make the dropdown button incative
                $("#playlist-btn").removeClass('active');

                //hide dropdown in case it's open
                $("#player-vjs-playlist").hide();

                //reset videoNext
                updateNextVideo();

                // show the current next video element
                $("#next-" + videoNext).css({
                    display: "block"
                });



                if (adLimit <= 0) {
                    adReplay = false;
                    flashvars.vast = {};

                    kdp.sendNotification('cleanMedia');
                    kdp.setKDPAttribute("vast", "prerollUrl", "");
                    kdp.setKDPAttribute("flashvars", "adsOnReplay", adReplay && !playlistEnded());

                    $.log("Ads play count reached their limit");

                    initiateNextVideo();
                    initiatePlaylistDropdown();


                } else if (playlist)
                    enablePlaylist();

                $.log("Rebuilding player");

                kdp.sendNotification('cleanMedia');
                kdp.sendNotification('changeMedia', {
                    'mediaProxy': mediaProxy
                });
            }

            function rebuildNextVideoElement() {
                // update next video
                var counter = 1;
                $("#next-parent > div").css({
                    display: "none"
                });
                for (var val in videoPlaylist) {

                    // update next video
                    if (videoNext == val) {
                        // show the current next video element
                        $("#next-" + videoNext).css({
                            display: "block"
                        });
                    }
                    counter += 1;
                }
            }



            function rebuildCurrentVideoElement(currentVideo) {

                //overload to default next video
                if (currentVideo == null || currentVideo === undefined)
                    currentVideo = videoNext;

                var str = "";
                str += '<div class="now-playing-tab">Now Playing</div>';
                str += '<div class="np-descript">' + videoPlaylist[currentVideo].description + '</div>';
                $("#now-playing").html(str);
            }


            function initiateVideo(videoId) {

                //default to the global nextVideo
                if (videoId === undefined)
                    videoId = videoNext;

                //hide current element
                $elem = $("#player-vjs-playlist");
                if ($elem.css("display") == "block")
                    $elem.hide();

                $.log("Next video: " + videoId);

                //set the next video to be played
                //either from the next button, the playlist dropdown, or through an automatic switch on video completion
                videoNext = videoId;

                //disable ad skipping if video is rebuilt
                faillock = 0;
            }


            function initiateNextVideo() {

                // unbind the click event first because kWidget will reinitiate (bind an extra click event)
                // this function each time it is loaded
                $("#next-parent > div").unbind("click");
                $("#next-parent > div").bind("click", function() {

                    rebuildCurrentVideoElement();
                    rebuildNextVideoElement();
                    initiateVideo();
                    // reinitiate the video player to switch videos
                    rebuildPlayer();
                });
            }


            function initiatePlaylistDropdown() {

                // get dropdown element
                $elem = $("#player-vjs-playlist");

                // attach a click event to each playlist video that will reload the kWidget
                $elem.children().each(function() {

                    var id = $(this).attr("id");
                    if (id.match(/video(\d+)/) != null) {
                        $(this).click(function() {

                            rebuildCurrentVideoElement(id);
                            rebuildNextVideoElement();
                            initiateVideo(id);
                            // reinitiate the video player to switch videos
                            rebuildPlayer();
                        });
                    }
                });

                // unbind the click event first because kWidget will reinitiate (bind an extra click event)
                // this function each time it is loaded
                $('#playlist-btn').unbind("click");

                $('#playlist-btn').bind("click", function() {

                    var kdp = $('#' + playerId).get(0);

                    // hide dropdown
                    if ($elem.css("display") == 'block') {

                        // force autoplay
                        if (!kWidget.isMobileDevice())
                            kdp.sendNotification("doPlay");

                        $('#playlist-btn').addClass('active');
                        $elem.css({
                            display: "none"
                        });
                        $elem.children().css({
                            display: "none"
                        });

                        // show dropdown
                    } else {

                        kdp.sendNotification('doPause');
                        $('#playlist-btn').removeClass('active');
                        $elem.css({
                            display: "block"
                        });
                        $elem.children().css({
                            display: "block"
                        });
                    }
                });
            }

            function disablePlaylist() {

                $('#playlist-btn').unbind("click").hide();
                $("#next-parent > div").unbind("click").hide();

                $('#playlist-btn').hide();
                $("#next-parent > div").css({
                    display: "none"
                });

                var $elem = $("#now-playing .np-descript");
                if ($elem.html() !== undefined && $elem.html() != adNowPlayingText)
                    oldNowPlayingText = $elem.html(); //save old html

                $elem.html(adNowPlayingText); //update to custom set html
            }

            function enablePlaylist() {

                if (playlist && !kWidget.isMobileDevice()) {
                    initiateNextVideo();
                    initiatePlaylistDropdown();
                    rebuildNextVideoElement();
                    $('#playlist-btn').show();
                    $("#now-playing .np-descript").html(oldNowPlayingText); //update to custom set html
                }
            }

            function appendAdsVAST(obj, ad) {


                if (enablePreroll) {

                    var temp = {
                        "prerollUrl": ad.link,
                        "prerollUrlJs": ad.link, //enable support for mobile ads
                        "numPreroll": "1",
                        "prerollStartWith": "1",
                        "prerollInterval": "1",
                        "preSequence": "1",
                    }

                } else if (enablePostroll) {
                    var temp = {
                        "postrollUrl": ad.link,
                        "postrollUrlJs": ad.link, //enable support for mobile ads
                        "numPostroll": "1",
                        "postrollStartWith": "1",
                        "postrollInterval": "1",
                        "postSequence": "1",
                    }
                }
                for (var val in temp)
                    obj[val] = temp[val];

                return obj;
            }

            function playlistEnded() {

                // false if not a playlist page
                if (!playlist)
                    return false;

                // false if played entire playlist
                var autoPlay = playlistLimit <= 0;
                $.log("\n\n\nPlaylist autoplay is disabled: " + autoPlay + " | remaining: " + playlistLimit);

                return autoPlay;
            }

            function sendImpression(ad) {

                if (hardcodedUrl)
                    $.log("\n\n\nCan't trigger DFP impression on hardcoded ad urls");
                else if (options.testMobileAdUrl !== undefined)
                    $.log("\n\n\nCan't trigger DFP impression on hardcoded mobile ad urls");
                else if (ad.link != "") {
                    $("body").append("<img src='" + ad.link + "' style='display:none;'>");
                    $.log("\n\n\nDFP impression triggered: " + ad.link);
                } else
                    $.log("\n\n\nDFP impression not triggered, this provider doesn't support it");
            }

            function sendError(ad) {

                if (hardcodedUrl)
                    $.log("\n\n\nCan't trigger DFP error on hardcoded ad urls");
                else if (options.testMobileAdUrl !== undefined)
                    $.log("\n\n\nCan't trigger DFP error on hardcoded mobile ad urls");
                else if (ad.link != "") {
                    $("body").append("<img src='" + ad.link + "' style='display:none;'>");
                    $.log("\n\n\nDFP error triggered: " + ad.link);
                } else
                    $.log("\n\n\nDFP error not triggered, this provider doesn't support it");
            }

            function buildVideoPlayer(ad) {


                if (ad) {

                    // $.log("VAST url: "+ad.link);
                    $.log("Provider: " + ad.type);
                    if (!hardcodedUrl && options.testMobileAdUrl !== undefined) {
                        $.log("Ad impression uri: " + ad.impression);
                        $.log("Ad error uri: " + ad.error);
                    }

                    // if the ad is from our tested providers
                    if (false) { //disbale doubleclick for now

                        flashvars = {
                            "doubleClick": {
                                "plugin": true,
                                "path": "http://cdnbakmi.kaltura.com/content/uiconf/ps/veria/kdp3.9.1/plugins/doubleclickPlugin.swf",
                                "adTagUrl": adTagUrl,
                                "disableCompanionAds": true,
                            },
                        }

                    } else {

                        flashvars = {

                            "vast": {
                                "plugin": true,
                                "position": "before",
                                "timeout": "30",
                                "relativeTo": "PlayerHolder",
                            },

                            "skipBtn": {
                                "skipOffset": "60",
                                "label": "Skip Ad"
                            },

                            "adsOnReplay": adReplay && !playlist,
                            "inlineScript": false,
                            "ForceFlashOnDesktopSafari": false,
                        }

                        flashvars.vast = appendAdsVAST(flashvars.vast, ad);
                    }

                    if (ad.link == "") {
                        flashvars = {};
                        $.log("Ads link empty. Disabling ads.");
                    }

                    if (!enableAds) {

                        flashvars = {};
                        $.log("Ads disabled in settings.");

                    } else if (kWidget.isMobileDevice() && !enableAdsMobile) {

                        flashvars = {};
                        $.log("Mobile ads disabled.");

                    } else if (kWidget.isMobileDevice() && enableAdsMobile && !$.arrayContains(supportedProvidersMobile, ad.type)) {
                        flashvars = {};
                        $.log("Only enable supported mobile ad providers. This provider is not supported: " + ad.type);
                    }
                }

                // if ads had been disabled by now and we are on the playlist page
                if (flashvars.vast == {} && playlist)
                    enablePlaylist();


                flashvars.watermark = {
                    "plugin": false,
                    "img": "",
                    "href": "",
                    "cssClass": "topRight"
                }

                // flashvars.forceMobileHTML5 = true;

                mediaProxy.preferedFlavorBR = -1;
                flashvars.mediaProxy = mediaProxy;


                flashvars.controlBarContainer = {
                    "plugin": true,
                    "hover": true
                }

                flashvars.adsOnReplay = adReplay && !playlist;

                flashvars.autoPlay = !kWidget.isMobileDevice();


                flashvars.enableCORS = true;
                flashvars.debugMode = dbug == 3,
                    flashvars.debugLevel = (dbug == 3) ? 2 : 0,
                    flashvars.autoMute = false;
                flashvars.externalInterfaceDisabled = false;

                kWidget.embed({

                    'targetId': playerId,
                    'wid': '_' + kalturaId,
                    'uiconf_id': kalturaUi,


                    'KalturaSupport.LeadWithHTML5': true,
                    'EmbedPlayer.NativeControls': true,
                    'EmbedPlayer.CodecPreference': 'webm',

                    'flashvars': flashvars,
                    'readyCallback': function(playerId) {

                            var kdp = $('#' + playerId).get(0);

                            if (playlist && hardcodedUrl)
                                disablePlaylist();

                            //register an ad click
                            kdp.kBind('adClick', function() {
                                $.gaEvent("ad", "click");
                            });

                            //register player pause
                            kdp.kBind('playerPaused', function() {
                                $.gaEvent("player", "pause");
                            });

                            //register player mute
                            kdp.kBind('mute', function() {
                                $.gaEvent("player", "mute");
                            });

                            //register player quartiles
                            kdp.kBind('firstQuartile', function() {

                                $.gaEvent("player", "quartile", 1);
                            });
                            kdp.kBind('secondQuartile', function() {

                                $.gaEvent("player", "quartile", 2);
                            });
                            kdp.kBind('thirdQuartile', function() {

                                $.gaEvent("player", "quartile", 3);
                            });
                            kdp.kBind('playerPlayEnd', function() {

                                $.gaEvent("player", "quartile", 4);
                            });

                            //initiate click events if we are on a playlist page there is no ad to play
                            if (flashvars == {} && playlist) {
                                initiateNextVideo();
                                initiatePlaylistDropdown();
                            }

                            if (!kWidget.isMobileDevice() && enablePreroll)
                                kdp.sendNotification("doPlay");

                            kdp.kBind('adErrorEvent', function(qPoint) {

                                $.log("\n\n\n\nadErrorEvent\n\n\n\n");
                                faillock = 0;

                                //enable playlist after ad ends/fails
                                enablePlaylist();

                                //record ad as not shown since there was an error
                                sendError(ad);
                                $.gaEvent("error", "adErrorEvent");
                            });
                            kdp.kBind('adLoadError', function(qPoint) {

                                $.log("\n\n\n\adLoadError\n\n\n\n");
                                faillock = 0;
                                adlock = 0;
                                rebuildPlayerWithoutAds();

                                //enable playlist after ad ends/fails
                                enablePlaylist();

                                //record ad as not shown since there was an error
                                sendError(ad);
                                $.gaEvent("error", "adLoadError");
                            });
                            kdp.kBind('mediaError', function(qPoint) {

                                $.log("\n\n\nmediaError\n\n\n");

                                //enable playlist after ad ends/fails
                                enablePlaylist();

                                //record ad as not shown since there was an error
                                sendError(ad);
                                $.gaEvent("error", "mediaError");
                            });
                            kdp.kBind('entryFailed', function(qPoint) {

                                $.log("\n\n\nentryFailed\n\n\n");

                                //enable playlist after ad ends/fails
                                enablePlaylist();

                                //record ad as not shown since there was an error
                                sendError(ad);
                                $.gaEvent("error", "entryFailed");
                            });


                            kdp.kBind('adStart', function(qPoint) {

                                $.log("\n\n\nAd provider begins delivery...");

                                //ads can break and trigger false error events when testing hardcoded urls
                                if (options.testMobileAdUrl === undefined) {
                                    faillock = 1;
                                    setTimeout(function() {

                                        if (faillock == 1) {

                                            $.log("Ad took more than " + adTimeout + " milliseconds, cut to content video");

                                            if (playlist && enablePostroll) {
                                                rebuildCurrentVideoElement();
                                                rebuildNextVideoElement();
                                                rebuildPlayer();
                                            } else {
                                                adlock = 0;
                                                rebuildPlayerWithoutAds();
                                            }
                                            //enable playlists in case the ad times out
                                            enablePlaylist();

                                            $.gaEvent("error", "adTimeout");
                                            //record ad as not shown since there was an error
                                            sendError(ad);
                                        }

                                    }, adTimeout);
                                }
                            });

                            kdp.kBind('onAdPlay', function(start) {

                                adLimit -= 1;
                                $.log("Possible ads remaining: " + adLimit);

                                $.log("Ad started playing");
                                //disable timeout that will rebuild the video player
                                faillock = 0;

                                $.gaEvent("impression", ad.type);

                                //record ad as shown if it begins playing
                                sendImpression(ad);


                                //disable playlist until ad finishes
                                if (playlist)
                                    disablePlaylist();
                            });


                            // fire when ad is finished playing
                            if (enablePreroll)
                                kdp.kBind('adEnd', function(qPoint) {

                                    adlock = 1;
                                    faillock = 0;
                                    $.log("Preroll Ad ended");

                                    $.gaEvent("ad", "ad ended");

                                    //enable playlist after ad ends/fails
                                    enablePlaylist();
                                });

                            kdp.kBind('playbackComplete', function(eventData) {

                                if (enablePreroll) {


                                    if (adLimit <= 0) {
                                        adReplay = false;

                                        kdp.setKDPAttribute("flashvars", "vast", {});
                                        kdp.setKDPAttribute("flashvars", "adsOnReplay", adReplay && !playlistEnded());

                                        $.log("Ads play count reached their limit");
                                    }

                                    //ad finished playing, and then the video
                                    if (adlock == 2) {
                                        $.log("Ad and video finished. Rebuilding player");

                                        adlock = 0;

                                        // block autoplay if the playlist has reached its limit
                                        if (playlistEnded())
                                            return;

                                        playlistLimit -= 1;

                                        //update current video element
                                        rebuildCurrentVideoElement();
                                        rebuildNextVideoElement();
                                        rebuildPlayer();

                                        $.gaEvent("ad", "ad and video ended with an ad");
                                        return;

                                        //there was no ad on this page, so only the video played
                                    } else if (adlock == 0) {
                                        $.log("Video finished. Rebuilding player");

                                        adlock = 0;


                                        playlistLimit -= 1;

                                        // block autoplay if the playlist has reached its limit
                                        if (playlistEnded())
                                            return;

                                        //update current video element
                                        rebuildCurrentVideoElement();
                                        rebuildNextVideoElement();
                                        rebuildPlayer();

                                        $.gaEvent("ad", "video ended without an ad");
                                        return;

                                        //the ad finished
                                    } else if (adlock == 1) {

                                        adlock = 2;
                                        $.log("Ad finished");
                                        if (playlist && !kWidget.isMobileDevice())
                                            enablePlaylist();
                                    }


                                } else if (enablePostroll) {


                                }

                            });

                            kdp.addJsListener('doPlay', function() {

                                if (adlock == 0)
                                    enablePlaylist();
                            });

                            // fire when ad starts playing
                            if (enablePostroll)
                                kdp.kBind('adEnd', function(qPoint) {
                                    $.log("Postroll Ad ended");
                                });

                        } //ready callback ended
                });
            }

            function getAdType(adUrl) {

                for (var index in supportedProviders.url) {

                    var url = supportedProviders.url[index];
                    if (adUrl.indexOf(url) != -1)
                        return supportedProviders.type[index];
                }
                return "other";
            }

            function sortAdTypes(data) {

                $xml = $(data);
                var types = [];

                $xml.find("Ad").each(function() {

                    var link = $(this).find("VASTAdTagURI");
                    link = link.text();

                    var impression = $(this).find("Impression").text();
                    var error = $(this).find("Error").text();

                    var type = getAdType(link);

                    if ($.arrayContains(supportedProvidersNested, type)) {

                        types.push({
                            link: link,
                            error: error, //error is empty for this provider
                            impression: impression,
                            type: type,
                            nested: true
                        });
                        return types;

                    } else if (kWidget.isMobileDevice() && $(this).find("AdSystem").text() == "BrightRoll") {

                        types.push({
                            link: adTagUrl,
                            error: error, //error is empty for this provider
                            impression: impression,
                            type: "btrll",
                            nested: false
                        });
                        return types;

                    } else {

                        types.push({
                            link: link,
                            error: error,
                            impression: impression,
                            type: type,
                            nested: false
                        });
                    }

                });
                if (types.length > 0)
                    return types;
                else
                    return false;
            }

            function nestedAjax(ad) {

                nestedAjaxHelper(ad, ad);
            }

            function nestedAjaxHelper(ad, original) {

                $.log("Nested ad found: <a href='" + ad.link + "'>link</a>");

                $.ajax({
                    type: "GET",
                    dataType: "XML",
                    url: ad.link,
                    success: function(data) {

                        var linkNew = $(data).find("VASTAdTagURI");

                        $.log("Nested Ad XML: <input type='button' class='clipboard-button' data-info='" + new XMLSerializer().serializeToString(data) + "' value='copy to clipboard'> ");

                        //found the mediafile
                        if (!linkNew.length || !linkNew.text() || linkNew.text() == "") {

                            $.log("Nested VAST link: <input type='button' class='clipboard-button' data-info='" + ad.link + "' value='copy to clipboard'> ");

                            globallock = 0;
                            nestedXML = new XMLSerializer().serializeToString(data);
                            var impression = $(this).find("Impression").text();
                            var error = $(this).find("Error").text();

                            $.log("Found the ad at: <a href='" + ad.link + "'>link</a>");

                            nestedObject = {
                                link: ad.link,
                                error: original.error, //error is empty for this provider
                                impression: original.impression,
                                type: original.type
                            };

                            //there is still nested XML, we need to go deeper!
                        } else {
                            $.log("Nested VAST link: <input type='button' class='clipboard-button' data-info='" + linkNew.text() + "' value='copy to clipboard'> ");

                            $.log("Nesting at: <a href='" + linkNew.text() + "'>link</a>");
                            ad = {
                                link: linkNew.text(),
                                error: ad.error, //error is empty for this provider
                                impression: ad.impression,
                                type: ad.type
                            }
                            nestedAjaxHelper(ad, original);
                        }
                    },
                    error: function(MLHttpRequest, textStatus, errorThrown) {

                        $.log("DFP url returned an empty/corrupted/broken response. Initiating the player without an ad");
                        nestedObject = false;
                    }
                });
            }


            function logAdXML(ad) {

                if (dbug == 3 && hardcodedUrl)
                    $.ajax({
                        type: "GET",
                        dataType: "XML",
                        url: ad.link,
                        success: function(data) {

                            $.log("Ad    XML: <input type='button' class='clipboard-button' data-info='" + new XMLSerializer().serializeToString(data) + "' value='copy to clipboard'> ");
                            $.log("<a target='_blank' href='https://developers.google.com/interactive-media-ads/docs/sdks/flash/vastinspector'>Google VAST Inspector - FLASH</a>");
                            $.log("<a target='_blank' href='https://developers.google.com/interactive-media-ads/docs/sdks/html5/vastinspector'>Google VAST Inspector - HTML5</a>");
                        },
                        error: function(MLHttpRequest, textStatus, errorThrown) {

                            $.log(errorThrown);
                        }
                    });
            }

            function selectAdType(ad) {

                if (ad == false)
                    return false;

                if (ad.length == 1) {
                    $.log("One provider found in the ad response. Note that the ad XML might be empty in which case no ads will play");

                    if (ad.link == "")
                        return false;
                    return ad[0];
                } else {
                    $.log("Multiple providers found in the ad response. Picking one according to set preferences");
                    for (var providerId in supportedProviders.url) {
                        for (var typeId in ad) {

                            var provider = supportedProviders.url[providerId];
                            var type = ad[typeId];

                            if (type.type == provider)
                                return type;
                        }
                    }
                }
                return false;
            }

            if (hardcodedUrl) {

                var type = getAdType(hardcodedAdTagUrl);

                var ad = {
                    link: hardcodedAdTagUrl,
                    error: "not available for hardcoded testing urls", //error is empty for this provider
                    impression: "not available for hardcoded testing urls",
                    type: type,
                    nested: false
                }

                $.log("Ad is not nested - we don\'t have hardcoded testing support for nested ads");

                logAdXML(ad); //this makes an extra call to the ad url to display XML when dbug is enabled

                //add debugging buttons for copying tags to clipboard
                $.log("VAST url: <input type='button' class='clipboard-button' data-info='" + ad.link + "' value='copy to clipboard'> ");
                if (!hardcodedUrl)
                    $.log("DFP  link: <input type='button' class='clipboard-button' data-info='" + adTagUrl + "' value='copy to clipboard'> ");
                $.log("Page url: <input type='button' class='clipboard-button' data-info='" + document.location + "' value='copy to clipboard'> ");
                $.log("Media url: <input type='button' class='clipboard-button' data-info='" + videoUrl + "' value='copy to clipboard'> ");

                buildVideoPlayer(ad);

            } else {

                $.ajax({
                    type: "GET",
                    dataType: "XML",
                    url: adTagUrl,
                    success: function(data) {

                        var ad = sortAdTypes(data);

                        if (ad) {
                            $.log("Providers available in this ad response");
                            $.log(ad);
                        } else
                            $.log("Ad is empty");
                        $.log("DFP XML: <input type='button' class='clipboard-button' data-info='" + new XMLSerializer().serializeToString(data) + "' value='copy to clipboard'> ");


                        if (ad && ad.nested) {

                            $.log("DFP VAST uri: <input type='button' class='clipboard-button' data-info='" + ad[0].link + "' value='copy to clipboard'> ");
                            $.log('Ad is nested');

                            globallock = 1;
                            nestedAjax(ad[0]);

                            setTimeout(function() {
                                if (globallock == 0) {
                                    globallock = 1;

                                    if (nestedObject) {
                                        // at this point `nestedObject` is set (check nestedAjax to see what sets it)
                                        $.log(nestedObject);

                                        //add debugging buttons for copying tags to clipboard
                                        $.log("VAST uri: <input type='button' class='clipboard-button' data-info='" + nestedObject.link + "' value='copy to clipboard'> ");
                                        if (!hardcodedUrl)
                                            $.log("DFP   uri: <input type='button' class='clipboard-button' data-info='" + adTagUrl + "' value='copy to clipboard'> ");
                                        $.log("Ad    XML: <input type='button' class='clipboard-button' data-info='" + nestedXML + "' value='copy to clipboard'> ");
                                        $.log("Page  url: <input type='button' class='clipboard-button' data-info='" + document.location + "' value='copy to clipboard'> ");
                                        $.log("Video url: <input type='button' class='clipboard-button' data-info='" + videoUrl + "' value='copy to clipboard'> ");
                                    }
                                    // skip ads if there are no ads in the XML response
                                    buildVideoPlayer(nestedObject);
                                }
                            }, 500);

                        } else {

                            $.log('Ad is not nested');

                            ad = selectAdType(ad);

                            logAdXML(ad); //this makes an extra call to the ad url to display XML when dbug is enabled

                            //add debugging buttons for copying tags to clipboard
                            $.log("VAST uri: <input type='button' class='clipboard-button' data-info='" + ad.link + "' value='copy to clipboard'> ");
                            if (!hardcodedUrl)
                                $.log("DFP  uri: <input type='button' class='clipboard-button' data-info='" + adTagUrl + "' value='copy to clipboard'> ");
                            $.log("Page  uri: <input type='button' class='clipboard-button' data-info='" + document.location + "' value='copy to clipboard'> ");
                            $.log("Video uri: <input type='button' class='clipboard-button' data-info='" + videoUrl + "' value='copy to clipboard'> ");

                            buildVideoPlayer(ad);
                        }
                    },
                    error: function(MLHttpRequest, textStatus, errorThrown) {

                        $.log("DFP url returned an empty/corrupted/broken response. Initiating the player without an ad");
                        buildVideoPlayer(false);
                    }
                });
            }

        } //end kalturaPlayer

})(jQuery); < /script> < script >
    /*
    Initiate the kaltura player
    */
    $("#videoPlayer").kalturaPlayer({

        //kaltura server settings
        kalturaId: 101,
        kalturaUi: 23448200,

        //debugging: 0|1|2|3
        //0 - debugging off
        //1 - debug info printed to console
        //2 - debug info printed below the video and to the console
        //3 - debug info printed below the video, to the console and Kalturas debug info printed to console
        //4 - everything from #3 and all the concole logs from other files will be printed into the dbug box. haven't tested this one well
        dbug: 0,

        //video settings
        videoUrl: "http://v1.rxwiki.com/59007cfc-efe5-431f-b86e-48387f0abde2",
        videoThumbnailUrl: "http://www.rxwiki.com/sites/files/styles/scald-drxmin-thumb/public/rxwiki/medicationthumbnail_0.jpg",
        videoName: "Abilify",
        videoDescription: "",
        videoDuration: "57",

        //ads settings
        enableAds: true,
        enableAdsMobile: true, //need enableAds=true before enabling mobile ads

        adTagUrl: "http://pubads.g.doubleclick.net/gampad/ads?sz=560x315&iu=/14312752/FlashPreRoll&impl=s&gdfp_req=1&env=vp&output=xml_vast2&unviewed_position_start=1&url=http%3A%2F%2Fwww.rxwiki.com%2Fabilify&correlator=1457843385&description_url=http%253A%252F%252Fwww.rxwiki.com%252Fabilify&cust_params=PR_URL%3Dfde69917-91bf-4b2b-8095-dcb51f4a382e%26PR_PageTyp%3Drx_brand%26PR_Cndtns%3DAutism+Spectrum+Disorders%2CBipolar+Disord",
        adType: "pre", // options: pre | mid[not implemented] | post
        adTimeout: 12500, //wait this long on an ad to load, relad player if it doesn't
        adReplay: true, //check true if you want ads when the user clicks "replay" on the video
        adNowPlayingText: "Advertisement",

        // uncomment to test mobile ads
        //android
        // testMobileAdUrl : "http://mobile.btrll.com/vast?siteid=3868267&it=w&platform=android&n=[timestamp]&br_ip=[ipaddress]&br_pageurl=[pageurl]&br_osvers=[osversion]&br_carrier=[cellcarrier]&br_ua=[useragent]&br_network=[networkconnectiontype]&br_nplat=[nplat]&br_nplon=[nplon]",
        //ios
        // testMobileAdUrl : "http://mobile.btrll.com/vast?siteid=3868267&it=w&platform=ios&n=[timestamp]&br_ip=[ipaddress]&br_pageurl=[pageurl]&br_osvers=[osversion]&br_carrier=[cellcarrier]&br_ua=[useragent]&br_network=[networkconnectiontype]&br_nplat=[nplat]&br_nplon=[nplon]",

        videoPlaylist: {
            'video1': {
                'uuid': '59007cfc-efe5-431f-b86e-48387f0abde2',
                'title': 'Abilify',
                'description': 'Pharmacist Christine Wicke PharmD, BCPS overviews the uses and common side effects of Abilify',
                'thumbnail': 'http://www.rxwiki.com/sites/files/styles/scald_playlist/public/rxwiki/medicationthumbnail_0.jpg'
            },
            'video2': {
                'uuid': 'ab16499f-8222-4e78-9d6c-d67c2167654d',
                'title': 'Atypical antipsychotics',
                'description': 'Pharmacist Trey Robinson, PharmD summarizes the uses, common side effects, and warnings for the Atypical antipsychotics class of medications',
                'thumbnail': 'http://www.rxwiki.com/sites/files/styles/scald_playlist/public/rxwiki/medications_17.jpg'
            }
        }, //set playlist url object if it exists
        adLimit: Object.keys({
            'video1': {
                'uuid': '59007cfc-efe5-431f-b86e-48387f0abde2',
                'title': 'Abilify',
                'description': 'Pharmacist Christine Wicke PharmD, BCPS overviews the uses and common side effects of Abilify',
                'thumbnail': 'http://www.rxwiki.com/sites/files/styles/scald_playlist/public/rxwiki/medicationthumbnail_0.jpg'
            },
            'video2': {
                'uuid': 'ab16499f-8222-4e78-9d6c-d67c2167654d',
                'title': 'Atypical antipsychotics',
                'description': 'Pharmacist Trey Robinson, PharmD summarizes the uses, common side effects, and warnings for the Atypical antipsychotics class of medications',
                'thumbnail': 'http://www.rxwiki.com/sites/files/styles/scald_playlist/public/rxwiki/medications_17.jpg'
            }
        }).length, //set the limit to the number of videos in the playlist
    });
