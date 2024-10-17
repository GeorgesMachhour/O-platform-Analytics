
(function() {
    let api='https://analytics.nelcomlab.info';
    let clientid='';
    const fullHostname = window.location.host;

    // Split the hostname by '.'
    const parts = fullHostname.split('.');
    let domain = ''
    if (parts.length > 2) {
        const mainDomain = parts[parts.length - 2] + '.' + parts[parts.length - 1];
         domain = mainDomain
    } else {
        domain = fullHostname
    }
    var auth = false;
    function getQueryParams(url) {
        const params = {};
        const parser = document.createElement('a');
        parser.href = url;
        const query = parser.search.substring(1);
        const vars = query.split('&');
        vars.forEach(function(v) {
            const pair = v.split('=');
            params[pair[0]] = decodeURIComponent(pair[1]);
        });
        return params;
    }

    // Find the current script tag
    const scripts = document.getElementsByTagName('script');
    let currentScript;
    for (let i = 0; i < scripts.length; i++) {
        if (scripts[i].src.includes('o-analytics.js')) {
            currentScript = scripts[i];
            break;
        }
    }

    // Extract the `id` parameter
    if (currentScript) {
        const params = getQueryParams(currentScript.src);
        clientid = params['id'];
        
        checkAuth(clientid,domain)
    } 
    // Utility functions
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    
    function checkAuth(Clienttag,domain) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", api+"/checktag", true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) { // 4 means the request is done.
                if (xhr.status === 200) { // 200 means a successful return.
                    var response = JSON.parse(xhr.responseText);
                    if(response && response.data && response.data.tag){
                         auth = true;
                    }else{
                         auth = false;
                    }
                } else {
                     auth = false;
                }
            }
        };
        xhr.send(JSON.stringify(
            {
            tag: Clienttag,
            domain: domain
        }))
    
    }


    function setCookie(name, value, days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    function getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    function getUserAge() {
        var age = getCookie('userAge');
        return age ? age : 'unknown';
    }

    function getUserGender() {
        var gender = getCookie('userGender');
        return gender ? gender : 'unknown';
    }

    function getUserInterests() {
        var interests = getCookie('userInterests');
        return interests ? JSON.parse(interests) : ['unknown'];
    }

   

    function getSessionCampaign() {
        const urlParams = new URLSearchParams(window.location.search);
        const campaign = urlParams.get('utm_campaign') || 'default_campaign';
        return campaign;
    }

    function getDeviceType() {
        if (/Mobi|Android/i.test(navigator.userAgent)) {
            return 'mobile';
        }
        return 'desktop';
    }

    function getOS() {
        var userAgent = window.navigator.userAgent,
            platform = window.navigator?.userAgentData?.platform || window.navigator.platform,
            macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
            windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
            iosPlatforms = ['iPhone', 'iPad', 'iPod'],
            os = null;

        if (macosPlatforms.indexOf(platform) !== -1) {
            os = 'Mac OS';
        } else if (iosPlatforms.indexOf(platform) !== -1) {
            os = 'iOS';
        } else if (windowsPlatforms.indexOf(platform) !== -1) {
            os = 'Windows';
        } else if (/Android/.test(userAgent)) {
            os = 'Android';
        } else if (/Linux/.test(platform)) {
            os = 'Linux';
        }

        return os;
    }

    function getBrowser() {
        var userAgent = navigator.userAgent;
        var browser = "Unknown Browser";
    
        if (userAgent.indexOf("Edg") > -1 || userAgent.indexOf("Edge") > -1) {
            browser = "Microsoft Edge";
        } else if (userAgent.indexOf("OPR") > -1 || userAgent.indexOf("Opera") > -1) {
            browser = "Opera";
        } else if (userAgent.indexOf("DuckDuckGo") > -1) {
            browser = "DuckDuckGo";
        } else if (userAgent.indexOf("SamsungBrowser") > -1) {
            browser = "Samsung Internet";
        } else if (userAgent.indexOf("Vivaldi") > -1) {
            browser = "Vivaldi";
        } else if (userAgent.indexOf("Brave") > -1) {
            browser = "Brave";
        } else if (userAgent.indexOf("UCBrowser") > -1) {
            browser = "UC Browser";
        } else if (userAgent.indexOf("AlohaBrowser") > -1) {
            browser = "Aloha Browser";
        } else if (userAgent.indexOf("Chrome") > -1) {
            browser = "Chrome";
        } else if (userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") === -1) {
            browser = "Safari";
        } else if (userAgent.indexOf("Firefox") > -1) {
            browser = "Mozilla Firefox";
        } else if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident/") > -1) {
            browser = "Internet Explorer";
        }
        return browser;
    }
    
    function getCurrentDate() {
        return new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    }

    function getCountry(callback) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://ipapi.co/json/", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                callback(response.country_name);
            } else if (xhr.readyState === 4) {
                callback('unknown');
            }
        };
        xhr.send();
    }

    

    function getLanguage() {
        return navigator.language || navigator.userLanguage || 'unknown';
    }

    function getCity(callback) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://ipapi.co/json/", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                callback(response.city);
            } else if (xhr.readyState === 4) {
                callback('unknown');
            }
        };
        xhr.send();
    }

    // Initialize User ID
    var userId = getCookie('userId') || generateUUID();
    setCookie('userId', userId, 365);

    // Initialize Session ID
    var sessionId = generateUUID();
    var sessionStartTime = new Date().toISOString(); //before: new Date().getTime(); it is a timestamp here in the old example, but the new one is converted to actual time of string type

    // Page Load Time
    var pageLoadStart = new Date().getTime();

    // window.addEventListener('load', function() {
    //     var pageLoadEnd = new Date().getTime();
    //     var pageLoadTime = (pageLoadEnd - pageLoadStart) / 1000; // Convert to seconds
    //     var pagePath = window.location.pathname;
    //     var pageURL = window.location.href;
    //     trackMetric('page_load_time', pageLoadTime, { pagePath: pagePath, pageURL: pageURL } );
    //     trackPageView({ pagePath: pagePath, pageURL: pageURL });
    // });
    window.addEventListener('load', function() {
        var pageLoadEnd = new Date().getTime();
        var pageLoadTime = (pageLoadEnd - pageLoadStart) / 1000; // Convert to seconds
        var pagePath = window.location.pathname;
        var pageURL = window.location.href;
        trackMetric('page_load_time', pageLoadTime, { pagePath: pagePath, pageURL: pageURL, sessionId: sessionId });
        trackPageView({ pagePath: pagePath, pageURL: pageURL, sessionId: sessionId });
    });

    // Function to track events
    function trackEvent(eventName, eventCategory, eventAction, eventLabel, eventValue) {
        var event = {
            eventName: eventName,
            eventCategory: eventCategory,
            eventAction: eventAction,
            eventLabel: eventLabel,
            eventValue: eventValue,
            userId: userId,
            sessionId: sessionId,
            time: new Date().toISOString(),
         userProperties: userProperties, // Include user properties
         sessionProperties: sessionProperties // Include session properties
        };
        sendToServer('event', event);
    }

    // Function to track metrics
    function trackMetric(metricName, metricValue, additionalData = {}) {
        var metric = {
            metricName: metricName,
            metricValue: metricValue,
            userId: userId,
            sessionId: sessionId,
            time: new Date().toISOString(),
            timeStamp: new Date().getTime(),
            ...additionalData
        };
        sendToServer('metric', metric);
    }

    // Function to send data to the server
    function sendToServer(type, data) {
       setTimeout(function(){
        if(auth){
            var xhr = new XMLHttpRequest();
            xhr.open("POST", api+"/collect", true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify({
                type: type,
                data: data,
                clientId: clientid
            }));
        }else{
            
        }
       },500)
       
        
    }

    // Example event tracking
    document.addEventListener('click', function(e) {
        var target = e.target;
        if (target.matches('.track-click')) {
            trackEvent('click', 'interaction', 'click', target.id, null);
        }
    });

    // Example session end tracking
    window.addEventListener('beforeunload', function() {
        var sessionEndTime = new Date().getTime();
        var sessionDuration = (sessionEndTime - sessionStartTime) / 1000; // Convert to seconds
        trackMetric('session_duration', sessionDuration);
        trackMetric('scroll_depth', maxScrollDepth, { pagePath: window.location.pathname }); // Send max scroll depth
    });

    //...................

    // Track maximum scroll depth
    var maxScrollDepth = 0;

    function trackScrollDepth() {
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        var currentScroll = (scrollTop / docHeight) * 100;
        if (currentScroll > maxScrollDepth) {
            maxScrollDepth = currentScroll;
        }
    }

   window.addEventListener('scroll', trackScrollDepth);

    // Set userType cookie if not set
    if (!getCookie('userType')) {
        setCookie('userType', 'new', 365);
    }

    // Track additional metrics and dimensions
    function trackPageView() {
        var pageView = {
            Description : 'Page Performance',
            pageTitle: document.title,
            pageURL: window.location.href,
            pagePath: window.location.pathname,
            landingPage: sessionStorage.getItem('landingPage') || window.location.pathname,
            exitPage: window.location.pathname,
            userId: userId,
            sessionId: sessionId,
            time: new Date().toISOString(),
            timeStamp: new Date().getTime()
        };
        sendToServer('page_view', pageView);
        sessionStorage.setItem('landingPage', window.location.pathname);
    }


    function trackAverageTimeOnPage() {
        var timeSpent = (new Date().getTime() - sessionStartTime) / 1000; // Convert to seconds
        trackMetric('average_time_on_page (Track average time on page every minute )', timeSpent, { pagePath: window.location.pathname });
    }
        // Track average time on page every minute
        setInterval(trackAverageTimeOnPage, 60000);


    // Function to track user engagement level
    /**
 * Tracks the user's engagement level based on the session duration.
 * - Initializes engagement level to 'low'.
 * - Sets engagement level to 'medium' if session duration is greater than 300 seconds (5 minutes).
 * - Sets engagement level to 'high' if session duration is greater than 600 seconds (10 minutes).
 * - Calls trackMetric with the engagement level.
 */
    function trackUserEngagementLevel() {
        var engagementLevel = 'low';
        // Define criteria for engagement level
        if ((new Date().getTime() - sessionStartTime) / 1000 > 300) {
            engagementLevel = 'medium';
        }
        if ((new Date().getTime() - sessionStartTime) / 1000 > 600) {
            engagementLevel = 'high';
        }
        trackMetric('user_engagement_level', engagementLevel);
    }

    // Function to track form submissions
    function trackFormSubmissions() {
        document.addEventListener('submit', function(e) {
            var target = e.target;
            if (target.matches('.track-form')) {
                var formData = new FormData(target);
                var formObject = {};
                formData.forEach((value, key) => {
                    formObject[key] = value;
                });
                trackEvent('form_submission', 'interaction', 'submit', target.id, JSON.stringify(formObject));
            }
        });
    }

    // Function to track video plays
    function trackVideoPlays() {
        var videos = document.querySelectorAll('video.track-video');
        videos.forEach(function(video) {
            video.addEventListener('play', function() {
                trackEvent('video_play', 'interaction', 'play', video.id, null);
            });
        });
    }

    // Function to track social shares
    function trackSocialShares() {
        var socialButtons = document.querySelectorAll('.track-social-share');
        socialButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                var platform = button.getAttribute('data-platform');
                trackEvent('social_share', 'interaction', 'click', platform, null);
            });
        });
    }

    // Function to track file downloads
    function trackFileDownloads() {
        var links = document.querySelectorAll('a.track-download');
        links.forEach(function(link) {
            link.addEventListener('click', function() {
                var fileUrl = link.getAttribute('href');
                trackEvent('file_download', 'interaction', 'click', fileUrl, null);
            });
        });
    }

    // Function to track ad clicks
    function trackAdClicks() {
        var ads = document.querySelectorAll('.track-ad');
        ads.forEach(function(ad) {
            ad.addEventListener('click', function() {
                var adId = ad.getAttribute('data-ad-id');
                trackEvent('ad_click', 'interaction', 'click', adId, null);
            });
        });
    }

    // Initialize additional tracking functions
    // trackFormSubmissions();
    // trackVideoPlays();
    // trackSocialShares();
    // trackFileDownloads();
    // trackAdClicks();



    // Track user engagement level every 5 minutes
    setInterval(trackUserEngagementLevel, 300000);
   



    // Calculate Bounce Rate
    function calculateBounceRate() {
        // Implement your logic to calculate bounce rate
        return 0; // Placeholder
    }

    // Calculate Engagement Rate
    function calculateEngagementRate() {
        // Implement your logic to calculate engagement rate
        return 0; // Placeholder
    }

    // Custom Dimension Tracking
    function trackCustomDimension(dimensionName, dimensionValue) {
        var customDimension = {
            dimensionName: dimensionName,
            dimensionValue: dimensionValue,
            userId: userId,
            sessionId: sessionId,
            time: new Date().toISOString()
        };
        sendToServer('custom_dimension', customDimension);
    }

    // Custom Metric Tracking
    function trackCustomMetric(metricName, metricValue) {
        var customMetric = {
            metricName: metricName,
            metricValue: metricValue,
            userId: userId,
            sessionId: sessionId,
            time: new Date().toISOString()
        };
        sendToServer('custom_metric', customMetric);
    }

    // Track initial user and session properties
    getCountry(function(country) {
        getCity(function(city) {
            var userProperties = {
                Description : "User Properties",
                userId: userId,
                userType: getCookie('userType') ? 'returning' : 'new',
                age: getUserAge(),
                gender: getUserGender(),
                interests: getUserInterests(),
                country: response.country_name,
                countryCode: response.country_code,
                city: response.city,
                region: response.region,
                regionCode: response.region_code,
                continentCode: response.continent_code,
                latitude: response.latitude,
                longitude: response.longitude,
                timezone: response.timezone,
                utcOffset: response.utc_offset,
                countryCallingCode: response.country_calling_code,
                currency: response.currency,
                currencyName: response.currency_name,
                languages: response.languages,
                countryArea: response.country_area,
                countryPopulation: response.country_population,
                asn: response.asn,
                org: response.org,
                userLanguage: getLanguage(),
                currentDate: getCurrentDate(),
                time: new Date().toISOString(),
                timeStamp: new Date().getTime()
            };
            var sessionProperties = {
                Description : "Session Properties",
                sessionId: sessionId,
                sessionStartTime: sessionStartTime,
                sessionSource: document.referrer,
                sessionMedium: getSessionMedium(),
                sessionSource:getSessionSource(), //new
                sessionCampaign: getSessionCampaign(),
                deviceType: getDeviceType(),
                operatingSystem: getOS(),
                browser: getBrowser(),
                currentDate: getCurrentDate(),
                time: new Date().toISOString(),
                timeStamp: new Date().getTime()
            };

            sendToServer('user_properties', userProperties);
            sendToServer('session_properties', sessionProperties);
        });
    });

    // Track example custom dimensions and metrics
    // trackCustomDimension('user_segment', 'premium');
    // trackCustomMetric('loyalty_points', 150);

    // Track Active Users
    function trackActiveUsers() {
        let activeUsers = 0;
        let userActivity = {};
        let now = new Date().getTime();

        // Example of tracking activity
        userActivity[userId] = now;

        // Remove inactive users (e.g., no activity for 30 minutes)
        for (let id in userActivity) {
            if (now - userActivity[id] > 30 * 60 * 1000) {
                delete userActivity[id];
            }
        }

        // Update active users count
        activeUsers = Object.keys(userActivity).length;
        trackMetric('active_users', activeUsers);
    }

    // Track User Lifetime Value
    function trackUserLifetimeValue(amount) {
        let userLifetimeValue = getCookie('userLifetimeValue') || 0;
        userLifetimeValue = parseFloat(userLifetimeValue) + amount;
        setCookie('userLifetimeValue', userLifetimeValue, 365);
        trackMetric('user_lifetime_value', userLifetimeValue);
    }

    // Track Bounce Rate
    function trackBounceRate(sessionId, interactions) {
        let singlePageSessions = getCookie('singlePageSessions') || 0;
        let totalSessions = getCookie('totalSessions') || 0;
        totalSessions++;

        if (interactions === 0) {
            singlePageSessions++;
        }

        setCookie('singlePageSessions', singlePageSessions, 365);
        setCookie('totalSessions', totalSessions, 365);

        let bounceRate = (singlePageSessions / totalSessions) * 100;
        trackMetric('bounce_rate', bounceRate);
    }

    // Track Average Session Duration
    function trackAverageSessionDuration(sessionId) {
        let sessionDurations = JSON.parse(getCookie('sessionDurations') || '[]');
        let now = new Date().getTime();
        let duration = (now - sessionStartTime) / 1000; // Convert to seconds
        sessionDurations.push(duration);

        setCookie('sessionDurations', JSON.stringify(sessionDurations), 365);

        let totalDuration = sessionDurations.reduce((acc, duration) => acc + duration, 0);
        let avgDuration = totalDuration / sessionDurations.length;
        trackMetric('average_session_duration', avgDuration);
    }

    // Track Goal Completions
    function trackGoalCompletion(goal) {
        let goalCompletions = getCookie('goalCompletions') || 0;
        goalCompletions++;
        setCookie('goalCompletions', goalCompletions, 365);
        trackMetric('goal_completions', goalCompletions);
    }

    // Track Exit Rate
    function trackExitRate(page) {
        let exits = JSON.parse(getCookie('exits') || '{}');
        let pageVisits = JSON.parse(getCookie('pageVisits') || '{}');

        exits[page] = (exits[page] || 0) + 1;
        pageVisits[page] = (pageVisits[page] || 0) + 1;

        setCookie('exits', JSON.stringify(exits), 365);
        setCookie('pageVisits', JSON.stringify(pageVisits), 365);

        let exitRate = (exits[page] / pageVisits[page]) * 100;
        trackMetric('exit_rate', exitRate);
    }

    // Track Engagement Rate
    function trackEngagementRate(sessionId, interactions) {
        let engagedSessions = getCookie('engagedSessions') || 0;
        let totalEngagements = getCookie('totalEngagements') || 0;
        totalEngagements++;

        if (interactions > 1) {
            engagedSessions++;
        }

        setCookie('engagedSessions', engagedSessions, 365);
        setCookie('totalEngagements', totalEngagements, 365);

        let engagementRate = (engagedSessions / totalEngagements) * 100;
        trackMetric('engagement_rate', engagementRate);
    }

    // Track Time on Page
    function trackTimeOnPage(userId, page, action) {
        let pageEnterTime = JSON.parse(getCookie('pageEnterTime') || '{}');

        if (action === 'enter') {
            pageEnterTime[userId] = new Date().getTime();
            setCookie('pageEnterTime', JSON.stringify(pageEnterTime), 365);
        } else if (action === 'exit') {
            let enterTime = pageEnterTime[userId];
            let exitTime = new Date().getTime();
            let timeSpent = (exitTime - enterTime) / 1000; // Convert to seconds
            trackMetric('time_on_page', timeSpent);
        }
    }

    // Track Session Frequency
    function trackSessionFrequency(userId) {
        let sessionFrequency = JSON.parse(getCookie('sessionFrequency') || '{}');
        sessionFrequency[userId] = (sessionFrequency[userId] || 0) + 1;
        setCookie('sessionFrequency', JSON.stringify(sessionFrequency), 365);
        trackMetric('session_frequency', sessionFrequency[userId]);
    }

    // Track Engagement by Device
    function trackEngagementByDevice(device, engagement) {
        let engagementByDevice = JSON.parse(getCookie('engagementByDevice') || '{}');
        engagementByDevice[device] = (engagementByDevice[device] || 0) + engagement;
        setCookie('engagementByDevice', JSON.stringify(engagementByDevice), 365);
        trackMetric('engagement_by_device', engagementByDevice[device]);
    }

    // Track Revenue by Source
    function trackRevenueBySource(source, revenue) {
        let revenueBySource = JSON.parse(getCookie('revenueBySource') || '{}');
        revenueBySource[source] = (revenueBySource[source] || 0) + revenue;
        setCookie('revenueBySource', JSON.stringify(revenueBySource), 365);
        trackMetric('revenue_by_source', revenueBySource[source]);
    }

    // Track Click-through Rate (CTR)
    function trackClickThroughRate(clicks, impressions) {
        let ctr = (clicks / impressions) * 100;
        trackMetric('click_through_rate', ctr);
    }

    // Track Interaction Time
    function trackInteractionTime(interactionTime) {
        trackMetric('interaction_time', interactionTime / 1000); // Convert to seconds
    }

    // Track Page Size and Number of Requests
    // window.addEventListener('load', function() {
    //     let pageSize = performance.getEntriesByType("resource").reduce((acc, resource) => acc + resource.transferSize, 0) / 1024; // Convert to KB
    //     trackMetric('page_size_in_KB', pageSize);

    //     let numRequests = performance.getEntriesByType("resource").length;
    //     trackMetric('number_of_requests', numRequests);
    // });
    window.addEventListener('load', function() {
        let pageSize = performance.getEntriesByType("resource").reduce((acc, resource) => acc + resource.transferSize, 0) / 1024; // Convert to KB
        let pagePath = window.location.pathname;
        trackMetric('page_size_in_KB', pageSize, { pagePath: pagePath, sessionId: sessionId  });
    
        let numRequests = performance.getEntriesByType("resource").length;
        trackMetric('number_of_requests', numRequests, { sessionId: sessionId });
    });

    // Track Conversion Rate
    function trackConversionRate(conversions, totalVisitors) {
        let conversionRate = (conversions / totalVisitors) * 100;
        trackMetric('conversion_rate', conversionRate);
    }

    // Track Average Order Value
    function trackAverageOrderValue(totalRevenue, numberOfOrders) {
        let averageOrderValue = totalRevenue / numberOfOrders;
        trackMetric('average_order_value', averageOrderValue);
    }

    // Track Cart Abandonment Rate
    function trackCartAbandonmentRate(abandonedCarts, initiatedCarts) {
        let cartAbandonmentRate = (abandonedCarts / initiatedCarts) * 100;
        trackMetric('cart_abandonment_rate', cartAbandonmentRate);
    }

    // Track Referrer
    function getReferrer() {
        return document.referrer || 'direct';
    }

    // Track New vs. Returning Users
    function trackNewVsReturningUsers() {
        let userType = getCookie('userType') ? 'returning' : 'new';
        trackCustomDimension('user_type', userType);
    }
    
    // Add your own custom metrics and dimensions
    // ...

