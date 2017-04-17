///
/// \file   parse.js
/// \brief  Contains code for parsing our request header.
///

///
/// \fn     getIpAddress
/// \brief  Extracts the client's IP address from the request header.
///
/// \param  request     The HTTP request object.
///
/// \return The client's IP address, as well as proxies if necessary.
///
function getIpAddress (request) {
    // Check for the "x-forwarded-for" request header first, in case
    // our server is behind a proxy. If that header is not present, then
    // check 'request.connection.remoteAddress' to get our address.
    //
    // Source: http://stackoverflow.com/a/8107922

    let forwardedForHeader = request.headers["x-forwarded-for"];

    // If the forwarded header was found...
    if (forwardedForHeader) {
        // The header should be in the form of comma-separated values.
        // Split it into substrings.
        let splitHeader = forwardedForHeader.split(",");

        // The first element in the split array is the client address itself.
        let clientAddress = "";

        // The rest of the elements are the addresses of the proxies that the
        // server is using.
        let proxyArray = [];

        // Iterate through our addresses and populate our array as appropriate,
        // and fill in our client address.
        splitHeader.forEach((val, idx) => {
            if (idx === 0) {
                clientAddress = val;
            } else {
                proxyArray.push(val);
            }
        });

        // Return the addresses in a JSON object.
        return {
            client: clientAddress,
            proxies: proxyArray  
        };
    } else {
        // Otherwise, just return the remote address.
        return request.connection.remoteAddress;
    }
}

///
/// \fn     getOperatingSystem
/// \brief  Parses the "user-agent" request string to determine the OS being used.
///
/// \param  userAgent   The user agent string.
///
/// \return An object containing details on the OS being used.
///
function getOperatingSystem (userAgent) {
    let os = {};

    // First, detect whether or not we are running a mobile device.
    os.mobile = /mobi/i.test(userAgent);

    // Now detect the operating system. We'll test our user agent string against
    // a series of regular expressions in order to achieve this.
    //
    // Source: http://stackoverflow.com/a/6163500

    // First, check for iOS.
    if (/like Mac OS X/.test(userAgent) === true) {
        os.name = "iOS";
        os.version = /CPU( iPhone)? OS ([0-9\._]+) like Mac OS X/.exec(userAgent)[2].replace(/_/g, ".");

        // Also check to see if we are running an IPhone or IPad.
        if (/iPhone/.test(userAgent) === true)
            os.device = "iPhone";
        else if (/iPad/.test(userAgent) === true)
            os.device = "iPad";
    }

    // Check for Android.
    else if (/Android/.test(userAgent) === true) {
        os.name = "Android";
        os.version = /Android ([0-9\.]+)[\);]/.exec(userAgent)[1];
    }

    // Check for WebOS.
    else if (/webOS\//.test(userAgent) === true) {
        os.name = "WebOS";
        os.version = /webOS\/([0-9\.]+)[\);]/.exec(userAgent)[1];
    }

    // Check for Mac OSX.
    else if (/(Intel|PPC) Mac OS X/.test(userAgent) === true) {
        os.name = "Macintosh OS X";
        os.version = /(Intel|PPC) Mac OS X ?([0-9\._]*)[\)\;]/.exec(ua)[2].replace(/_/g, '.') || "???";
    }

    // Check for Microsoft Windows.
    else if (/Windows NT/.test(userAgent) === true) {
        os.name = "Microsoft Windows";
        os.version = /Windows NT ([0-9\._]+)[\);]/.exec(userAgent)[1];
    }

    // Check for Linux.
    else if (/Linux/.test(userAgent) === true) {
        os.name = "Linux";

        // The user agent string does not reveal anything on the version of the Linux
        // Kernel being used. Instead, fill in the OS processor architecture being used.
        os.architecture = /Linux ([0-9a-zA-Z_]+)/.exec(userAgent)[1];
    }

    // Return our object.
    return os;
}

///
/// \fn     getBrowserLanguage
/// \brief  Gets the language being used by the browser.
///
/// \param  acceptLanguage      The "accept-language" HTTP request header string.
///
/// \return The language and dialect if available used by the browser.
///
function getBrowserLanguage (acceptLanguage) {
    return acceptLanguage.split(",")[0];
}

module.exports = (request) => {
    console.log(request.headers);

    return {
        ip: getIpAddress(request),
        os: getOperatingSystem(request.headers["user-agent"]),
        language: getBrowserLanguage(request.headers["accept-language"])
    };
};