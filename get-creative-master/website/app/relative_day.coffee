###########################################################################
# Converts a Unix timestamp to a relative day/date, as relative as possible
# Priority:
# Relative name day:            Today, Yesterday
# Day of week:                  Monday, Tuesday, etc.
# Relative day of week:         Last Monday, Last Tuesday, etc.
# Day of week of this month:    Monday the 1st, Tuesday the 2nd, etc.
# Readable date:                August 21st
# Readable date with year:      August 21st, 2011

# Written by David Mauro
###########################################################################

_get_relative_day_name = (diff) ->
    return false if diff > 1
    return [
        "Today"
        "Yesterday"
    ][diff]

_get_day_name = (int) ->
    return [
        "Sunday"
        "Monday"
        "Tuesday"
        "Wednesday"
        "Thursday"
        "Friday"
        "Saturday"
    ][int]

_get_month_name = (int) ->
    return [
        "January"
        "February"
        "March"
        "April"
        "May"
        "June"
        "July"
        "August"
        "September"
        "October"
        "November"
        "December"
    ][int]

_get_date_with_suffix = (int) ->
    last_num = parseInt int.toString().slice -1
    if int in [11, 12, 13]
        suffix = "th"
    else if last_num is 1
        suffix = "st"
    else if last_num is 2
        suffix = "nd"
    else if last_num is 3
        suffix = "rd"
    else
        suffix = "th"
    return "#{int}#{suffix}"

_get_days_in_month = (month, year) ->
    return 32 - new Date(year, month, 32).getDate()

_get_month_date = (month, date) ->
    return "#{_get_month_name(month)} #{_get_date_with_suffix(date)}"

_get_month_date_year = (month, date, year) ->
    return "#{_get_month_date(month, date)}, #{year}"

module.exports.get = (timestamp, now = new Date()) ->
    unless timestamp instanceof Date
        timestamp = new Date timestamp
    unless now instanceof Date
        now = new Date now
    if timestamp.getTime() > now.getTime()
        throw "Date cannot be in the future"
    date = timestamp.getDate()
    day = timestamp.getDay()
    month = timestamp.getMonth()
    year = timestamp.getFullYear()

    this_date = now.getDate()
    this_month = now.getMonth()
    this_year = now.getFullYear()

    year_diff = this_year - year
    if year_diff > 1
        ########################
        # Return Month Date Year
        ########################
        return _get_month_date_year month, date, year
    month_diff = ((this_year - 1)*12 + this_month) - ((year - 1)*12 + month)
    date_diff = this_date - date
    if month_diff is 1 or (month_diff <= 1 and date_diff < 0)
        date_diff = _get_days_in_month(month, year) - date + this_date
    is_within_two_weeks = month_diff <= 1 and date_diff < 14
    if is_within_two_weeks
        if date_diff <= 1
            ###########################
            # Return Today or Yesterday
            ###########################
            return _get_relative_day_name date_diff
        if date_diff < 7
            ####################
            # Return Day of Week
            ####################
            return _get_day_name day
        #########################
        # Return Day of Last Week
        #########################
        return "Last #{_get_day_name(day)}"
    if month_diff is 0
        ##########################
        # Return Day of This Month
        ##########################
        return "#{_get_day_name(day)} the #{_get_date_with_suffix(date)}"
    if year_diff is 0
        #######################
        # Return Month and Date
        #######################
        return "#{_get_month_date(month, date)}"
    ########################
    # Return Month Date Year
    ########################
    return _get_month_date_year month, date, year