// Function to track form abandonment
function trackFormAbandonment() {
    document.addEventListener('change', function(e) {
        var target = e.target;
        if (target.matches('.track-form')) {
            // Implement logic to track form field changes
            trackEvent('form_abandonment', 'interaction', 'change', target.id, null);
        }
    });
}

// Function to track user preferences
function trackUserPreferences(preferences) {
    var userPreferences = {
        preferences: preferences,
        userId: userId,
        sessionId: sessionId,
        time: new Date().toISOString(),
        timeStamp: new Date().getTime()
    };
    sendToServer('user_preferences', userPreferences);
}

// Function to track page errors
function trackPageErrors(errorDetails) {
    var error = {
        errorDetails: errorDetails,
        userId: userId,
        sessionId: sessionId,
        time: new Date().toISOString(),
        timeStamp: new Date().getTime()
    };
    sendToServer('page_error', error);
}

// Function to track user ratings
function trackUserRating(ratingValue) {
    var rating = {
        ratingValue: ratingValue,
        userId: userId,
        sessionId: sessionId,
        time: new Date().toISOString(),
        timeStamp: new Date().getTime()
    };
    sendToServer('user_rating', rating);
}

// Function to track session interruptions
function trackSessionInterruptions(interruptionReason) {
    var interruption = {
        interruptionReason: interruptionReason,
        userId: userId,
        sessionId: sessionId,
        time: new Date().toISOString(),
        timeStamp: new Date().getTime()
    };
    sendToServer('session_interruption', interruption);
}

