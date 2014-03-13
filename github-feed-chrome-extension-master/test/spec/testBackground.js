(function () {
    describe('Test background.js', function () {
        /**
         * Reset test environment before run tests
         */
        beforeEach(function() {
            // reset localStorage with helper
            setLocalStorageKey('lastEntry', 0);
            setLocalStorageKey('feedUrl', '');
            setLocalStorageKey('testEvent', null);
        });
        it('check if makeBaseAuth creates a valid basic auth', function () {
            var result = makeBaseAuth("testuser", "testpass");

            expect(result).toBe("Basic dGVzdHVzZXI6dGVzdHBhc3M=");
        });
        it('check if saveFeedUrl works', function () {
            feedMock = {current_user_url: "http://example.com"};

            saveFeedUrl(feedMock);

            expect(localStorage['feedUrl']).toBe("http://example.com");
        });
        /**
         * Method for creating event mocks for testing
         *
         * @returns {{created_at: *, actor_attributes: {gravatar_id: *}, type: *, repository: {name: *}, actor: *, url: *, payload: {ref_type: string, target: {login: string}}}}
         */
        function createEvent(eventType, createdAt, reponame, actor, url, gravatarId) {
            var eventMock = {
                created_at: createdAt,
                actor_attributes: {gravatar_id: gravatarId},
                type: eventType,
                repository: {name: reponame},
                actor: actor,
                url: url,
                payload: {
                    ref_type: "repository",
                    target : {
                        login: "testUser"
                    }
                }
            };
            return eventMock;
        }

        /**
         * Method for turn on an event
         */
        function turnOnEvent(eventName) {
            setLocalStorageKey(eventName, true);
        }
        it('check if parsePublicFeed works with createEvents', function () {
            turnOnEvent("CreateEvent");

            // add mock to param list
            var eventList = [];
            eventList.push(createEvent("CreateEvent", "2013-01-01", "repoName", "testActor", "http://example.com", "ah78agf89af"));

            // mock notify method
            notify = function(title, text, url, gravatarId) {
                expect(title).toBe("New repository repoName created");
                expect(text).toBe("testActor has created repoName! Click to get there!");
                expect(url).toBe("http://example.com");
                expect(gravatarId).toBe("ah78agf89af");
            }

            parsePublicFeed(eventList);

            expect(localStorage['lastEntry']).toBe("2013-01-01");
        });
        it('check if parsePublicFeed works with watchEvents', function () {
            turnOnEvent("WatchEvent");

            // add mock to param list
            var eventList = [];
            eventList.push(createEvent("WatchEvent", "2013-01-02", "repoName", "testActor", "http://example.com", "ah78agf89af"));

            // mock notify method
            notify = function(title, text, url, gravatarId) {
                expect(title).toBe("Repository repoName starred");
                expect(text).toBe("testActor has starred repoName in language undefined! Click to get there!");
                expect(url).toBe("http://example.com");
                expect(gravatarId).toBe("ah78agf89af");
            }

            parsePublicFeed(eventList);

            expect(localStorage['lastEntry']).toBe("2013-01-02");
        });
        it('check if parsePublicFeed works with publicEvents', function () {
            turnOnEvent("PublicEvent");

            // add mock to param list
            var eventList = [];
            eventList.push(createEvent("PublicEvent", "2013-01-03", "repoName", "testActor", "http://example.com", "ah78agf89af"));

            // mock notify method
            notify = function(title, text, url, gravatarId) {
                expect(title).toBe("Repository repoName open sourced");
                expect(text).toBe("testActor has open sourced repoName! Click to get there!");
                expect(url).toBe("http://example.com");
                expect(gravatarId).toBe("ah78agf89af");
            }

            parsePublicFeed(eventList);

            expect(localStorage['lastEntry']).toBe("2013-01-03");
        });
        it('check if parsePublicFeed works with followEvent', function () {
            turnOnEvent("FollowEvent");

            // add mock to param list
            var eventList = [];
            eventList.push(createEvent("FollowEvent", "2013-01-04", "repoName", "testActor", "http://example.com", "ah78agf89af"));

            // mock notify method
            notify = function(title, text, url, gravatarId) {
                expect(title).toBe("testActor started following testUser");
                expect(text).toBe("Click to get there!");
                expect(url).toBe("http://example.com");
                expect(gravatarId).toBe("ah78agf89af");
            }

            parsePublicFeed(eventList);

            expect(localStorage['lastEntry']).toBe("2013-01-04");
        });
        it('check, if the getFeedUrl will be called', function () {
            var methodCalled = false;

            // mock method
            getFeedUrl = function() {
                methodCalled = true;
            }

            // run test method
            recoverFromWrongPublicFeed();

            expect(methodCalled).toBe(true);
        });
        it('check if events can be turned on and off', function () {
            var eventName = 'testEvent';
            localStorage.removeItem(eventName)

            // event is turned off
            expect(isEventActive(eventName)).toBe(false);

            // event is turned on
            setLocalStorageKey(eventName, true);
            expect(isEventActive(eventName)).toBe(true);
        });
    });
})();
