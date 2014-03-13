milestone_number = 0

class @AssigneeModel extends Backbone.Model
 
class @AssigneeCollection extends Backbone.Collection
  model: AssigneeModel
  initialize: (options) ->
      repository = options.repository
      @url = "https://api.github.com/repos/#{repository.get('full_name')}/assignees"
       

class @MilestoneModel extends Backbone.Model
 
class @MilestoneCollection extends Backbone.Collection
  model: MilestoneModel
  initialize: (options) ->
      repository = options.repository
      @url = "https://api.github.com/repos/#{repository.get('full_name')}/milestones"


          
class @NewIssueView extends Backbone.View

  className: 'new-issue'
   
  events:
    "submit form" : "onSubmit"
    "change #repo_list" :"changeMenu"
    "load document" :"changeMenu"
  initialize: (@options) ->
    @repositories = @options.repositories
    

  render: ->
    @$el.html(HAML['new_issue'](repositories: @repositories))
    @$('select').select2()
    

  onSubmit: (e) ->
    e.preventDefault()
    name = @$("[name=repository]").val()
    assignee_name = @$("[name=assignee]").val()
    mile_name = @$("[name=milestone]").val()
    localStorage['new_issue_last_repo'] = name
    repository = @repositories.find (r) -> r.get('full_name') == name
    model = new IssueModel({
      body: @$("[name=body]").val()
      title: @$("[name=title]").val()
    }, {repository: repository})
    model.set('assignee':assignee_name,'milestone':milestone_number)

    model.save {},
      success: (model) =>
        @badge = new Badge()
        @badge.addIssues(1)
        @$('.message').html("<span>Issue <a href=\"#{model.get("html_url")}\" target=\"_blank\">##{model.get('number')}</a> was created!</span>")
      error: =>
        @$('.message').html("<span>Failed to create issue :(</span>")

  changeMenu: (e) ->
    e.preventDefault()
    @$('#assignee').empty();
    name = @$("[name=repository]").val()
    repository = @repositories.find (r) -> r.get('full_name') == name
    url = repository.assigneesUrl()
    
    @assigneeCollection = new AssigneeCollection (repository: repository)
    @assigneeCollection.fetch
      success: (collection) =>
       for asg in @assigneeCollection.models
         opt = document.createElement("option")
         opt.value = asg.get("login")
         opt.text = asg.get("login")
         @$('#assignee').append(opt)
           
       
      error: @renderErrors
    
    @milestoneCollection = new MilestoneCollection (repository: repository)
    @milestoneCollection.fetch
      success: (collection) =>
       for msg in @milestoneCollection.models
         opt = document.createElement("option")
         opt.value = msg.get("title")
         opt.text = msg.get("title")
         @$('#milestone').append(opt)
         milestone_number = msg.get("number")    
       
      error: @renderErrors
            
       