// Function to track user feedback
function trackUserFeedback(feedback) {
    var userFeedback = {
        feedback: feedback,
        userId: userId,
        sessionId: sessionId,
        time: new Date().toISOString(),
        timeStamp: new Date().getTime()
    };
    sendToServer('user_feedback', userFeedback);
}

// Function to get the session medium (e.g., organic, referral, direct)
// function getSessionMedium() {
//     var medium = 'direct'; // Default to direct traffic
//     var referrer = document.referrer.toLowerCase();

//     // Check for various social networks
//     if (referrer.includes('google.com')) {
//         medium = 'organic'; // Google main domain (google.com)
//     } else if (referrer.includes('facebook') || referrer.includes('fbclid')) {
//         medium = 'social'; // Facebook or Facebook ads (fbclid parameter)
//     } else if (referrer.includes('twitter')) {
//         medium = 'social'; // Twitter
//     } else if (referrer.includes('linkedin')) {
//         medium = 'social'; // LinkedIn
//     } else if (referrer.includes('instagram')) {
//         medium = 'social'; // Instagram
//     } else if (referrer.includes('pinterest')) {
//         medium = 'social'; // Pinterest
//     } else if (referrer.includes('youtube')) {
//         medium = 'social'; // YouTube
//     } 
//  else if (referrer.includes('t.co')) {
//     medium = 'social'; // Twitter short link
// }
// else if (referrer.includes('x.com')) {
//     medium = 'social'; // Twitter new link
// }
// else if (referrer.includes('reddit')) {
//     medium = 'social'; // Reddit
// } else if (referrer.includes('tumblr')) {
//     medium = 'social'; // Tumblr
// } else if (referrer.includes('snapchat')) {
//     medium = 'social'; // Snapchat
// } else if (referrer.includes('whatsapp')) {
//     medium = 'social'; // WhatsApp
// } else if (referrer.includes('wechat') || referrer.includes('weibo')) {
//     medium = 'social'; // WeChat or Weibo
// } else if (referrer.includes('quora')) {
//     medium = 'social'; // Quora
// } else if (referrer.includes('telegram')) {
//     medium = 'social'; // Telegram
// } else if (referrer.includes('discord')) {
//     medium = 'social'; // Discord
// } else if (referrer.includes('vkontakte')) {
//     medium = 'social'; // VKontakte
// } else if (referrer.includes('line.me')) {
//     medium = 'social'; // Line
// } else if (referrer.includes('medium.com')) {
//     medium = 'social'; // Medium
// } else if (referrer.includes('bizjournals.com')) {
//     medium = 'social'; // Bizjournals
// } else if (referrer.includes('yelp.com')) {
//     medium = 'social'; // Yelp
// } else if (referrer.includes('yandex')) {
//     medium = 'social'; // Yandex
// } else if (referrer.includes('foursquare')) {
//     medium = 'social'; // Foursquare
// } else if (referrer.includes('about.me')) {
//     medium = 'social'; // About.me
// } else if (referrer.includes('xing.com')) {
//     medium = 'social'; // Xing
// } else if (referrer.includes('slideshare.net')) {
//     medium = 'social'; // SlideShare
// } else if (referrer.includes('behance.net')) {
//     medium = 'social'; // Behance
// } else if (referrer.includes('dribbble.com')) {
//     medium = 'social'; // Dribbble
// } else if (referrer.includes('reddit.com')) {
//     medium = 'social'; // Reddit
// } else if (referrer.includes('vk.com')) {
//     medium = 'social'; // VK
// } else if (referrer.includes('mix.com')) {
//     medium = 'social'; // Mix
// } else if (referrer.includes('bandcamp.com')) {
//     medium = 'social'; // Bandcamp
// } else if (referrer.includes('last.fm')) {
//     medium = 'social'; // Last.fm
// } else if (referrer.includes('goodreads.com')) {
//     medium = 'social'; // Goodreads
// } else if (referrer.includes('myspace.com')) {
//     medium = 'social'; // MySpace
// } else if (referrer.includes('tiktok.com')) {
//     medium = 'social'; // TikTok
// } else if (referrer.includes('vimeo.com')) {
//     medium = 'social'; // Vimeo
// } else if (referrer.includes('soundcloud.com')) {
//     medium = 'social'; // SoundCloud
// } else if (referrer.includes('clubhouse.com')) {
//     medium = 'social'; // Clubhouse
// } else if (referrer.includes('stackoverflow.com')) {
//     medium = 'social'; // Stack Overflow
// } else if (referrer.includes('github.com')) {
//     medium = 'social'; // GitHub
// } else if (referrer.includes('amazon.com')) {
//     medium = 'social'; // Amazon
// } else if (referrer.includes('ebay.com')) {
//     medium = 'social'; // eBay
// } else if (referrer.includes('aliexpress.com')) {
//     medium = 'social'; // AliExpress
// } else if (referrer.includes('wikipedia.org')) {
//     medium = 'social'; // Wikipedia
// } else if (referrer.includes('stackoverflow.com')) {
//     medium = 'social'; // Stack Overflow
// } else if (referrer.includes('google.com')) {
//     medium = 'organic'; // Google (if not organic, check if it's a paid campaign)
// } else if (referrer.includes('bing.com')) {
//     medium = 'organic'; // Bing
// } else if (referrer.includes('yahoo.com')) {
//     medium = 'organic'; // Yahoo
// } else if (referrer.includes('duckduckgo.com')) {
//     medium = 'organic'; // DuckDuckGo
// } else if (referrer.includes('baidu.com')) {
//     medium = 'organic'; // Baidu
// } else if (referrer.includes('ask.com')) {
//     medium = 'organic'; // Ask.com
// } else if (referrer.includes('aol.com')) {
//     medium = 'organic'; // AOL
// } else if (referrer.includes('yandex.ru')) {
//     medium = 'organic'; // Yandex (Russian)
// } else if (referrer.includes('naver.com')) {
//     medium = 'organic'; // Naver (Korean)
// } else if (referrer.includes('daum.net')) {
//     medium = 'organic'; // Daum (Korean)
// } else if (referrer.includes('nate.com')) {
//     medium = 'organic'; // Nate (Korean)
// } else if (referrer.includes('seznam.cz')) {
//     medium = 'organic'; // Seznam (Czech)
// } else if (referrer.includes('wp.pl')) {
//     medium = 'organic'; // WP (Polish)
// } else if (referrer.includes('onet.pl')) {
//     medium = 'organic'; // Onet (Polish)
// } else if (referrer.includes('sogou.com')) {
//     medium = 'organic'; // Sogou (Chinese)
// } else if (referrer.includes('so.com')) {
//     medium = 'organic'; // 360 Search (Chinese)
// } else if (referrer.includes('shenma.com')) {
//     medium = 'organic'; // Shenma (Chinese)
// } else if (referrer.includes('haosou.com')) {
//     medium = 'organic'; // Haosou (Chinese)
//     return medium;
// }
// }


