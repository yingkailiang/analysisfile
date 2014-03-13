app = angular.module 'options', ['ngSanitize', 'ui.router', 'ui.bootstrap']

app.config ['$stateProvider', '$urlRouterProvider', '$compileProvider', ($stateProvider, $urlRouterProvider, $compileProvider) ->
    $stateProvider
        .state 'main',
            abstruct: true
            template: '<ui-view/>'
            resolve:
                history: asyncHistory
            controller: 'mainCtrl'
        .state 'main.index',
            url: '^/index'
            templateUrl: 'partials/index.html'
            controller: 'indexCtrl'
        .state 'main.cards',
            url: '^/cards/:host?sortBy'
            templateUrl: 'partials/cards.html'
            controller: 'cardsCtrl'
            
    $urlRouterProvider
        .when '', '/index'

    $compileProvider.aHrefSanitizationWhitelist /^\s*(https?|ftp|file|chrome-extension):\//
    $compileProvider.imgSrcSanitizationWhitelist /^\s*(https?|ftp|file|chrome):|data:image\//
]

asyncHistory = ['$rootScope', '$q', ($rootScope, $q) ->
    deferred = $q.defer()
    chrome.history.search {text: '', maxResults: 100000, startTime: 0}, (results) ->
        $rootScope.$apply ->
            deferred.resolve results
    return deferred.promise
]

app.controller 'rootCtrl', [ '$scope', ($scope) ->
    $scope._ = _
    $scope.$ = $
    $scope.console = console
]

app.controller 'mainCtrl', ['$state', '$scope', 'history', ($state, $scope, history) ->
    $scope.history = history.map (item) ->
        card = _.clone item        
        a = document.createElement 'a'
        a.href = item.url
        card.host = a.host
        return card
        
    $scope.bundles = _.groupBy $scope.history, (card) -> card.host
    
    markedUrls = localStorage.getItem 'markedUrls'
    markedUrls = JSON.parse if markedUrls? then markedUrls else '[]'
    setMarked = (card) ->
        index = _.indexOf markedUrls, card.url, true
        return if index != -1
        index = _.sortedIndex markedUrls, card.url
        markedUrls.splice index, 0, card.url
        localStorage.setItem 'markedUrls', JSON.stringify markedUrls
    clearMarked = (card) ->
        index = _.indexOf markedUrls, card.url, true
        return if index == -1
        markedUrls.splice index, 1
        localStorage.setItem 'markedUrls', JSON.stringify markedUrls
    $scope.isMarked = (card) ->
        index = _.indexOf markedUrls, card.url, true
        return if index != -1 then true else false
    $scope.toggleMarked = (card) ->
        if not $scope.isMarked card
            setMarked card
        else
            clearMarked card

    acceptableUrls = localStorage.getItem 'acceptableUrls'
    $scope.acceptableUrls = JSON.parse if acceptableUrls then acceptableUrls else '{}'

    acceptableTitles = localStorage.getItem 'acceptableTitles'
    $scope.acceptableTitles = JSON.parse if acceptableTitles then acceptableTitles else '{}'

    $scope.acceptableHost = localStorage.getItem 'acceptableHost'
]

app.controller 'indexCtrl', ['$state', '$scope', 'keybind', ($state, $scope, keybind) ->
    $scope.hosts = hosts = _.sortBy _.keys($scope.bundles), (host) -> -1 * $scope.bundles[host].length
    
    $scope.$watch 'acceptableHost', (newValue, oldValue) ->
        localStorage.setItem 'acceptableHost', newValue
        $scope.hosts = _.filter hosts, (host) ->
            return true unless $scope.acceptableHost
            re = new RegExp $scope.acceptableHost
            return host.match re

    keybindListener = keybind $scope, 'hosts', ->
        $state.transitionTo 'main.cards', {host: $scope.selected} if $scope.selected?

    $scope.$on '$stateChangeStart', ->
        document.removeEventListener 'keydown', keybindListener, true
]

