'use strict';

$.noConflict;

var crawl = function() {
    var templates = {};
    var template = null;
    var storage = chrome.storage.local;

    var options = {
        numUsersToGet: 250,
//        backendUrl: 'http://localhost:8080/okc-superprofile-backend/public/index.php/rawprofile'
        backendUrl: 'http://localhost/p/okc-superprofile-backend/public/index.php/rawprofile'
    };

    var renderTemplate = function(view) {
        var out = Mustache.render(template, view);

        // Common template
        $("body").append(Mustache.render(templates.common));

        $("#okc_crawler > div").html(out);
    };

    var randomRange = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /*
     * Routes
     */
    var routes = {
        /*
         * Runs even if route doesn't exist
         */
        _all: function() {
            template = null;

            $(document).on('click', '#okc_crawler_stop', function() {
                console.log('Clearing...');
                crawl().stop(true);
            });

            crawl().getCrawlData(function(crawlData) {
                if (crawlData.length > 0) {
                    $(".crawldata").show();
                    $(".crawldata .crawl_count").html(crawlData.length);
                }
            });
        },
        /*
         * For valid routes only
         */
        _valid: function(route) {
            if (typeof templates[route] !== "undefined") {
                template = templates[route];
            }
        },
        match: function() {
            renderTemplate({});

            storage.get('toCrawl', function(items) {
                if (items.toCrawl && items.toCrawl.length > 0) {
                    $("#okc_crawler_resume").show();
                }

                console.log("Stored users: " + items.toCrawl.length);
            });

            var getUsers = function(toCrawl)
            {
                $("#okc_crawler_buttons").hide();
                $("#okc_crawler_crawling").show();

                var interval = setInterval(function() {
                    $(document).scrollTop($(document).height());

                    console.log(toCrawl.length);

                    storage.set({toCrawl: toCrawl}, function() {
                        if (toCrawl.length >= options.numUsersToGet) {
                            console.log('Enough!');

                            crawl().start(toCrawl);

                            clearInterval(interval);
                        }

                        $(".match_row").each(function(k,v) {
                            var username = $(".username", v).text().replace(/^\s\s*/, '').replace(/\s\s*$/, '');
                            var replies = $(".stoplight", v);

                            // Only crawl dudes that reply selectively or
                            if ((replies.hasClass('yellow') || replies.hasClass('red')) && toCrawl.indexOf(username) === -1) {
                                toCrawl.push(username);
                            }
                        });
                    });
                }, 2000);
            }

            $(document).on('click', '#okc_crawler_resume', function() {
                storage.get("toCrawl", function(items) {
                    if (items.toCrawl) {
                        getUsers(items.toCrawl);
                    }
                })
            });

            $(document).on('click', '#okc_crawler_crawl', function() {
                getUsers([]);
            });

            $(document).on('click', "#okc_crawler_submit", function() {
                crawl().submit();
            });
        },
        profile: function() {
            storage.get(['crawling','toCrawl'], function(items) {
                if (items.crawling) {
                    renderTemplate({});

                    console.log('toCrawl: '+items.toCrawl.length);

                    setTimeout(function() {
                        console.log('Crawling profile...');
                        crawl().crawl();
                    }, randomRange(1000, 4000));
                }
            });
        }
    };

    /*
     * Outside accessible functions
     */
    return {
        route: function() {
            templates = window.crawl_templates;

            var parser = document.createElement('a');
            parser.href = window.location.href;

            var path = parser.pathname.split("/");
            path = path[1];

            // Run for all routes
            routes._all();

            if (typeof routes[path] !== "undefined") {
                console.log("Route: " + path);
                routes._valid(path);
                routes[path]();
            }
        },
        start: function(toCrawl) {
            var that = this;

            var user = toCrawl.shift();

            storage.set({"toCrawl": toCrawl, crawling: true}, function() {
                console.log('Crawling...');

                that.redirect("profile/" + user);
            });
        },
        stop: function(clearCrawlData) {
            this.setCrawlUsers([]);

            var options = {
                toCrawl: [],
                crawling: false
            };

            if (clearCrawlData === true) {
                options.crawlData = [];
            }

            storage.set(options);

            this.redirect('match');
        },
        crawl: function() {
            var that = this;

            storage.get(['toCrawl','crawling'], function(items) {
                var nextUser = items.toCrawl.shift();
                var thisUser = $("#basic_info_sn").text();

                var href = "";

                if (items.crawling) {
                    var crawlData = {
                        user: thisUser,
                        info: "",
                        percentages: {
                            match: '',
                            friend: '',
                            enemy: ''
                        },
                        stoplight_color: '', // This was nicely on the page
                        essays: [],
                        profile_details: []
                    }

                    /*
                     * Essays
                     */
                    $("div[id^='essay_'].essay").each(function(k,v) {
                        crawlData.essays.push({
                            num: $(this).attr('id'),
                            text: $(this).find('div.text > div').html()
                        });
                    })

                    /*
                     * User Info
                     */
                    crawlData.info = $(".userinfo .details .info").text();

                    /*
                     * Match percentages
                     */
                    var mperElem = $(".userinfo .percentages");

                    crawlData.percentages = {
                        match: $(".match strong", mperElem).text(),
                        friend: $(".friend strong", mperElem).text(),
                        enemy: $(".enemy strong", mperElem).text()
                    };

                    /*
                     * How often they reply / stop light color
                     */

                    var classes = $(".message .icon").attr('class').split(" ");
                    crawlData.stoplight_color = classes[1];

                    /*
                     * Profile details
                     */
                    $("#profile_details dl").each(function(k,v) {
                        var detail = {
                            key: "",
                            value: ""
                        }

                        var key   = $("dt", this);
                        var value = $("dd", this);

                        if ($("dd > span", this).size()) {
                            value = $("dd > span", this);
                        }

                        detail.value = value.text();
                        detail.key = key.text();

                        crawlData.profile_details.push(detail);
                    });

                    that.addCrawlData(crawlData);

                    if (typeof nextUser === "undefined") {
                        that.stop(false);
                        return;
                    } else {
                        href = "profile/" + nextUser;
                    }

                    that.setCrawlUsers(items.toCrawl);
                    that.redirect(href);
                }
            });
        },
        submit: function() {
            var that = this;
            this.getCrawlData(function(crawlData) {
                console.log(crawlData);

                var toSubmit = [];

                while(toSubmit.length < 20) {
                    toSubmit.push(crawlData.shift());
                };

                storage.set({ crawlData: crawlData }, function() {
                    $.post(options.backendUrl, { crawlData: toSubmit }, function(data) {
                        if (crawlData.length > 0) {
                            console.log("To submit: "+crawlData.length);
                            that.submit();
                        } else {
                            //that.stop(true);
                        }
                    });
                })
            })
        },
        redirect: function(url) {
            window.location.href="https://www.okcupid.com/"+url
        },
        setCrawlUsers: function(users) {
            storage.set({ toCrawl: users });
        },
        addCrawlData: function(info) {
            storage.get("crawlData", function(items) {
                var crawlData = items.crawlData;

                if (typeof crawlData === "undefined") {
                    var crawlData = [];
                }

                crawlData.push(info);

                console.log(crawlData);

                storage.set({crawlData: crawlData});
            });
        },
        getCrawlData: function(callback) {
            storage.get('crawlData', function(items) {
                if (typeof items.crawlData === "undefined") {
                    items.crawlData = [];
                }

                callback(items.crawlData);
            })
        }
    }
};

(function($) {
    $(function() {
        window.crawl = crawl;

        crawl().route();
    });
})(jQuery);