function getSessionMedium() {
    const urlParams = new URLSearchParams(window.location.search);
    const medium = urlParams.get('utm_medium') || 'organic';
    return medium;
}

function getSessionMedium() {
    var medium = 'direct'; // Default to direct traffic
    var referrer = document.referrer.toLowerCase();

    // Define a mapping of keywords to mediums
    const mediumMap = [
        { keywords: ['google.com', 'bing.com', 'yahoo.com', 'duckduckgo.com', 'baidu.com', 'ask.com', 'aol.com', 'yandex.ru', 'naver.com', 'daum.net', 'nate.com', 'seznam.cz', 'wp.pl', 'onet.pl', 'sogou.com', 'so.com', 'shenma.com', 'haosou.com'], medium: 'organic' }, //search engines
        { keywords: ['facebook', 'fbclid', 'twitter', 'linkedin', 'instagram', 'pinterest', 'youtube', 't.co', 'x.com', 'reddit', 'tumblr', 'snapchat', 'whatsapp', 'wechat', 'weibo', 'quora', 'telegram', 'discord', 'vkontakte', 'line.me', 'medium.com', 'bizjournals.com', 'yelp.com', 'foursquare', 'about.me', 'xing.com', 'slideshare.net', 'behance.net', 'dribbble.com', 'reddit.com', 'vk.com', 'mix.com', 'bandcamp.com', 'last.fm', 'goodreads.com', 'myspace.com', 'tiktok.com', 'vimeo.com', 'soundcloud.com', 'clubhouse.com', 'stackoverflow.com', 'github.com', 'amazon.com', 'ebay.com', 'aliexpress.com', 'wikipedia.org'], medium: 'social' } //social networks
    ];

    // Check the referrer against the mediumMap
    for (let i = 0; i < mediumMap.length; i++) {
        for (let j = 0; j < mediumMap[i].keywords.length; j++) {
            if (referrer.includes(mediumMap[i].keywords[j])) {
                return mediumMap[i].medium;
            }
        }
    }
sendToServer(medium);
    return medium;
}