app.controller 'cardsCtrl', ['$state', '$stateParams', '$scope', '$sce', 'keybind', ($state, $stateParams, $scope, $sce, keybind) ->
    {host, sortBy} = $stateParams
    $scope.host = host
    $scope.cards = cards = _.uniq $scope.bundles[host], false, (card) -> card.title or card.url

    $scope.current = null
    $scope.getCurrentUrl = (card) -> $sce.trustAsResourceUrl if $scope.current? then $scope.current.url else ''

    $scope.onCardClick = (card, event) ->
        if event.metaKey or event.ctrlKey
            chrome.tabs.create {url: card.url}
        else if event.altKey
            $scope.toggleMarked card
        else
            open card

    open = (card) ->
        $scope.current = $scope.selected = card

    filterCards = ->
        _cards = cards
        _cards = _.filter _cards, (card) ->
            return true unless $scope.acceptableUrl
            re = new RegExp $scope.acceptableUrl
            return card.url.match re        
        _cards = _.filter _cards, (card) ->
            return true unless $scope.acceptableTitle
            return false unless card.title
            re = new RegExp $scope.acceptableTitle
            return card.title.match re
        $scope.cards = _cards

    $scope.$watch 'acceptableUrl', (newValue, oldValue) ->
        if newValue != $scope.acceptableUrls[$scope.host]
            $scope.acceptableUrls[$scope.host] = newValue
            localStorage.setItem 'acceptableUrls', JSON.stringify $scope.acceptableUrls
        filterCards()
    $scope.acceptableUrl = $scope.acceptableUrls[$scope.host]

    $scope.$watch 'acceptableTitle', (newValue, oldValue) ->
        if newValue != $scope.acceptableTitles[$scope.host]
            $scope.acceptableTitles[$scope.host] = newValue
            localStorage.setItem 'acceptableTitles', JSON.stringify $scope.acceptableTitles
        filterCards()
    $scope.acceptableTitle = $scope.acceptableTitles[$scope.host]

    keybindListener = keybind $scope, 'cards', ->
        $scope.current = $scope.selected if $scope.selected?
    keybindListenerExtra = (event) ->
        return if event.target.tagName.toLowerCase() != 'body'
        switch event.which
            when 77 #m
                $scope.$apply ->
                    $scope.toggleMarked $scope.selected
            when 73 #i
                $state.transitionTo 'main.index'
            when 86 #v
                chrome.tabs.create {url: $scope.selected.url} if $scope.selected?
    document.addEventListener 'keydown', keybindListenerExtra, true

    $scope.$on '$stateChangeStart', ->
        document.removeEventListener 'keydown', listener, true for listener in [keybindListener, keybindListenerExtra]
]

app.factory 'keybind', ['$timeout', ($timeout) ->
    (scope, name, onenter) ->
        scope.selected = null
        listener = (event) ->
            return if event.target.tagName.toLowerCase() != 'body'
            items = scope[name]
            scope.$apply ->
                switch event.which
                    when 13, 79 #enter, o
                        onenter?()
                    when 27 #esc
                        scope.selected = null
                    when 78 #n
                        if scope.selected?
                            index = (_.indexOf(items, scope.selected) + 1) % items.length
                            scope.selected = items[index]
                        else
                            scope.selected = items[0]
                    when 80 #p
                        if scope.selected?
                            index = (_.indexOf(items, scope.selected) + items.length - 1) % items.length
                            scope.selected = items[index]
                        else
                            scope.selected = items.slice -1
        document.addEventListener 'keydown', listener, true
        
        scope.$watch 'selected', (newValue, oldValue) ->
            $timeout ->
                selectedObj = $('.selected')
                return if selectedObj.length == 0
                windowTop = $(window).scrollTop()
                windowBottom = windowTop + $(window).height()
                windowHeight = windowBottom - windowTop
                elemTop = selectedObj.offset().top
                elemBottom = elemTop + selectedObj.height()
                elemHeight = elemBottom - elemTop
                if elemTop - elemHeight < windowTop
                    $(window).scrollTop elemTop - elemHeight
                else if elemBottom + elemHeight > windowBottom
                    $(window).scrollTop elemTop - windowHeight + elemHeight * 2

        return listener
]
