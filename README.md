# Kaltura Player
  
Integrated the Kaltura Video Platform into the main company website to service video ads. To play ads you need both the video player and the ad provider tocomply with the accepted ad format (VAST/VPAID). 

And ofcourse, no-one actually follows it 100% and some of the incoming ads were breaking the player.The challenge there was to expand the player's functionality by catching errors, while sifting through tons of documentation that would be either inconsistent or inclomplete.

The other challenge was to make the player work with custom video URLs, since the available ad plugins did not support that. So I had to use a generic ad plugin and expand itsfunctionality to support waterfall ads and ad errors.

Later, I rebuilt the workflow of the platform to improve speed and reduce the server load.
