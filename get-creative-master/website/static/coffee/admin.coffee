############
# AJAX calls
############
_edit_challenge_prompt = (id, new_prompt) ->
    $.ajax(
        url     : "/admin/api/rename"
        type    : "POST"
        data    :
            id      : id
            prompt  : new_prompt
        success : ->
            document.location.reload()
        error   : (req, status, err) ->
            alert "Something went wrong with prompt edit:\n#{status}: #{err}"
    )

_delete_challenge = (id) ->
    $.ajax(
        url     : "/admin/api/remove_challenge"
        type    : "POST"
        data    :
            id : id
        success : ->
            document.location.href = "/admin"
        error   : (req, status, err) ->
            alert "Something went wrong with challenge removal:\n#{status}: #{err}"
    )

_remove_response = (id) ->
    $.ajax(
        url     : "/admin/api/remove_response"
        type    : "POST"
        data    :
            id : id
        success : ->
            document.location.reload()
        error   : (req, status, err) ->
            alert "Something went wrong with comment removal:\n#{status}:#{err}"
    )

_remove_from_hopper = (index) ->
    $.ajax(
        url     : "/admin/api/remove_prompt"
        type    : "POST"
        data    :
            index : index
        success : ->
            document.location.reload()
        error   : (req, status, err) ->
            alert "Something went wrong with challenge removal:\n#{status}: #{err}"
    )

_force_challenge_post = ->
    $.ajax(
        url     : "/admin/api/force_post"
        type    : "POST"
        success : ->
            document.location.reload()
        error   : (req, status, err) ->
            alert "Something went wrong forcing prompt post:\n#{status}: #{err}"
    )

_ban_user = (user_id) ->
    $.ajax(
        url     : "/admin/api/ban_user"
        type    : "POST"
        data    :
            user_id : user_id
        success : ->
            document.location.reload()
        error   : (req, status, err) ->
            alert "Something went wrong banning:\n#{status}: #{err}"
    )

_unban_user = (user_id) ->
    $.ajax(
        url     : "/admin/api/unban_user"
        type    : "POST"
        data    :
            user_id : user_id
        success : ->
            document.location.reload()
        error   : (req, status, err) ->
            alert "Something went wrong UN-banning:\n#{status}: #{err}"
    )

#####################
# Setup node bindings
#####################
_get_list_index = (item, list) ->
    reverse_index = list.index item
    return list.length - 1 - reverse_index

_nodes =
    type_dropdown           : $('select.challenge_type')
    new_challenge_forms     : $('form.new_challenge')
    challenge_prompt        : $('.challenge p.challenge_prompt')
    new_challenge_input     : $('input[type=text].prompt')
    edit_challenge_button   : $('#js_edit_button')
    delete_challenge_button : $('#js_delete_button')
    new_challenge_button    : $('#js_new_button')
    force_post_button       : $('#js_force_post')
    remove_response_buttons : $('.response .remove')
    remove_hopper_buttons   : $('.hopper .remove')
    select_all              : $('.select_all')
    logo                    : $('.logo a')
    ban_user                : $('button.ban_user')
    unban_user              : $('button.unban_user')

_original_prompt_text = _nodes.challenge_prompt.text()

_nodes.edit_challenge_button.on "click", ->
    if confirm "Update the prompt text?"
        _edit_challenge_prompt window.current_id, _nodes.challenge_prompt.text()
    else
        _nodes.challenge_prompt.text _original_prompt_text

_nodes.delete_challenge_button.on "click", ->
    if confirm "Really delete the entire challenge and all responses?"
        _delete_challenge window.current_id

_nodes.remove_response_buttons.on "click", ->
    if confirm "Delete this response?"
        _remove_response $(this).closest(".response").data("id")

_nodes.remove_hopper_buttons.on "click", ->
    if confirm "Remove this challenge from the hopper?"
        _remove_from_hopper _get_list_index this, _nodes.remove_hopper_buttons

_nodes.force_post_button.on "click", ->
    if confirm "Are you sure you want to send this challenge to everyone?"
        _force_challenge_post()

_nodes.logo.on "click", ->
    document.location.href = "/admin/new"

_nodes.ban_user.on "click", ->
    if confirm "Are you sure you want to BAN this user?!"
        user_id = $(this).data("id")
        _ban_user user_id

_nodes.unban_user.on "click", ->
    if confirm "Are you sure you want to UNban this user?"
        user_id = $(this).data("id")
        _unban_user user_id

_nodes.type_dropdown.on "change", ->
    value = $(this).val()
    _nodes.new_challenge_forms.hide()
    _nodes.new_challenge_forms.closest(".#{value}").show()

# Text selection on focus helper
_nodes.select_all.on "focus", ->
    target = this
    setTimeout ->
        if window.getSelection && document.createRange
            range = document.createRange()
            range.selectNodeContents(target)
            sel = window.getSelection()
            sel.removeAllRanges()
            sel.addRange(range)
        else if document.body.createTextRange
            range = document.body.createTextRange()
            range.moveToElementText(target)
            range.select()
    , 1

# This gets called before a new prompt challenge is submitted
window.new_challenge = (target) ->
    text = $(target).find('p.challenge_prompt').text()
    _nodes.new_challenge_input.val text
    return true

# Helper for get_creative.coffee
window.IS_ADMIN = true
