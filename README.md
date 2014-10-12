SiteTracker

Should include things such as:

- live current users
- engagement (total cumulative time on site since midnight0
- month high visitors peak
- live urls being hit
- live comparison of mobile v desktop platforms
- total engagement for the day
- live - returning v new customers
- the ability to broadcast a message to users on the site if needed (eg "sale starts in 5 mins!")
- show sales notification in admin in real time via modal
- show user geo location / regions
- live user platforms

** everything needs to be graphed / visusliased

Display should be a cross between hummingbirdstats and dashing .io
- should show an alert / highlighted graph event
- should show an emergency alert if a user has clicked the pay now button on checkout more than twice (N), AND if so, open a Notification window so admin can push a notification to the user to try and help
- should be configurable to some extent so we can add new events to track (eg someone clicking the share button or something)
- based on add to cart v checkout events, we should be showing cart abandonment stats
- the admin alerts (checkout page trouble, and sales notification) should appear on the admin screen no matter what page the admin user is on
- ideally some data is saved, but the system i needs to be as lightweight / server friendly as possible.

http://trackingdashboard.herokuapp.com

Or using Html5 data attribute :

http://stackoverflow.com/questions/16098397/pass-variables-to-javascript-in-expressjs

<div id="graph-area" data-users="<%= JSON.stringify(server_data) %>"></div>

<script type="text/javascript"> var users = $('#graph-area').data('users'); </script>

----------------------------------------------------------------------------------------------------------------

Hi Khalid,

Please find below my thoughts on the remains issues.

-  allowing it to work on multiple individual sites *************
-  needs to track and view inside https (so we can track checkout data)
-  live comparison of mobile v desktop platforms (needs to update in real time) *****
-  engagement should also update real time **************
-  broadcast not working? ***************
-  show sales notification in admin in real time via modal (should show no mater what page they are in, in /admin)
-  show user geo location / regions - should be mapped (see map in the bucket theme) ************
-  live user platforms **************
-  total engagement for the day should show as a graph, similar to the chart beat one (see attached)
need a section (say, 3 x gauge type graphs) with number of users who have added to cart, number of users who have hit checkout page, number of users who have landed on thank you page - from this we generate cart abandonment stats
cart abandonment stats should be saved to the db so we can show historical data
show a graph of the last N days cart abandonment
should show an emergency alert if a user has clicked the pay now button on checkout more than twice (N), AND if so, open a Notification window so admin can push a notification to that user to try and help
needs to be configurable to some extent so we can add new events to track (eg someone clicking the share button or something)
the admin alerts (checkout page trouble, and sales notification) should appear on the admin screen no matter what page the admin user is on
