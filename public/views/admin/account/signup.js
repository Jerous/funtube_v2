/* global app:true */

'use strict';

var app = app || {};

app.Signupform = Backbone.Model.extend({
    url: function() {
        return 'http://localhost:3002/administrator/signup'
    },
    defaults: {
        success: false,
        errors: [],
        errfor: {},
        username: '',
        password: ''
    }
});

app.SignupformView = Backbone.View.extend({
    el: '#form-section',
    events: {
    'submit form': 'preventSubmit',
    'keypress [name="password"]': 'signupOnEnter',
    'click .btn-signup': 'signup'
    },
    initialize: function() {
        this.model = new app.Signupform();
        this.template = _.template($('#tmpl-signup').html());
        this.listenTo(this.model, 'change', this.render);
        this.render();       
    },
    render: function() {
        this.$el.html(this.template( this.model.attributes ));
        return this;
    },
    preventSubmit: function(event) {
        event.preventDefault();
    },
    signupOnEnter: function(event) {
        if (event.keyCode !== 13) { return; }
        if ($(event.target).attr('name') !== 'password') { return; }
        event.preventDefault();
        this.signup();
    },
    signup: function() {
        this.model.save({
            username: this.$el.find('[name="username"]').val(),
            password: this.$el.find('[name="password"]').val()
        },{
            success: function(model, response) {
                if (response.success) {
                    location.href = '/administrator/';
                }
                else {
                    model.set(response);
                }
            }
        });
    }
});

$(document).ready(function() {
    app.signupformView = new app.SignupformView();
});