function getSessionSource() {
    var details = { source: 'direct', type: 'direct' }; // Default to direct traffic
    if (!document.referrer) {
        // If referrer is empty, return the default details
        return details;
    }
    var referrer = new URL(document.referrer).hostname.toLowerCase();

    // Define a mapping of domains to their names
    const detailsMap = {
        'google.com': { name: 'google', type: 'search engine' },
        'bing.com': { name: 'bing', type: 'search engine' },
        'yahoo.com': { name: 'yahoo', type: 'search engine' },
        'duckduckgo.com': { name: 'duckduckgo', type: 'search engine' },
        'baidu.com': { name: 'baidu', type: 'search engine' },
        'ask.com': { name: 'ask', type: 'search engine' },
        'aol.com': { name: 'aol', type: 'search engine' },
        'yandex.ru': { name: 'yandex', type: 'search engine' },
        'naver.com': { name: 'naver', type: 'search engine' },
        'daum.net': { name: 'daum', type: 'search engine' },
        'nate.com': { name: 'nate', type: 'search engine' },
        'seznam.cz': { name: 'seznam', type: 'search engine' },
        'wp.pl': { name: 'wp', type: 'search engine' },
        'onet.pl': { name: 'onet', type: 'search engine' },
        'sogou.com': { name: 'sogou', type: 'search engine' },
        'so.com': { name: '360', type: 'search engine' },
        'shenma.com': { name: 'shenma', type: 'search engine' },
        'haosou.com': { name: 'haosou', type: 'search engine' },
        'facebook.com': { name: 'facebook', type: 'social media' },
        'twitter.com': { name: 'twitter', type: 'social media' },
        'x.com': { name: 'X (Formerly Twitter)', type: 'social media' },
        'linkedin.com': { name: 'linkedin', type: 'social media' },
        'instagram.com': { name: 'instagram', type: 'social media' },
        'pinterest.com': { name: 'pinterest', type: 'social media' },
        'youtube.com': { name: 'youtube', type: 'video sharing' },
        't.co': { name: 'twitter', type: 'social media' },
        'reddit.com': { name: 'reddit', type: 'social media' },
        'tumblr.com': { name: 'tumblr', type: 'social media' },
        'snapchat.com': { name: 'snapchat', type: 'social media' },
        'whatsapp.com': { name: 'whatsapp', type: 'messaging' },
        'wechat.com': { name: 'wechat', type: 'messaging' },
        'weibo.com': { name: 'weibo', type: 'social media' },
        'quora.com': { name: 'quora', type: 'question and answer' },
        'telegram.org': { name: 'telegram', type: 'messaging' },
        'discord.com': { name: 'discord', type: 'social media' },
        'vkontakte.ru': { name: 'vkontakte', type: 'social media' },
        'line.me': { name: 'line', type: 'messaging' },
        'medium.com': { name: 'medium', type: 'publishing' },
        'tiktok.com': { name: 'tiktok', type: 'social media' },
        'wordpress.com': { name: 'wordpress', type: 'publishing' },
        'blogger.com': { name: 'blogger', type: 'publishing' },
        'livejournal.com': { name: 'livejournal', type: 'publishing' },
        'baike.com': { name: 'baike', type: 'encyclopedia' },
        'myspace.com': { name: 'myspace', type: 'social media' },
        'mix.com': { name: 'mix', type: 'social media' },
        'nextdoor.com': { name: 'nextdoor', type: 'social media' },
        'wikipedia.org': { name: 'wikipedia', type: 'encyclopedia' }
        
};
 // Check the referrer against the sourceMap
    var matchFound = false;
    for (const domain in detailsMap) {
        if (referrer.endsWith(domain)) { // Improved matching logic
            details.source = detailsMap[domain].name;
            details.type = detailsMap[domain].type;
            matchFound = true;
            break;
        }
    }
    if (!matchFound) {
        details.source = 'other';
        details.type = 'unknown';
    }

    // Assuming sendToServer is an asynchronous function that does not modify 'details'
    sendToServer(details).catch(error => {
    });

    return details;
}


//----------------------

// Function to track session campaign
document.addEventListener('DOMContentLoaded', function() {
    trackPageVisit();
});
function trackPageVisit() {
    trackEvent('session', 'engagement', 'visit', window.location.pathname, null, userProperties, sessionProperties);
}                                                                          



// document.addEventListener('DOMContentLoaded', function() {
//     trackPageVisit();
// });

// function trackPageVisit() {
//     // Assuming userId, userProperties, and sessionProperties are defined elsewhere
//     trackUserProperties(userId, userProperties);
//     trackSessionProperties(sessionProperties);
// }

// function trackUserProperties(userId, userProperties) {
//     // Example: Track user-specific events
//     trackEvent('user', 'info', 'visit', window.location.pathname, userId, userProperties);
// }

// function trackSessionProperties(sessionProperties) {
//     // Example: Track session-specific events
//     trackEvent('session', 'engagement', 'visit', window.location.pathname, null, null, sessionProperties);
// }


})();
