var casper = require('casper').create();
casper.options.waitTimeout = 100000;
var links;
function getLinks() {
    return  document.querySelectorAll('a');
}

casper.start('https://dealer2.xtime.com/panama/common/login/postLogin.do', function() {
    this.echo(this.getTitle());
    this.fill('form[name="LoginForm"]', { "userName.input": 'rschrader', "password.input" : 'Service6' }, true);
});
casper.thenOpen('https://dealer2.xtime.com/panama/business/preLocationSwitch.do?OLD_LOCATION_SWITCHER_ENABLED=true&pagerPage=0&maxPage=500', function() {
   links = this.evaluate(getLinks);
   var i = 0;
    this.repeat(links.length, function() {
        try {
           this.click('a');
           this.waitFor(function check() {
    			return this.evaluate(function() {
        			return document.querySelectorAll('#busTitle').length > 0;
    			});
			}, function then(){				
				this.echo(this.getHTML('#busTitle')); // => 'Plop'    			
			});            
        } catch(err) {
            console.log(err);
        } finally{
        	i++;
        }
    });
});

casper.run(function() {    
    phantom.exit();    
});
